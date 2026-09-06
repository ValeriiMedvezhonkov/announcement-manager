import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { GroupBase, MenuProps } from 'react-select';
import Select, { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import { useBodyScrollLock } from '../../../shared/lib/useBodyScrollLock.ts';
import { useIsMobile } from '../../../shared/lib/useMediaQuery.ts';
import { SHEET_ANIMATION_MS, useSheetDrag } from '../../../shared/ui/sheet/useSheetDrag.ts';
import sheetStyles from '../../../shared/ui/sheet/Sheet.module.css';
import { useMenuPlacement } from '../hooks/useMenuPlacement.ts';
import { buildCategorySelectStyles } from './category-select-styles.ts';

export interface CategoryOption {
  value: string;
  label: string;
}

interface CategorySelectProps {
  options: CategoryOption[];
  value: CategoryOption[];
  onChange: (selected: CategoryOption[]) => void;
  /** When set, unknown entries can be created inline ("Create \"...\""). */
  onCreateOption?: (name: string) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  placeholder?: string;
  inputId?: string;
  'aria-label'?: string;
}

type SelectMenuProps = MenuProps<CategoryOption, true, GroupBase<CategoryOption>>;

/**
 * Multi-select for categories.
 *
 * On desktop/tablet the menu is a regular dropdown, flipped above the control
 * when viewport space below is short. On mobile viewports the same menu
 * renders as a bottom sheet with a backdrop, slide-up/down animation and a
 * drag handle that dismisses on swipe-down — the viewport decision is owned
 * here, callers never branch on screen size.
 */
export function CategorySelect(props: CategorySelectProps) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | null>(null);
  const instanceId = useId();
  const { placement, measure } = useMenuPlacement(wrapperRef);

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
      }
    };
  }, []);

  // The select's own input must stay typable (it filters and creates
  // categories), so only scrolling is locked here — no inert.
  useBodyScrollLock(isMobile && menuOpen);

  /** Mobile closes with a slide-down; desktop closes immediately. */
  const closeMenu = useCallback(() => {
    if (!isMobile) {
      setMenuOpen(false);
      return;
    }
    setClosing(true);
    // Only unmount here; `closing` resets on the next open. Clearing it while
    // the menu is still mounted would revert the slide-down for a frame.
    closeTimer.current = window.setTimeout(() => {
      setMenuOpen(false);
    }, SHEET_ANIMATION_MS);
  }, [isMobile]);

  /** Drag-to-dismiss via the shared sheet gesture. Both arguments must be
   * referentially stable: the handler feeds the memoized Menu component, and
   * a new identity would make react-select remount the menu on every render,
   * replaying the entry animation. */
  const getSheetNode = useCallback(() => sheetRef.current, []);
  const dismissSheet = useCallback(() => {
    setMenuOpen(false);
  }, []);
  const onHandlePointerDown = useSheetDrag(getSheetNode, dismissSheet);

  /** Menu wrapper: captures the sheet node and adds the drag handle on mobile. */
  const MenuComponent = useMemo(() => {
    function SheetMenu(menuProps: SelectMenuProps) {
      return (
        <components.Menu
          {...menuProps}
          innerRef={(node: HTMLDivElement | null) => {
            sheetRef.current = node;
            if (typeof menuProps.innerRef === 'function') {
              menuProps.innerRef(node);
            }
          }}
        >
          <div className={sheetStyles.handleArea} onPointerDown={onHandlePointerDown} aria-hidden>
            <div className={sheetStyles.handle} />
          </div>
          {menuProps.children}
        </components.Menu>
      );
    }
    return SheetMenu;
  }, [onHandlePointerDown]);

  const shared = {
    inputId: props.inputId,
    instanceId,
    'aria-label': props['aria-label'],
    isMulti: true as const,
    options: props.options,
    value: props.value,
    isLoading: props.isLoading,
    isDisabled: props.isDisabled,
    placeholder: props.placeholder ?? 'Select categories',
    noOptionsMessage: () => 'No categories found',
    onChange: (selected: readonly CategoryOption[]) => {
      props.onChange([...selected]);
    },
    menuIsOpen: menuOpen,
    onMenuOpen: () => {
      setClosing(false);
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      measure();
      setMenuOpen(true);
    },
    onMenuClose: closeMenu,
    components: isMobile ? { Menu: MenuComponent } : undefined,
    // Always portal the menu: the app shell clips overflow for its rounded
    // frame, and a portal is the one placement no ancestor can clip.
    menuPortalTarget: document.body,
    // Flip above the control when the space below is too small (desktop only;
    // the mobile sheet is pinned to the bottom regardless).
    menuPlacement: isMobile ? ('bottom' as const) : placement,
    // Never scroll the page on open — that reads as the whole layout jumping.
    menuShouldScrollIntoView: false,
    // Fixed positioning makes placement measure against the viewport. Close on
    // page scroll so a fixed menu can never drift away from its control.
    menuPosition: 'fixed' as const,
    closeMenuOnScroll: (event: Event) => !isMobile && event.target === document,
    styles: buildCategorySelectStyles(
      isMobile,
      closing,
      SHEET_ANIMATION_MS,
      props.isInvalid ?? false,
    ),
    classNames: {
      menu: () => (isMobile ? sheetStyles.menuEnter : ''),
    },
    // The sheet must stay open while picking several categories on mobile.
    closeMenuOnSelect: !isMobile,
    blurInputOnSelect: false,
  };

  return (
    <div ref={wrapperRef}>
      {isMobile && menuOpen && (
        <div
          className={closing ? sheetStyles.backdropClosing : sheetStyles.backdrop}
          onPointerDown={(event) => {
            event.preventDefault();
            closeMenu();
          }}
          aria-hidden
        />
      )}
      {props.onCreateOption ? (
        <CreatableSelect
          {...shared}
          formatCreateLabel={(input) => `Create "${input}"`}
          onCreateOption={props.onCreateOption}
        />
      ) : (
        <Select {...shared} />
      )}
    </div>
  );
}

import type { CSSObjectWithLabel, GroupBase, StylesConfig } from 'react-select';

import type { CategoryOption } from './CategorySelect.tsx';

/**
 * react-select styles mapped onto the design tokens. `isMobile` switches the
 * menu into its bottom-sheet shape; `closing` drives the slide-down exit.
 */
export function buildCategorySelectStyles(
  isMobile: boolean,
  closing: boolean,
  animationMs: number,
  isInvalid: boolean,
): StylesConfig<CategoryOption, true, GroupBase<CategoryOption>> {
  // An invalid control stays visibly invalid even while focused.
  const borderColor = isInvalid ? 'var(--danger)' : 'var(--border-strong)';
  const focusColor = isInvalid ? 'var(--danger)' : 'var(--focus-ring)';

  return {
    control: (base, state) => ({
      ...base,
      minHeight: 42,
      borderRadius: 8,
      // react-select's default 100ms all-property transition kept restarting,
      // freezing border-color at its start value — the invalid red never
      // became visible. State colors must apply instantly.
      transition: 'none',
      borderColor: state.isFocused ? focusColor : borderColor,
      boxShadow: state.isFocused ? `0 0 0 1px ${focusColor}` : 'none',
      ':hover': {
        borderColor: state.isFocused
          ? focusColor
          : isInvalid
            ? 'var(--danger)'
            : 'var(--ink-faint)',
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'var(--surface-sunken)',
      border: '1px solid var(--border-default)',
      borderRadius: 6,
    }),
    multiValueLabel: (base) => ({ ...base, fontWeight: 700, color: 'var(--ink-body)' }),
    multiValueRemove: (base) => ({
      ...base,
      color: 'var(--ink-muted)',
      ':hover': { backgroundColor: 'var(--border-default)', color: 'var(--ink-strong)' },
    }),
    option: (base, state) => ({
      ...base,
      color: 'var(--ink-body)',
      backgroundColor: state.isFocused ? 'var(--accent-soft)' : 'transparent',
      ':active': { backgroundColor: 'var(--accent-soft-hover)' },
      padding: isMobile ? '14px 16px' : base.padding,
    }),
    menu: (base): CSSObjectWithLabel =>
      isMobile
        ? {
            ...base,
            position: 'fixed',
            top: 'auto',
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            margin: 0,
            borderRadius: '16px 16px 0 0',
            boxShadow: 'var(--shadow-overlay)',
            zIndex: 70,
            ...(closing && {
              transform: 'translateY(105%)',
              transition: `transform ${String(animationMs)}ms ease`,
            }),
          }
        : base,
    // Desktop keeps the placer-computed maxHeight so the menu always fits the
    // viewport; only the mobile sheet imposes its own height.
    menuList: (base) => (isMobile ? { ...base, maxHeight: '60vh' } : base),
    menuPortal: (base) => ({ ...base, zIndex: 70 }),
  };
}

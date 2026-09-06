import { useCallback, useState, type RefObject } from 'react';

/** Estimated menu height incl. margin, used to decide the open direction. */
const MENU_SPACE = 320;

/**
 * Measures a control against the viewport on demand and yields the direction
 * a dropdown should open. Used instead of react-select's own auto placement,
 * which is unreliable when the menu renders in a portal.
 */
export function useMenuPlacement(anchorRef: RefObject<HTMLElement | null>): {
  placement: 'bottom' | 'top';
  measure: () => void;
} {
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');

  const measure = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect !== undefined) {
      const spaceBelow = window.innerHeight - rect.bottom;
      setPlacement(spaceBelow < MENU_SPACE && rect.top > MENU_SPACE ? 'top' : 'bottom');
    }
  }, [anchorRef]);

  return { placement, measure };
}

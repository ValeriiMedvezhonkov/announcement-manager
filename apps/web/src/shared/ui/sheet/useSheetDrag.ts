import { useCallback, useEffect, useRef } from 'react';

/** Duration of the sheet slide animations. */
export const SHEET_ANIMATION_MS = 220;
/** Drag distance beyond which releasing dismisses the sheet. */
const DRAG_DISMISS_PX = 110;

/**
 * Drag-to-dismiss gesture for bottom sheets.
 *
 * Returns a pointerdown handler for the sheet's grab handle. While dragging,
 * the sheet node follows the pointer via a direct transform (no re-renders);
 * releasing past the threshold slides it off-screen and calls `onDismiss`,
 * anything shorter springs back.
 */
export function useSheetDrag(
  getSheet: () => HTMLElement | null,
  onDismiss: () => void,
): (down: React.PointerEvent<HTMLElement>) => void {
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  return useCallback(
    (down: React.PointerEvent<HTMLElement>) => {
      const sheet = getSheet();
      if (sheet === null) {
        return;
      }
      down.preventDefault();
      const startY = down.clientY;
      sheet.style.transition = 'none';

      const onMove = (move: PointerEvent): void => {
        const delta = Math.max(0, move.clientY - startY);
        sheet.style.transform = `translateY(${String(delta)}px)`;
      };

      const onUp = (up: PointerEvent): void => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
        const delta = Math.max(0, up.clientY - startY);
        sheet.style.transition = `transform ${String(SHEET_ANIMATION_MS)}ms ease`;
        if (delta > DRAG_DISMISS_PX) {
          sheet.style.transform = 'translateY(105%)';
          timer.current = window.setTimeout(() => {
            onDismiss();
            sheet.style.transform = '';
            sheet.style.transition = '';
          }, SHEET_ANIMATION_MS);
        } else {
          sheet.style.transform = 'translateY(0)';
        }
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      // A cancelled gesture (system swipe, scroll takeover) must also settle
      // the sheet, or the listeners leak and the sheet sticks mid-drag.
      document.addEventListener('pointercancel', onUp);
    },
    [getSheet, onDismiss],
  );
}

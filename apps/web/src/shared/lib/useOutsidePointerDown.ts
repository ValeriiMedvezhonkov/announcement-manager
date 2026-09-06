import { useEffect } from 'react';

/**
 * Invokes `onOutside` for any pointerdown that `isInside` does not claim.
 * Listens in the capture phase so overlays cannot swallow the event first.
 */
export function useOutsidePointerDown(
  active: boolean,
  isInside: (target: EventTarget | null) => boolean,
  onOutside: () => void,
): void {
  useEffect(() => {
    if (!active) {
      return;
    }
    const onPointerDown = (event: PointerEvent): void => {
      if (!isInside(event.target)) {
        onOutside();
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [active, isInside, onOutside]);
}

import { useEffect } from 'react';

/** Number of overlays currently requesting a lock (sheets can stack). */
let lockCount = 0;
let savedScrollY = 0;

function applyLock(): void {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    const { style } = document.body;
    style.position = 'fixed';
    style.top = `-${String(savedScrollY)}px`;
    style.left = '0';
    style.right = '0';
    style.overflow = 'hidden';
  }
  lockCount += 1;
}

function releaseLock(): void {
  lockCount -= 1;
  if (lockCount === 0) {
    const { style } = document.body;
    style.position = '';
    style.top = '';
    style.left = '';
    style.right = '';
    style.overflow = '';
    window.scrollTo(0, savedScrollY);
  }
}

/**
 * Locks page scrolling while `active` (used by bottom sheets and modals).
 * Uses the fixed-body technique so iOS Safari cannot rubber-band the page
 * behind the overlay; the scroll position is restored on release.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) {
      return;
    }
    applyLock();
    return releaseLock;
  }, [active]);
}

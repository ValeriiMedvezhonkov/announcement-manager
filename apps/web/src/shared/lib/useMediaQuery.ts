import { useSyncExternalStore } from 'react';

/**
 * Reactively tracks a CSS media query. Drives viewport-dependent behaviour
 * such as the mobile navigation drawer and, later, the bottom-sheet variant
 * of overlay components.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => {
        list.removeEventListener('change', onChange);
      };
    },
    () => window.matchMedia(query).matches,
  );
}

/** Single breakpoint separating the mobile experience from desktop/tablet. */
export const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${String(MOBILE_BREAKPOINT - 1)}px)`);
}

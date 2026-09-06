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

/**
 * Single breakpoint separating the mobile experience from desktop/tablet.
 *
 * CSS media queries cannot read this constant, so the value is mirrored as
 * `@media (max-width: 767px)` in the *.module.css files. When changing it,
 * update every mirror: `grep -rn "767px" apps/web/src --include='*.css'`.
 */
export const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${String(MOBILE_BREAKPOINT - 1)}px)`);
}

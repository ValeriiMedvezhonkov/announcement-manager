import { Toaster } from 'sonner';

import styles from './AppToaster.module.css';

/**
 * App-wide toast outlet. Unstyled Sonner with the design-token palette:
 * green success, red error, neutral info, brand-amber realtime. Positions are
 * per-toast (see shared/lib/notify.ts); this only owns the look.
 */
export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: styles.toast,
          title: styles.title,
          success: styles.success,
          error: styles.error,
          info: styles.info,
        },
      }}
    />
  );
}

import { toast } from 'sonner';

import toastStyles from '@shared/ui/toast/AppToaster.module.css';

/**
 * Central notification facade. Every toast in the app goes through here, so
 * placement policy lives in exactly one place:
 *
 * - success / info — quiet confirmations, bottom-right, out of the work area
 * - error          — needs attention, top-center
 * - realtime       — pushed events (e.g. new announcements), top-right
 *
 * Call sites state intent (notify.success(...)); they never pick positions.
 */
export const notify = {
  success(message: string): void {
    toast.success(message, { position: 'bottom-right' });
  },

  info(message: string): void {
    toast.info(message, { position: 'bottom-right' });
  },

  error(message: string): void {
    toast.error(message, { position: 'top-center', duration: 6000 });
  },

  /** Server-pushed events (realtime announcements) in the brand accent. */
  realtime(message: string): void {
    toast.message(message, { position: 'top-right', className: toastStyles.realtime });
  },
};

import { getListAnnouncementsQueryKey } from '@announcement-manager/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

import { notify } from '../../../shared/lib/notify.ts';
import { t } from '../../../shared/i18n/index.ts';

interface AnnouncementCreatedPayload {
  id: string;
  title: string;
}

const SOCKET_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';

/**
 * Single managed realtime connection for the whole app (mounted once in the
 * providers — never per component/render). On announcement.created from
 * another client, shows an in-app toast and refreshes the list.
 */
export function useAnnouncementRealtime(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      // Fall back to polling automatically; reconnection is built in.
      transports: ['websocket', 'polling'],
    });

    socket.on('announcement.created', (payload: AnnouncementCreatedPayload) => {
      notify.realtime(t('toast.announcement.realtime', { title: payload.title }));
      void queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
}

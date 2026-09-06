import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';

import { useAnnouncementRealtime } from '../../features/announcements/hooks/useAnnouncementRealtime.ts';
import { ErrorBoundary } from '../../shared/ui/ErrorBoundary.tsx';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RealtimeBridge />
        {children}
        {/* Default only; every notify.* call sets its own position. */}
        <Toaster position="bottom-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function RealtimeBridge() {
  useAnnouncementRealtime();
  return null;
}

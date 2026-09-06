import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

import { AdminLayout } from '../../layouts/AdminLayout/AdminLayout.tsx';
import { PageLoader } from '../../shared/ui/PageLoader.tsx';
import { RouteErrorFallback } from '../../shared/ui/RouteErrorFallback.tsx';

/**
 * Pages are code-split per route: the list is the landing experience, while
 * the create/edit pages carry the heavy form stack (date picker, select,
 * form + schema libraries) that most visits never need up front.
 */
function lazyPage(load: () => Promise<Record<string, ComponentType>>, name: string) {
  const Component = lazy(async () => {
    const module = await load();
    return { default: module[name] };
  });
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      // The error element sits inside the layout route, so router-caught
      // errors keep the app chrome and use the styled fallback.
      { index: true, element: <Navigate to="/announcements" replace /> },
      {
        path: 'announcements',
        element: lazyPage(() => import('../../pages/AnnouncementsPage.tsx'), 'AnnouncementsPage'),
        errorElement: <RouteErrorFallback />,
      },
      {
        path: 'announcements/new',
        element: lazyPage(
          () => import('../../pages/CreateAnnouncementPage.tsx'),
          'CreateAnnouncementPage',
        ),
        errorElement: <RouteErrorFallback />,
      },
      {
        path: 'announcements/:id',
        element: lazyPage(
          () => import('../../pages/EditAnnouncementPage.tsx'),
          'EditAnnouncementPage',
        ),
        errorElement: <RouteErrorFallback />,
      },
      {
        path: '*',
        element: lazyPage(() => import('../../pages/NotFoundPage.tsx'), 'NotFoundPage'),
      },
    ],
  },
]);

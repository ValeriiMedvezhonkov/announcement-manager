import { createBrowserRouter, Navigate } from 'react-router';

import { AdminLayout } from '../../layouts/AdminLayout/AdminLayout.tsx';
import { AnnouncementsPage } from '../../pages/AnnouncementsPage.tsx';
import { CreateAnnouncementPage } from '../../pages/CreateAnnouncementPage.tsx';
import { EditAnnouncementPage } from '../../pages/EditAnnouncementPage.tsx';
import { NotFoundPage } from '../../pages/NotFoundPage.tsx';
import { RouteErrorFallback } from '../../shared/ui/RouteErrorFallback.tsx';

export const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      // The error element sits inside the layout route, so router-caught
      // errors keep the app chrome and use the styled fallback.
      { index: true, element: <Navigate to="/announcements" replace /> },
      {
        path: 'announcements',
        element: <AnnouncementsPage />,
        errorElement: <RouteErrorFallback />,
      },
      {
        path: 'announcements/new',
        element: <CreateAnnouncementPage />,
        errorElement: <RouteErrorFallback />,
      },
      {
        path: 'announcements/:id',
        element: <EditAnnouncementPage />,
        errorElement: <RouteErrorFallback />,
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

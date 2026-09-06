import { RouterProvider } from 'react-router';

import { router } from './router/router.tsx';
import { AppProviders } from './providers/AppProviders.tsx';

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

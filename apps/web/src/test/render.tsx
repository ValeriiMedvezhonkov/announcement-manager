import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';

/**
 * Renders a page element inside a real data router + fresh QueryClient.
 * Returns the router so tests can assert on URL state.
 */
export function renderPage(
  element: ReactElement,
  options: { path: string; initialEntry: string },
): { router: ReturnType<typeof createMemoryRouter> } {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const router = createMemoryRouter([{ path: options.path, element }], {
    initialEntries: [options.initialEntry],
  });

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { router };
}

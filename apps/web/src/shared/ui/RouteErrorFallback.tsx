import { useRouteError } from 'react-router';

import { Button } from './Button.tsx';
import { StateCard } from './StateCard.tsx';

/**
 * Route-level error element: the data router catches render/loader errors
 * before they can reach the top-level ErrorBoundary, so this brings the same
 * styled, recoverable fallback to router-caught errors.
 */
export function RouteErrorFallback() {
  const error = useRouteError();
  console.error('Route error', error);

  return (
    <StateCard
      alert
      title="Something went wrong"
      message="The page hit an unexpected error. Reloading usually resolves it."
    >
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          window.location.reload();
        }}
      >
        Reload page
      </Button>
    </StateCard>
  );
}

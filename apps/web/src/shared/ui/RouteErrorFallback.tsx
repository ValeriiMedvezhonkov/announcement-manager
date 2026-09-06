import { useRouteError } from 'react-router';

import { Button } from './Button.tsx';
import { StateCard } from './StateCard.tsx';
import { t } from '../i18n/index.ts';

/**
 * Route-level error element: the data router catches render/loader errors
 * before they can reach the top-level ErrorBoundary, so this brings the same
 * styled, recoverable fallback to router-caught errors.
 */
export function RouteErrorFallback() {
  const error = useRouteError();
  console.error('Route error', error);

  return (
    <StateCard alert title={t('error.page.title')} message={t('error.page.message')}>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          window.location.reload();
        }}
      >
        {t('error.page.reload')}
      </Button>
    </StateCard>
  );
}

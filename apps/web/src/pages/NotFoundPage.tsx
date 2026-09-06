import { Link } from 'react-router';

import { Button } from '../shared/ui/Button.tsx';
import { StateCard } from '../shared/ui/StateCard.tsx';
import styles from './NotFoundPage.module.css';
import { t } from '../shared/i18n/index.ts';

export function NotFoundPage() {
  return (
    <StateCard title={t('notFound.title')} message={t('notFound.message')}>
      <Link to="/announcements" className={styles.backLink}>
        <Button type="button" variant="secondary">
          {t('notFound.back')}
        </Button>
      </Link>
    </StateCard>
  );
}

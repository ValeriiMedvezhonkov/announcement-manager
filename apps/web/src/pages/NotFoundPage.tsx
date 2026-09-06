import { Link } from 'react-router';

import { Button } from '../shared/ui/Button.tsx';
import { StateCard } from '../shared/ui/StateCard.tsx';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <StateCard title="Page not found" message="The page you are looking for does not exist.">
      <Link to="/announcements" className={styles.backLink}>
        <Button type="button" variant="secondary">
          Go to announcements
        </Button>
      </Link>
    </StateCard>
  );
}

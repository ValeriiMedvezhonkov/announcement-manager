import styles from './ListSkeleton.module.css';
import { t } from '@shared/i18n/index.ts';

/** Shimmering placeholder rows shown while the list loads. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className={styles.skeleton} aria-label={t('list.loading.aria')}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={styles.row} />
      ))}
    </div>
  );
}

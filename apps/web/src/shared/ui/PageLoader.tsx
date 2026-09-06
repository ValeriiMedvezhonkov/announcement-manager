import { t } from '../i18n/index.ts';
import styles from './PageLoader.module.css';

export function PageLoader() {
  return (
    <div className={styles.loader} aria-label={t('common.loading.aria')}>
      <div className={styles.bar} />
      <div className={styles.bar} />
      <div className={styles.bar} />
    </div>
  );
}

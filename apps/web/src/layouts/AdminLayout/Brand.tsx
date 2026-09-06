import { Landmark } from 'lucide-react';

import styles from './Brand.module.css';
import { t } from '../../shared/i18n/index.ts';

/** Application brand row: icon tile + name. */
export function Brand() {
  return (
    <div className={styles.brand}>
      <span className={styles.icon}>
        <Landmark size={14} aria-hidden />
      </span>
      <span className={styles.name}>{t('brand.name')}</span>
    </div>
  );
}

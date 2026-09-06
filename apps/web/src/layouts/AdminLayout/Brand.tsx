import { Landmark } from 'lucide-react';

import styles from './Brand.module.css';

export const BRAND_NAME = 'Test city';

/** Application brand row: icon tile + name. */
export function Brand() {
  return (
    <div className={styles.brand}>
      <span className={styles.icon}>
        <Landmark size={14} aria-hidden />
      </span>
      <span className={styles.name}>{BRAND_NAME}</span>
    </div>
  );
}

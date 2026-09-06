import type { ReactNode } from 'react';

import styles from './CategoryChip.module.css';

export function CategoryChip({ children }: { children: ReactNode }) {
  return <span className={styles.chip}>{children}</span>;
}

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './IconButton.module.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  children: ReactNode;
}

/** Square borderless button for a single icon; label is mandatory. */
export function IconButton({ children, ...rest }: IconButtonProps) {
  return (
    <button type="button" className={styles.button} {...rest}>
      {children}
    </button>
  );
}

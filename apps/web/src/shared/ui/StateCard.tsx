import type { ReactNode } from 'react';

import styles from './StateCard.module.css';

interface StateCardProps {
  title: string;
  message: string;
  /** Action button(s) rendered under the message. */
  children?: ReactNode;
  /**
   * Marks the card as an error: screen readers announce it immediately via
   * role="alert". Leave unset for calm states (empty list, not found).
   */
  alert?: boolean;
}

/** Dashed panel used for empty, error and not-found states. */
export function StateCard(props: StateCardProps) {
  return (
    <div className={styles.card} role={props.alert ? 'alert' : undefined}>
      <h2 className={styles.title}>{props.title}</h2>
      <p className={styles.message}>{props.message}</p>
      {props.children}
    </div>
  );
}

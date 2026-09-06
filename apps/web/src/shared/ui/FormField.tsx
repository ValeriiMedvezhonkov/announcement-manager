import type { ReactNode } from 'react';

import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  /** Muted helper line under the label. */
  hint?: string;
  error?: string | undefined;
  /** id referenced by the control's aria-describedby; required with error. */
  errorId?: string;
  children: ReactNode;
}

/** Shared label + hint + error scaffold around a form control. */
export function FormField(props: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={props.htmlFor}>
        {props.label}
      </label>
      {props.hint !== undefined && <p className={styles.hint}>{props.hint}</p>}
      {props.children}
      {props.error !== undefined && (
        <p id={props.errorId} className={styles.error} role="alert">
          {props.error}
        </p>
      )}
    </div>
  );
}

import styles from './FormErrorSummary.module.css';

interface FormErrorSummaryProps {
  title: string;
  /** Field error messages; the box renders nothing when the list is empty. */
  messages: string[];
}

/**
 * Accessible validation-summary alert box shown above a form after a failed
 * submit, listing every failing field in addition to the per-field errors.
 */
export function FormErrorSummary(props: FormErrorSummaryProps) {
  if (props.messages.length === 0) {
    return null;
  }

  return (
    <div className={styles.box} role="alert">
      <p className={styles.title}>{props.title}</p>
      <ul className={styles.list}>
        {props.messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

import styles from './ListSkeleton.module.css';

/** Shimmering placeholder rows shown while the list loads. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className={styles.skeleton} aria-label="Loading announcements">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={styles.row} />
      ))}
    </div>
  );
}

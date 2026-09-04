import styles from './App.module.css';

export function App() {
  return (
    <div className={styles.shell}>
      <main className={styles.card}>
        <h1 className={styles.title}>Announcements</h1>
        <p className={styles.description}>
          The workspace is running. The administrative layout and announcement screens are built in
          the following steps.
        </p>
      </main>
    </div>
  );
}

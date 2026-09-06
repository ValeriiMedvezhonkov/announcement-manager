import { Component, type ErrorInfo, type ReactNode } from 'react';

import styles from './ErrorBoundary.module.css';
import { t } from '../i18n/index.ts';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Last line of defence: an unexpected render error shows a recoverable
 * fallback instead of a blank page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled render error', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className={styles.wrapper} role="alert">
        <div className={styles.card}>
          <h1 className={styles.title}>{t('error.page.title')}</h1>
          <p className={styles.message}>{t('error.page.messageLong')}</p>
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              window.location.reload();
            }}
          >
            {t('error.page.reload')}
          </button>
        </div>
      </div>
    );
  }
}

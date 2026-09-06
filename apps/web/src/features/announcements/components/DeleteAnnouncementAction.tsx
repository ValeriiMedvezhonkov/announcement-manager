import { useState } from 'react';

import { Button } from '@shared/ui/Button.tsx';
import styles from './DeleteAnnouncementAction.module.css';
import { t } from '@shared/i18n/index.ts';

interface DeleteAnnouncementActionProps {
  pending: boolean;
  onDelete: () => void;
}

/** Delete button with an inline confirm step (no browser dialogs). */
export function DeleteAnnouncementAction(props: DeleteAnnouncementActionProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setConfirming(true);
        }}
      >
        {t('delete.action')}
      </Button>
    );
  }

  return (
    <div className={styles.confirmGroup} role="alertdialog" aria-label={t('delete.confirm.aria')}>
      <span className={styles.confirmText}>{t('delete.confirm.question')}</span>
      <Button
        type="button"
        variant="secondary"
        disabled={props.pending}
        onClick={() => {
          setConfirming(false);
        }}
      >
        {t('delete.cancel')}
      </Button>
      <Button type="button" variant="danger" disabled={props.pending} onClick={props.onDelete}>
        {props.pending ? t('delete.deleting') : t('delete.action')}
      </Button>
    </div>
  );
}

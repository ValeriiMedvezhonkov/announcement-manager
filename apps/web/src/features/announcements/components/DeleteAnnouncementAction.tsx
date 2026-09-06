import { useState } from 'react';

import { Button } from '../../../shared/ui/Button.tsx';
import styles from './DeleteAnnouncementAction.module.css';

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
        Delete
      </Button>
    );
  }

  return (
    <div className={styles.confirmGroup} role="alertdialog" aria-label="Confirm deletion">
      <span className={styles.confirmText}>Delete this announcement?</span>
      <Button
        type="button"
        variant="secondary"
        disabled={props.pending}
        onClick={() => {
          setConfirming(false);
        }}
      >
        Cancel
      </Button>
      <Button type="button" variant="danger" disabled={props.pending} onClick={props.onDelete}>
        {props.pending ? 'Deleting…' : 'Delete'}
      </Button>
    </div>
  );
}

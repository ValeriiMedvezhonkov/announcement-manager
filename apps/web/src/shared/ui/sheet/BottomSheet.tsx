import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useBodyScrollLock } from '../../lib/useBodyScrollLock.ts';
import { SHEET_ANIMATION_MS, useSheetDrag } from './useSheetDrag.ts';
import styles from './Sheet.module.css';

interface BottomSheetProps {
  open: boolean;
  /** Called after the closing animation completes. */
  onClose: () => void;
  'aria-label': string;
  children: ReactNode;
}

/**
 * Generic mobile bottom sheet: portal, backdrop, slide-up/down animation,
 * Escape, backdrop tap and drag-handle swipe-down dismissal.
 */
export function BottomSheet(props: BottomSheetProps) {
  const [closing, setClosing] = useState(false);

  useBodyScrollLock(props.open);

  // The sheet portals outside the app root, so the whole app can be inerted:
  // nothing behind the sheet stays focusable or typable while it is open.
  useEffect(() => {
    if (!props.open) {
      return;
    }
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');
    return () => {
      root?.removeAttribute('inert');
    };
  }, [props.open]);

  const sheetRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const { onClose } = props;

  const close = useCallback(() => {
    if (closing) {
      return;
    }
    setClosing(true);
    // Deliberately only notify the parent here: resetting `closing` while the
    // sheet is still mounted would restore the un-translated class for a
    // frame, making the sheet pop back up before vanishing.
    closeTimer.current = window.setTimeout(onClose, SHEET_ANIMATION_MS);
  }, [closing, onClose]);

  // A pending close timer must not outlive a reopen: it would close the
  // freshly opened sheet.
  useEffect(() => {
    if (props.open && closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, [props.open]);

  // Reset the closing state on reopen (render-time derived-state adjustment).
  const [prevOpen, setPrevOpen] = useState(props.open);
  if (props.open !== prevOpen) {
    setPrevOpen(props.open);
    if (props.open && closing) {
      setClosing(false);
    }
  }

  const onHandlePointerDown = useSheetDrag(() => sheetRef.current, onClose);

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!props.open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [props.open, close]);

  if (!props.open) {
    return null;
  }

  return createPortal(
    <>
      <div
        className={closing ? styles.backdropClosing : styles.backdrop}
        onPointerDown={(event) => {
          // Without preventDefault the follow-up click lands on whatever sits
          // under the backdrop once the sheet unmounts — e.g. the very field
          // that opens this sheet, instantly reopening it.
          event.preventDefault();
          close();
        }}
        aria-hidden
      />
      <div
        ref={sheetRef}
        className={closing ? styles.sheetClosing : styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={props['aria-label']}
      >
        <div className={styles.handleArea} onPointerDown={onHandlePointerDown} aria-hidden>
          <div className={styles.handle} />
        </div>
        <div className={styles.content}>{props.children}</div>
      </div>
    </>,
    document.body,
  );
}

import { X } from 'lucide-react';
import { useEffect } from 'react';

import { useBodyScrollLock } from '../../shared/lib/useBodyScrollLock.ts';
import { IconButton } from '../../shared/ui/IconButton.tsx';
import { Brand } from './Brand.tsx';
import { SidebarNav } from './SidebarNav.tsx';
import styles from './MobileDrawer.module.css';
import { t } from '../../shared/i18n/index.ts';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** Slide-in navigation drawer for mobile viewports. */
export function MobileDrawer(props: MobileDrawerProps) {
  const { open, onClose } = props;

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      {open && <div className={styles.backdrop} onClick={onClose} aria-hidden />}
      <aside className={open ? styles.drawerOpen : styles.drawer} aria-hidden={!open}>
        <div className={styles.header}>
          <Brand />
          <IconButton aria-label={t('nav.close.aria')} onClick={onClose}>
            <X size={20} aria-hidden />
          </IconButton>
        </div>
        <SidebarNav onNavigate={onClose} />
      </aside>
    </>
  );
}

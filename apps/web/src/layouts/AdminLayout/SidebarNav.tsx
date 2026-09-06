import { Megaphone } from 'lucide-react';
import { NavLink } from 'react-router';

import styles from './SidebarNav.module.css';
import { t } from '@shared/i18n/index.ts';

interface SidebarNavProps {
  /** Called on navigation so the mobile drawer can close itself. */
  onNavigate?: () => void;
}

/** Main navigation links, shared by the sidebar and the mobile drawer. */
export function SidebarNav(props: SidebarNavProps) {
  return (
    <nav className={styles.nav} aria-label={t('nav.main.aria')}>
      <NavLink
        to="/announcements"
        className={({ isActive }) => (isActive ? styles.itemActive : styles.item)}
        onClick={props.onNavigate}
      >
        <Megaphone size={16} aria-hidden />
        <span>{t('nav.announcements')}</span>
      </NavLink>
    </nav>
  );
}

import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router';

import { useIsMobile } from '../../shared/lib/useMediaQuery.ts';
import { IconButton } from '../../shared/ui/IconButton.tsx';
import { Brand } from './Brand.tsx';
import { MobileDrawer } from './MobileDrawer.tsx';
import { SidebarNav } from './SidebarNav.tsx';
import styles from './AdminLayout.module.css';
import { t } from '../../shared/i18n/index.ts';

/**
 * Application chrome: brand + navigation sidebar and a content header.
 *
 * Desktop and tablet show a fixed sidebar; on mobile it becomes a slide-in
 * drawer behind a hamburger button.
 */
export function AdminLayout() {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={styles.viewport}>
      <div className={styles.shell}>
        {isMobile ? (
          <>
            <header className={styles.mobileHeader}>
              <IconButton
                aria-label={drawerOpen ? t('nav.close.aria') : t('nav.open.aria')}
                aria-expanded={drawerOpen}
                onClick={() => {
                  setDrawerOpen((open) => !open);
                }}
              >
                <Menu size={20} aria-hidden />
              </IconButton>
              <Brand />
            </header>
            <MobileDrawer
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false);
              }}
            />
          </>
        ) : (
          <aside className={styles.sidebar}>
            <div className={styles.sidebarBrand}>
              <Brand />
            </div>
            <SidebarNav />
          </aside>
        )}

        <div className={styles.main}>
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

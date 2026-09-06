import type { AnnouncementResponseDto } from '@announcement-manager/api-client';
import { Pencil } from 'lucide-react';
import { Link } from 'react-router';

import { CategoryChip } from '@shared/ui/CategoryChip.tsx';
import {
  formatLastUpdate,
  formatRelativeUpdate,
  splitDateParts,
} from '@features/announcements/utils/dates.ts';
import styles from './AnnouncementsTable.module.css';
import { t } from '@shared/i18n/index.ts';

/** Two-line date cell: primary reading on top, secondary muted below. */
function DateCell({ main, sub }: { main: string; sub: string }) {
  return (
    <td className={styles.tdDate}>
      <span className={styles.dateMain}>{main}</span>
      <span className={styles.dateSub}>{sub}</span>
    </td>
  );
}

/** Desktop table of announcements, ordered by last update. */
export function AnnouncementsTable({ items }: { items: AnnouncementResponseDto[] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>{t('list.header.title')}</th>
          <th className={styles.th}>{t('list.header.publicationDate')}</th>
          <th className={styles.th}>{t('list.header.lastUpdate')}</th>
          <th className={styles.th}>{t('list.header.categories')}</th>
          <th className={styles.thAction}>
            <span className={styles.visuallyHidden}>{t('list.header.actions')}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((announcement) => {
          const published = splitDateParts(announcement.publicationDate);
          return (
            <tr key={announcement.id} className={styles.row}>
              <td className={styles.tdTitle}>{announcement.title}</td>
              <DateCell main={published.date} sub={published.time} />
              <DateCell
                main={formatRelativeUpdate(announcement.lastUpdate)}
                sub={formatLastUpdate(announcement.lastUpdate)}
              />
              <td className={styles.td}>
                <span className={styles.chips}>
                  {announcement.categories.map((category) => (
                    <CategoryChip key={category.id}>{category.name}</CategoryChip>
                  ))}
                </span>
              </td>
              <td className={styles.tdAction}>
                <Link
                  to={`/announcements/${announcement.id}`}
                  className={styles.editLink}
                  aria-label={t('list.edit.aria', { title: announcement.title })}
                >
                  <Pencil size={15} aria-hidden />
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

import type { AnnouncementResponseDto } from '@announcement-manager/api-client';
import { Pencil } from 'lucide-react';
import { Link } from 'react-router';

import { CategoryChip } from '../../../shared/ui/CategoryChip.tsx';
import { formatPublicationDate, formatRelativeUpdate } from '../utils/dates.ts';
import styles from './AnnouncementCardList.module.css';

/** Mobile card list; each card links to the announcement's edit page. */
export function AnnouncementCardList({ items }: { items: AnnouncementResponseDto[] }) {
  return (
    <ul className={styles.cardList}>
      {items.map((announcement) => (
        <li key={announcement.id}>
          <Link
            to={`/announcements/${announcement.id}`}
            className={styles.card}
            aria-label={`Edit "${announcement.title}"`}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{announcement.title}</span>
              <Pencil size={15} aria-hidden className={styles.cardEditIcon} />
            </div>
            <p className={styles.cardMeta}>
              Published {formatPublicationDate(announcement.publicationDate)}
            </p>
            <p className={styles.cardMeta}>
              Updated {formatRelativeUpdate(announcement.lastUpdate)}
            </p>
            <span className={styles.cardChips}>
              {announcement.categories.map((category) => (
                <CategoryChip key={category.id}>{category.name}</CategoryChip>
              ))}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

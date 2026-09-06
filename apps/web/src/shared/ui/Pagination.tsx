import { ChevronLeft, ChevronRight } from 'lucide-react';

import styles from './Pagination.module.css';
import { t } from '@shared/i18n/index.ts';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ELLIPSIS = '…';

/**
 * Numbered pages with a window around the current page: first and last are
 * always visible, gaps collapse into ellipses (1 … 4 [5] 6 … 12).
 */
function pageItems(page: number, totalPages: number): (number | typeof ELLIPSIS)[] {
  const wanted = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted]
    .filter((candidate) => candidate >= 1 && candidate <= totalPages)
    .sort((a, b) => a - b);

  const items: (number | typeof ELLIPSIS)[] = [];
  let previous = 0;
  for (const current of pages) {
    if (current - previous === 2) {
      items.push(previous + 1);
    } else if (current - previous > 2) {
      items.push(ELLIPSIS);
    }
    items.push(current);
    previous = current;
  }
  return items;
}

export function Pagination(props: PaginationProps) {
  if (props.totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.pagination} aria-label={t('pagination.aria')}>
      <button
        type="button"
        className={styles.arrow}
        disabled={props.page <= 1}
        aria-label={t('pagination.previous.aria')}
        onClick={() => {
          props.onPageChange(props.page - 1);
        }}
      >
        <ChevronLeft size={16} aria-hidden />
      </button>

      {pageItems(props.page, props.totalPages).map((item, index) =>
        item === ELLIPSIS ? (
          <span key={`ellipsis-${String(index)}`} className={styles.ellipsis} aria-hidden>
            {ELLIPSIS}
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={item === props.page ? styles.pageActive : styles.page}
            aria-current={item === props.page ? 'page' : undefined}
            aria-label={t('pagination.page.aria', { page: item })}
            onClick={() => {
              props.onPageChange(item);
            }}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className={styles.arrow}
        disabled={props.page >= props.totalPages}
        aria-label={t('pagination.next.aria')}
        onClick={() => {
          props.onPageChange(props.page + 1);
        }}
      >
        <ChevronRight size={16} aria-hidden />
      </button>
    </nav>
  );
}

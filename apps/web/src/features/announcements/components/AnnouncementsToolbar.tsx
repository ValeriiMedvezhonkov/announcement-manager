import { Search } from 'lucide-react';

import { CategorySelect, type CategoryOption } from './CategorySelect.tsx';
import styles from './AnnouncementsToolbar.module.css';
import { t } from '../../../shared/i18n/index.ts';

interface AnnouncementsToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  categoryOptions: CategoryOption[];
  selectedCategoryIds: string[];
  onCategoryChange: (ids: string[]) => void;
  categoriesLoading: boolean;
}

/** Search box and category filter above the announcements list. */
export function AnnouncementsToolbar(props: AnnouncementsToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchBox}>
        <Search size={16} aria-hidden className={styles.searchIcon} />
        <input
          type="search"
          className={styles.searchInput}
          placeholder={t('list.search.placeholder')}
          aria-label={t('list.search.aria')}
          value={props.searchValue}
          onChange={(event) => {
            props.onSearchChange(event.target.value);
          }}
        />
      </div>
      <div className={styles.filterBox}>
        <CategorySelect
          aria-label={t('list.filter.aria')}
          placeholder={t('list.filter.placeholder')}
          options={props.categoryOptions}
          isLoading={props.categoriesLoading}
          value={props.categoryOptions.filter((option) =>
            props.selectedCategoryIds.includes(option.value),
          )}
          onChange={(selected) => {
            props.onCategoryChange(selected.map((option) => option.value));
          }}
        />
      </div>
    </div>
  );
}

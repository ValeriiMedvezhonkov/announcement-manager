import { useListAnnouncements, useListCategories } from '@announcement-manager/api-client';
import { keepPreviousData } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { AnnouncementCardList } from '../features/announcements/components/AnnouncementCardList.tsx';
import { AnnouncementsTable } from '../features/announcements/components/AnnouncementsTable.tsx';
import { AnnouncementsToolbar } from '../features/announcements/components/AnnouncementsToolbar.tsx';
import { ListSkeleton } from '../features/announcements/components/ListSkeleton.tsx';
import type { CategoryOption } from '../features/announcements/components/CategorySelect.tsx';
import { useAnnouncementListParams } from '../features/announcements/hooks/useAnnouncementListParams.ts';
import { useDebouncedValue } from '../features/announcements/hooks/useDebouncedValue.ts';
import { useIsMobile } from '../shared/lib/useMediaQuery.ts';
import { Button } from '../shared/ui/Button.tsx';
import { Pagination } from '../shared/ui/Pagination.tsx';
import { StateCard } from '../shared/ui/StateCard.tsx';
import styles from './AnnouncementsPage.module.css';
import { t } from '../shared/i18n/index.ts';

const PAGE_SIZE = 5;
const SEARCH_DEBOUNCE_MS = 300;

export function AnnouncementsPage() {
  const isMobile = useIsMobile();
  const { params, setSearch, setCategoryIds, setPage, clearFilters } = useAnnouncementListParams();

  // Local input state gives instant typing; the URL (and query) follow debounced.
  const [searchInput, setSearchInput] = useState(params.search);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  // URL -> input: external changes (sidebar nav, back/forward, shared links)
  // win over stale local state. Without this, the one-way sync below would
  // instantly re-apply the old search and the navigation would appear dead.
  const lastUrlSearch = useRef(params.search);
  useEffect(() => {
    if (params.search !== lastUrlSearch.current) {
      lastUrlSearch.current = params.search;
      setSearchInput(params.search);
    }
  }, [params.search]);

  // input -> URL: pushed only when the DEBOUNCED value changes, comparing
  // against the live URL via ref so an external change never gets overwritten
  // by a stale debounce tick.
  const paramsSearchRef = useRef(params.search);
  useEffect(() => {
    paramsSearchRef.current = params.search;
  }, [params.search]);
  // Push only on a genuine debounce transition: setSearch gets a new identity
  // on every navigation, and re-running with a stale debounced value would
  // shove the old search straight back into the URL.
  const prevDebounced = useRef(debouncedSearch);
  useEffect(() => {
    if (debouncedSearch === prevDebounced.current) {
      return;
    }
    prevDebounced.current = debouncedSearch;
    if (debouncedSearch !== paramsSearchRef.current) {
      lastUrlSearch.current = debouncedSearch;
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, setSearch]);

  const categoriesQuery = useListCategories();
  const categoryOptions: CategoryOption[] = (categoriesQuery.data ?? []).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const listQuery = useListAnnouncements(
    {
      ...(params.search !== '' && { search: params.search }),
      ...(params.categoryIds.length > 0 && { categoryIds: params.categoryIds }),
      page: params.page,
      limit: PAGE_SIZE,
    },
    { query: { placeholderData: keepPreviousData } },
  );

  const hasFilters = params.search !== '' || params.categoryIds.length > 0;
  const data = listQuery.data;
  const totalPages = data === undefined ? 1 : Math.max(1, Math.ceil(data.total / data.limit));

  // A stale/bogus ?page= beyond the last page (deep link, shrunken result
  // set) silently shows an empty list; snap back to the last real page.
  useEffect(() => {
    if (data !== undefined && data.total > 0 && params.page > totalPages) {
      setPage(totalPages);
    }
  }, [data, params.page, totalPages, setPage]);

  const onClearFilters = (): void => {
    setSearchInput('');
    clearFilters();
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t('list.title')}</h1>
        <Link to="/announcements/new" className={styles.addLink}>
          <Button type="button">
            <Plus size={16} aria-hidden />
            {t('list.add')}
          </Button>
        </Link>
      </div>

      <AnnouncementsToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        categoryOptions={categoryOptions}
        selectedCategoryIds={params.categoryIds}
        onCategoryChange={setCategoryIds}
        categoriesLoading={categoriesQuery.isLoading}
      />

      {listQuery.isLoading && <ListSkeleton />}

      {listQuery.isError && data === undefined && (
        <StateCard alert title={t('list.error.title')} message={t('list.error.message')}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void listQuery.refetch();
            }}
          >
            {t('list.error.retry')}
          </Button>
        </StateCard>
      )}

      {data?.total === 0 && (
        <StateCard
          title={hasFilters ? t('list.filteredEmpty.title') : t('list.empty.title')}
          message={hasFilters ? t('list.filteredEmpty.message') : t('list.empty.message')}
        >
          {hasFilters ? (
            <Button type="button" variant="secondary" onClick={onClearFilters}>
              {t('list.filteredEmpty.clear')}
            </Button>
          ) : (
            <Link to="/announcements/new" className={styles.addLink}>
              <Button type="button">
                <Plus size={16} aria-hidden />
                {t('list.add')}
              </Button>
            </Link>
          )}
        </StateCard>
      )}

      {listQuery.isError && data !== undefined && (
        <p className={styles.refreshError} role="alert">
          {t('list.refreshError')}
        </p>
      )}

      {data !== undefined && data.items.length > 0 && (
        <>
          {isMobile ? (
            <AnnouncementCardList items={data.items} />
          ) : (
            <AnnouncementsTable items={data.items} />
          )}
          <Pagination page={params.page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

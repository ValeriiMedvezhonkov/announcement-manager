import { useListAnnouncements, useListCategories } from '@announcement-manager/api-client';
import { keepPreviousData } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
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

const PAGE_SIZE = 5;
const SEARCH_DEBOUNCE_MS = 300;

export function AnnouncementsPage() {
  const isMobile = useIsMobile();
  const { params, setSearch, setCategoryIds, setPage } = useAnnouncementListParams();

  // Local input state gives instant typing; the URL (and query) follow debounced.
  const [searchInput, setSearchInput] = useState(params.search);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedSearch !== params.search) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, params.search, setSearch]);

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

  const clearFilters = (): void => {
    setSearchInput('');
    setSearch('');
    setCategoryIds([]);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Announcements</h1>
        <Link to="/announcements/new" className={styles.addLink}>
          <Button type="button">
            <Plus size={16} aria-hidden />
            Add announcement
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

      {listQuery.isError && (
        <StateCard
          alert
          title="Could not load announcements"
          message="The server did not respond. Check that the API is running, then try again."
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void listQuery.refetch();
            }}
          >
            Try again
          </Button>
        </StateCard>
      )}

      {data?.total === 0 && (
        <StateCard
          title={hasFilters ? 'No matching announcements' : 'No announcements yet'}
          message={
            hasFilters
              ? 'Nothing matches your current search and filters.'
              : 'Create the first announcement to get started.'
          }
        >
          {hasFilters ? (
            <Button type="button" variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : (
            <Link to="/announcements/new" className={styles.addLink}>
              <Button type="button">
                <Plus size={16} aria-hidden />
                Add announcement
              </Button>
            </Link>
          )}
        </StateCard>
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

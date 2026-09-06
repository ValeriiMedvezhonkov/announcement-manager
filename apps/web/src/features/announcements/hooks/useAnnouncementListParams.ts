import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

export interface AnnouncementListParams {
  search: string;
  categoryIds: string[];
  page: number;
}

/**
 * Search/filter/pagination state lives in the URL so views are shareable and
 * survive reloads. Defaults are omitted from the query string to keep URLs
 * clean; changing search or filters resets pagination.
 */
export function useAnnouncementListParams(): {
  params: AnnouncementListParams;
  setSearch: (search: string) => void;
  setCategoryIds: (ids: string[]) => void;
  setPage: (page: number) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo<AnnouncementListParams>(() => {
    const rawPage = Number(searchParams.get('page') ?? '1');
    return {
      search: searchParams.get('search') ?? '',
      categoryIds: (searchParams.get('categories') ?? '').split(',').filter(Boolean),
      page: Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1,
    };
  }, [searchParams]);

  const update = useCallback(
    (changes: Partial<AnnouncementListParams>) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          const apply = (key: string, value: string, defaultValue: string) => {
            if (value === defaultValue) {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          };

          if (changes.search !== undefined) {
            apply('search', changes.search, '');
            next.delete('page');
          }
          if (changes.categoryIds !== undefined) {
            apply('categories', changes.categoryIds.join(','), '');
            next.delete('page');
          }
          if (changes.page !== undefined) {
            apply('page', String(changes.page), '1');
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return {
    params,
    setSearch: useCallback(
      (search: string) => {
        update({ search });
      },
      [update],
    ),
    setCategoryIds: useCallback(
      (categoryIds: string[]) => {
        update({ categoryIds });
      },
      [update],
    ),
    setPage: useCallback(
      (page: number) => {
        update({ page });
      },
      [update],
    ),
  };
}

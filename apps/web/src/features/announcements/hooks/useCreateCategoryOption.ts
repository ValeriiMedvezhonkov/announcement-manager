import {
  ApiError,
  getListCategoriesQueryKey,
  useCreateCategory,
  useListCategories,
  type CategoryResponseDto,
} from '@announcement-manager/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { notify } from '../../../shared/lib/notify.ts';

import type { CategoryOption } from '../components/CategorySelect.tsx';
import { t } from '../../../shared/i18n/index.ts';

/**
 * Inline category creation for the form's CreatableSelect.
 *
 * Persists the category first, then selects it — the UI never holds
 * frontend-only categories. A 409 (someone created it meanwhile / stale
 * options) is handled by refreshing the list and selecting the existing one.
 */
export function useCreateCategoryOption(onCreated: (option: CategoryOption) => void): {
  createCategory: (name: string) => void;
  isCreating: boolean;
} {
  const queryClient = useQueryClient();
  const categoriesQuery = useListCategories();
  const mutation = useCreateCategory();

  const createCategory = (name: string): void => {
    mutation.mutate(
      { data: { name } },
      {
        onSuccess: (category) => {
          // Seed the cache synchronously BEFORE selecting: if only invalidate
          // ran, the option list would lack the new category until the
          // refetch lands, and the select's value filter would silently drop
          // the just-created id from the form value in that window.
          queryClient.setQueryData<CategoryResponseDto[]>(getListCategoriesQueryKey(), (old) =>
            old === undefined
              ? [category]
              : [...old, category].sort((a, b) => a.name.localeCompare(b.name)),
          );
          void queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          onCreated({ value: category.id, label: category.name });
          notify.success(t('toast.category.created', { name: category.name }));
        },
        onError: (error) => {
          void (async () => {
            if (error instanceof ApiError && error.body.code === 'CATEGORY_ALREADY_EXISTS') {
              // Stale options: refetch and select the existing category instead.
              const fresh = await categoriesQuery.refetch();
              const normalized = name.trim().toLowerCase();
              const existing = fresh.data?.find(
                (category) => category.name.trim().toLowerCase() === normalized,
              );
              if (existing !== undefined) {
                onCreated({ value: existing.id, label: existing.name });
                notify.info(t('toast.category.existed', { name: existing.name }));
                return;
              }
            }
            notify.error(error instanceof ApiError ? error.message : t('toast.category.failed'));
          })();
        },
      },
    );
  };

  return { createCategory, isCreating: mutation.isPending };
}

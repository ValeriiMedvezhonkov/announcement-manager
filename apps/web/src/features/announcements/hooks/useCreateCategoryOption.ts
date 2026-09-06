import {
  ApiError,
  getListCategoriesQueryKey,
  useCreateCategory,
  useListCategories,
} from '@announcement-manager/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { notify } from '../../../shared/lib/notify.ts';

import type { CategoryOption } from '../components/CategorySelect.tsx';

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
          void queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          onCreated({ value: category.id, label: category.name });
          notify.success(`Category "${category.name}" created`);
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
                notify.info(`Category "${existing.name}" already existed and was selected`);
                return;
              }
            }
            notify.error(
              error instanceof ApiError ? error.message : 'Could not create the category',
            );
          })();
        },
      },
    );
  };

  return { createCategory, isCreating: mutation.isPending };
}

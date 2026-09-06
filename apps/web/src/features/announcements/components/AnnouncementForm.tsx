import { useListCategories } from '@announcement-manager/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { BackLink } from '../../../shared/ui/BackLink.tsx';
import { Button } from '../../../shared/ui/Button.tsx';
import { FormErrorSummary } from '../../../shared/ui/FormErrorSummary.tsx';
import { FormField } from '../../../shared/ui/FormField.tsx';
import {
  announcementFormSchema,
  type AnnouncementFormValues,
} from '../schemas/announcement-form.schema.ts';
import { useCreateCategoryOption } from '../hooks/useCreateCategoryOption.ts';
import { CategorySelect, type CategoryOption } from './CategorySelect.tsx';
import { PublicationDateField } from './PublicationDateField.tsx';
import styles from './AnnouncementForm.module.css';
import { t } from '../../../shared/i18n/index.ts';

interface AnnouncementFormProps {
  title: string;
  defaultValues: AnnouncementFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  /** Message from a failed submit; rendered in an accessible error box. */
  serverError: string | null;
  onSubmit: (values: AnnouncementFormValues) => void;
  /** Rendered next to the primary action (used by edit for delete). */
  secondaryAction?: React.ReactNode;
}

/** Shared create/edit form. Field rules live in the zod schema. */
export function AnnouncementForm(props: AnnouncementFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitted },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: props.defaultValues,
  });

  const categoriesQuery = useListCategories();
  const categoryOptions: CategoryOption[] = (categoriesQuery.data ?? []).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const { createCategory, isCreating } = useCreateCategoryOption((option) => {
    const current = getValues('categoryIds');
    if (!current.includes(option.value)) {
      setValue('categoryIds', [...current, option.value], { shouldValidate: true });
    }
  });

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        void handleSubmit(props.onSubmit)(event);
      }}
    >
      <BackLink to="/announcements">{t('form.back')}</BackLink>

      <h1 className={styles.formTitle}>{props.title}</h1>

      {isSubmitted && (
        <FormErrorSummary
          title={t('form.summary.title')}
          messages={Object.values(errors)
            .map((error) => error.message)
            .filter((message): message is string => message !== undefined)}
        />
      )}

      {props.serverError !== null && (
        <div className={styles.serverError} role="alert">
          {props.serverError}
        </div>
      )}

      <FormField
        label={t('form.field.title')}
        htmlFor="announcement-title"
        error={errors.title?.message}
        errorId="announcement-title-error"
      >
        <input
          id="announcement-title"
          type="text"
          className={errors.title ? styles.inputInvalid : styles.input}
          aria-invalid={errors.title !== undefined}
          aria-describedby={errors.title ? 'announcement-title-error' : undefined}
          {...register('title')}
        />
      </FormField>

      <FormField
        label={t('form.field.content')}
        htmlFor="announcement-body"
        error={errors.body?.message}
        errorId="announcement-body-error"
      >
        <textarea
          id="announcement-body"
          rows={9}
          className={errors.body ? styles.textareaInvalid : styles.textarea}
          aria-invalid={errors.body !== undefined}
          aria-describedby={errors.body ? 'announcement-body-error' : undefined}
          {...register('body')}
        />
      </FormField>

      <FormField
        label={t('form.field.category')}
        htmlFor="announcement-categories"
        hint={t('form.field.category.hint')}
        error={errors.categoryIds?.message}
        errorId="announcement-categories-error"
      >
        <Controller
          control={control}
          name="categoryIds"
          render={({ field }) => (
            <CategorySelect
              inputId="announcement-categories"
              isInvalid={errors.categoryIds !== undefined}
              options={categoryOptions}
              isLoading={categoriesQuery.isLoading || isCreating}
              value={categoryOptions.filter((option) => field.value.includes(option.value))}
              onChange={(selected) => {
                field.onChange(selected.map((option) => option.value));
              }}
              onCreateOption={createCategory}
            />
          )}
        />
      </FormField>

      <FormField
        label={t('form.field.publicationDate')}
        htmlFor="announcement-date"
        error={errors.publicationDate?.message}
        errorId="announcement-date-error"
      >
        <Controller
          control={control}
          name="publicationDate"
          render={({ field }) => (
            <PublicationDateField
              id="announcement-date"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              isInvalid={errors.publicationDate !== undefined}
              describedBy={errors.publicationDate ? 'announcement-date-error' : undefined}
            />
          )}
        />
      </FormField>

      <div className={styles.actions}>
        {props.secondaryAction}
        <Button type="submit" disabled={props.isSubmitting}>
          {props.isSubmitting ? t('form.saving') : props.submitLabel}
        </Button>
      </div>
    </form>
  );
}

import {
  getListAnnouncementsQueryKey,
  useCreateAnnouncement,
} from '@announcement-manager/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { notify } from '@shared/lib/notify.ts';

import { AnnouncementForm } from '@features/announcements/components/AnnouncementForm.tsx';
import { describeApiError } from '@features/announcements/utils/api-errors.ts';
import type { AnnouncementFormValues } from '@features/announcements/schemas/announcement-form.schema.ts';
import {
  parsePublicationDate,
  PUBLICATION_DATE_FORMAT,
} from '@features/announcements/utils/dates.ts';
import { t } from '@shared/i18n/index.ts';

export function CreateAnnouncementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useCreateAnnouncement();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = (values: AnnouncementFormValues): void => {
    const publicationDate = parsePublicationDate(values.publicationDate);
    if (publicationDate === null) {
      return; // schema already guards this; belt and braces
    }
    setServerError(null);

    mutation.mutate(
      {
        data: {
          title: values.title,
          body: values.body,
          categoryIds: values.categoryIds,
          publicationDate: publicationDate.toISOString(),
        },
      },
      {
        onSuccess: (announcement) => {
          void queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
          notify.success(t('toast.announcement.published', { title: announcement.title }));
          void navigate('/announcements');
        },
        onError: (error) => {
          setServerError(describeApiError(error));
        },
      },
    );
  };

  return (
    <AnnouncementForm
      title={t('form.create.title')}
      submitLabel={t('form.publish')}
      isSubmitting={mutation.isPending}
      serverError={serverError}
      defaultValues={{
        title: '',
        body: '',
        categoryIds: [],
        publicationDate: format(new Date(), PUBLICATION_DATE_FORMAT),
      }}
      onSubmit={onSubmit}
    />
  );
}

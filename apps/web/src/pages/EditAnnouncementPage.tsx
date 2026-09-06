import {
  ApiError,
  getGetAnnouncementQueryKey,
  getListAnnouncementsQueryKey,
  useDeleteAnnouncement,
  useGetAnnouncement,
  useUpdateAnnouncement,
} from '@announcement-manager/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { notify } from '../shared/lib/notify.ts';

import { AnnouncementForm } from '../features/announcements/components/AnnouncementForm.tsx';
import { DeleteAnnouncementAction } from '../features/announcements/components/DeleteAnnouncementAction.tsx';
import type { AnnouncementFormValues } from '../features/announcements/schemas/announcement-form.schema.ts';
import { describeApiError } from '../features/announcements/utils/api-errors.ts';
import {
  formatPublicationDate,
  parsePublicationDate,
} from '../features/announcements/utils/dates.ts';
import { Button } from '../shared/ui/Button.tsx';
import { StateCard } from '../shared/ui/StateCard.tsx';
import styles from './EditAnnouncementPage.module.css';

export function EditAnnouncementPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const announcementQuery = useGetAnnouncement(id);
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [serverError, setServerError] = useState<string | null>(null);

  if (announcementQuery.isLoading) {
    return (
      <div className={styles.centered} aria-label="Loading announcement">
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonBlock} />
      </div>
    );
  }

  if (announcementQuery.isError) {
    // A malformed id yields 400 from ParseUUIDPipe; for the reader that is
    // the same situation as 404 — this announcement does not exist, and
    // retrying the same URL can never succeed.
    const notFound =
      announcementQuery.error instanceof ApiError &&
      (announcementQuery.error.body.statusCode === 404 ||
        announcementQuery.error.body.statusCode === 400);
    return (
      <StateCard
        alert={!notFound}
        title={notFound ? 'Announcement not found' : 'Could not load the announcement'}
        message={
          notFound
            ? 'It may have been deleted. Pick another announcement from the list.'
            : 'The server did not respond. Please try again.'
        }
      >
        <Link to="/announcements" className={styles.backLink}>
          <Button type="button" variant="secondary">
            Back to announcements
          </Button>
        </Link>
      </StateCard>
    );
  }

  const announcement = announcementQuery.data;
  if (announcement === undefined) {
    return null;
  }

  const onSubmit = (values: AnnouncementFormValues): void => {
    const publicationDate = parsePublicationDate(values.publicationDate);
    if (publicationDate === null) {
      return;
    }
    setServerError(null);

    // The form field is minute-precision; when the user did not touch it,
    // send the stored value through unchanged so a no-op save cannot strip
    // seconds off an API-created timestamp.
    const dateUntouched =
      values.publicationDate === formatPublicationDate(announcement.publicationDate);

    updateMutation.mutate(
      {
        id,
        data: {
          title: values.title,
          body: values.body,
          categoryIds: values.categoryIds,
          publicationDate: dateUntouched
            ? announcement.publicationDate
            : publicationDate.toISOString(),
        },
      },
      {
        onSuccess: (updated) => {
          void queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetAnnouncementQueryKey(id) });
          notify.success(`"${updated.title}" updated`);
          void navigate('/announcements');
        },
        onError: (error) => {
          setServerError(describeApiError(error));
        },
      },
    );
  };

  const onDelete = (): void => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          // The detail query must be removed, not invalidated: refetching a
          // deleted resource can only 404.
          queryClient.removeQueries({ queryKey: getGetAnnouncementQueryKey(id) });
          void queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
          notify.success(`"${announcement.title}" deleted`);
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
      title="Edit the announcement"
      submitLabel="Publish"
      isSubmitting={updateMutation.isPending}
      serverError={serverError}
      defaultValues={{
        title: announcement.title,
        body: announcement.body,
        categoryIds: announcement.categories.map((category) => category.id),
        publicationDate: formatPublicationDate(announcement.publicationDate),
      }}
      onSubmit={onSubmit}
      secondaryAction={
        <DeleteAnnouncementAction pending={deleteMutation.isPending} onDelete={onDelete} />
      }
    />
  );
}

/**
 * Application events emitted after successful PostgreSQL writes.
 *
 * Events carry plain identifiers/data only — never transport objects (Socket
 * gateways, search clients). Listeners decide what to do with them; the
 * emitting service stays unaware of side effects.
 */

export const ANNOUNCEMENT_CREATED = 'announcement.created';
export const ANNOUNCEMENT_UPDATED = 'announcement.updated';
export const ANNOUNCEMENT_DELETED = 'announcement.deleted';

export class AnnouncementCreatedEvent {
  constructor(
    readonly announcementId: string,
    readonly title: string,
  ) {}
}

export class AnnouncementUpdatedEvent {
  constructor(
    readonly announcementId: string,
    readonly title: string,
  ) {}
}

export class AnnouncementDeletedEvent {
  constructor(readonly announcementId: string) {}
}

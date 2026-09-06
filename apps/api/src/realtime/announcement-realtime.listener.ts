import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  ANNOUNCEMENT_CREATED,
  type AnnouncementCreatedEvent,
} from '../events/announcement.events.js';
import { NotificationsGateway } from './notifications.gateway.js';

/**
 * Bridges application events to the realtime transport.
 *
 * Broadcasting is a secondary side effect: a failure here is logged and never
 * propagates — the PostgreSQL write already succeeded and the HTTP response
 * must not be affected.
 */
@Injectable()
export class AnnouncementRealtimeListener {
  private readonly logger = new Logger(AnnouncementRealtimeListener.name);

  constructor(private readonly gateway: NotificationsGateway) {}

  @OnEvent(ANNOUNCEMENT_CREATED)
  handleAnnouncementCreated(event: AnnouncementCreatedEvent): void {
    try {
      this.gateway.broadcastAnnouncementCreated({
        id: event.announcementId,
        title: event.title,
      });
    } catch (error) {
      this.logger.error('Failed to broadcast announcement.created', error);
    }
  }
}

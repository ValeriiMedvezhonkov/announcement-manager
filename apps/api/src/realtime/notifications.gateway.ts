import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocketGateway, WebSocketServer, type OnGatewayInit } from '@nestjs/websockets';
import type { Server } from 'socket.io';

import { ANNOUNCEMENT_CREATED } from '../events/announcement.events.js';
import type { Env } from '../config/env.validation.js';

export interface AnnouncementCreatedPayload {
  id: string;
  title: string;
}

/**
 * Socket.IO endpoint for in-app realtime notifications.
 *
 * Pure transport: it never contains business logic and is only invoked by
 * event listeners, never directly by application services.
 */
@WebSocketGateway({ cors: true })
export class NotificationsGateway implements OnGatewayInit {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  private readonly server!: Server;

  constructor(private readonly config: ConfigService<Env, true>) {}

  afterInit(server: Server): void {
    // Restrict CORS to the configured web origin (the decorator option is
    // evaluated before DI, so the origin is applied here instead).
    server.engine.opts.cors = { origin: this.config.get('WEB_ORIGIN', { infer: true }) };
    this.logger.log('Realtime gateway ready');
  }

  broadcastAnnouncementCreated(payload: AnnouncementCreatedPayload): void {
    this.server.emit(ANNOUNCEMENT_CREATED, payload);
  }
}

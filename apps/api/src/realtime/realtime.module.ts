import { Module } from '@nestjs/common';

import { AnnouncementRealtimeListener } from './announcement-realtime.listener.js';
import { NotificationsGateway } from './notifications.gateway.js';

@Module({
  providers: [NotificationsGateway, AnnouncementRealtimeListener],
})
export class RealtimeModule {}

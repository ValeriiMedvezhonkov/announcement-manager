import { Module } from '@nestjs/common';

import { AnnouncementsRepository } from './announcements.repository.js';

@Module({
  providers: [AnnouncementsRepository],
  exports: [AnnouncementsRepository],
})
export class AnnouncementsModule {}

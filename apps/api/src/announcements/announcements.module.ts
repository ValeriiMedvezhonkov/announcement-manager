import { Module } from '@nestjs/common';

import { CategoriesModule } from '../categories/categories.module.js';
import { AnnouncementsController } from './announcements.controller.js';
import { AnnouncementsRepository } from './announcements.repository.js';
import { AnnouncementsService } from './announcements.service.js';

@Module({
  imports: [CategoriesModule],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService, AnnouncementsRepository],
})
export class AnnouncementsModule {}

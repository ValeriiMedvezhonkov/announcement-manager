import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { validateEnv } from './config/env.validation.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { AnnouncementsModule } from './announcements/announcements.module.js';
import { CategoriesModule } from './categories/categories.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    RealtimeModule,
    HealthModule,
    AnnouncementsModule,
    CategoriesModule,
  ],
})
export class AppModule {}

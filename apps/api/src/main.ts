import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { createValidationException } from './common/errors/validation.factory.js';
import { ApiExceptionFilter } from './common/filters/api-exception.filter.js';
import type { Env } from './config/env.validation.js';
import { buildOpenApiDocument } from './openapi.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.use(helmet());
  app.setGlobalPrefix('/api');
  app.enableCors({ origin: config.get('WEB_ORIGIN', { infer: true }) });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: createValidationException,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();

  SwaggerModule.setup('docs', app, () => buildOpenApiDocument(app));

  const port = config.get('PORT', { infer: true });
  await app.listen(port);

  Logger.log(`API listening on http://localhost:${port}/api`, 'Bootstrap');
}

await bootstrap();

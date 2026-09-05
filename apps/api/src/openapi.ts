import { type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';

/**
 * Single source for the OpenAPI document, shared by the runtime Swagger UI and
 * the spec-file generator so the two can never drift apart.
 */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Announcement Manager API')
    .setDescription('REST API for managing announcements and their categories.')
    .setVersion('1.0')
    .addTag('health', 'Liveness')
    .addTag('announcements', 'Announcement management')
    .addTag('categories', 'Category management')
    .build();

  return SwaggerModule.createDocument(app, config);
}

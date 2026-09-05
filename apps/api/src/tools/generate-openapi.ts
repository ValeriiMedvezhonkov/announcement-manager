import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module.js';
import { buildOpenApiDocument } from '../openapi.js';

/**
 * Writes the OpenAPI spec to packages/api-client/openapi.json.
 *
 * Uses the exact same document builder as the runtime /docs endpoint, so the
 * committed spec and the live documentation cannot drift apart. Output is
 * deterministic: same code, same file, byte for byte.
 */
const app = await NestFactory.create(AppModule, { logger: false });
app.setGlobalPrefix('/api');

const document = buildOpenApiDocument(app);
await app.close();

const here = dirname(fileURLToPath(import.meta.url));
// dist/tools -> apps/api -> repo root
const target = resolve(here, '../../../..', 'packages/api-client/openapi.json');

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${JSON.stringify(document, null, 2)}\n`);

console.log(`OpenAPI spec written to ${target}`);

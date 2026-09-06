import { execSync, spawn, type ChildProcess } from 'node:child_process';

import { Client } from 'pg';

/**
 * Boots the real compiled API against a dedicated test database.
 *
 * Tests exercise the same artifact that runs in production (dist/main.js)
 * over HTTP — no test-only wiring of the Nest container.
 */

const ADMIN_URL = 'postgresql://announcements:announcements@localhost:5433/postgres';
export const TEST_DATABASE_URL =
  'postgresql://announcements:announcements@localhost:5433/announcements_test';
export const TEST_PORT = 3101;
export const API_BASE = `http://localhost:${String(TEST_PORT)}/api`;

let api: ChildProcess | undefined;

export async function setup(): Promise<void> {
  // 1. ensure the test database exists
  const admin = new Client({ connectionString: ADMIN_URL });
  await admin.connect();
  const exists = await admin.query(
    "SELECT 1 FROM pg_database WHERE datname = 'announcements_test'",
  );
  if (exists.rowCount === 0) {
    await admin.query('CREATE DATABASE announcements_test');
  }
  await admin.end();

  // 2. apply migrations
  execSync('npx prisma migrate deploy', {
    cwd: import.meta.dirname + '/..',
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'pipe',
  });

  // 3. start the compiled API
  api = spawn('node', ['dist/main.js'], {
    cwd: import.meta.dirname + '/..',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(TEST_PORT),
      DATABASE_URL: TEST_DATABASE_URL,
      WEB_ORIGIN: 'http://localhost:5173',
    },
    stdio: 'pipe',
  });

  // 4. wait until it answers
  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      /* not up yet */
    }
    if (Date.now() > deadline) {
      throw new Error('API did not become healthy within 30s (is dist/ built and postgres up?)');
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

export function teardown(): void {
  api?.kill('SIGKILL');
}

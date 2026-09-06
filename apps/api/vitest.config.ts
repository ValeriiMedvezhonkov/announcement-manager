import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.spec.ts'],
    globalSetup: './test/global-setup.ts',
    // Integration tests hit a real HTTP server + PostgreSQL.
    testTimeout: 15_000,
    hookTimeout: 120_000,
    // One worker: tests share one database and reset it between tests.
    fileParallelism: false,
  },
});

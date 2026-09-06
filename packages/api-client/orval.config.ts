import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: './openapi.json',
    },
    output: {
      target: './src/generated/endpoints.ts',
      schemas: './src/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      mode: 'single',
      // no timestamp/version banner so output is deterministic
      headers: false,
      override: {
        mutator: {
          path: './src/fetcher.ts',
          name: 'fetcher',
        },
        fetch: {
          // The fetcher already unwraps JSON; hooks should return the DTO itself.
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
});

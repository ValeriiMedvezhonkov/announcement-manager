import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors the "paths" mapping in tsconfig.app.json.
    alias: {
      '@app': `${import.meta.dirname}/src/app`,
      '@pages': `${import.meta.dirname}/src/pages`,
      '@layouts': `${import.meta.dirname}/src/layouts`,
      '@features': `${import.meta.dirname}/src/features`,
      '@shared': `${import.meta.dirname}/src/shared`,
      '@test': `${import.meta.dirname}/src/test`,
    },
  },
  server: {
    port: 5173,
  },
});

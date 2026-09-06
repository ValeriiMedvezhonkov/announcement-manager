import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './msw-server.ts';

// --- jsdom gaps required by the app code ---

// useMediaQuery / useIsMobile
window.matchMedia = (query: string): MediaQueryList => ({
  matches: false, // tests run the desktop experience
  media: query,
  onchange: null,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  addListener: () => undefined,
  removeListener: () => undefined,
  dispatchEvent: () => false,
});

Element.prototype.scrollIntoView = () => undefined;
window.scrollTo = () => undefined;

// --- MSW ---
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => {
  server.close();
});

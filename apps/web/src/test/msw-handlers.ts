import { http, HttpResponse } from 'msw';

const API = 'http://localhost:3000/api';

export interface TestCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestAnnouncement {
  id: string;
  title: string;
  body: string;
  publicationDate: string;
  lastUpdate: string;
  createdAt: string;
  categories: TestCategory[];
}

export const testCategories: TestCategory[] = [
  {
    id: 'c1000000-0000-4000-8000-000000000001',
    name: 'City',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000002',
    name: 'Health',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export const testAnnouncements: TestAnnouncement[] = [
  {
    id: 'a1000000-0000-4000-8000-000000000001',
    title: 'Storm warning tonight',
    body: 'Secure loose objects.',
    publicationDate: '2026-09-01T20:00:00.000Z',
    lastUpdate: '2026-09-02T08:30:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    categories: [testCategories[0]],
  },
  {
    id: 'a1000000-0000-4000-8000-000000000002',
    title: 'Free flu vaccinations',
    body: 'No appointment required.',
    publicationDate: '2026-08-19T12:00:00.000Z',
    lastUpdate: '2026-08-21T16:20:00.000Z',
    createdAt: '2026-08-19T00:00:00.000Z',
    categories: [testCategories[1]],
  },
];

/** Default happy-path handlers; individual tests override with server.use(). */
export const handlers = [
  http.get(`${API}/categories`, () => HttpResponse.json(testCategories)),
  http.get(`${API}/announcements`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const items =
      search === undefined || search === ''
        ? testAnnouncements
        : testAnnouncements.filter(
            (announcement) =>
              announcement.title.toLowerCase().includes(search) ||
              announcement.body.toLowerCase().includes(search),
          );
    return HttpResponse.json({ items, page: 1, limit: 5, total: items.length });
  }),
  http.get(`${API}/announcements/:id`, ({ params }) => {
    const found = testAnnouncements.find((announcement) => announcement.id === params.id);
    return found === undefined
      ? HttpResponse.json(
          { statusCode: 404, code: 'ANNOUNCEMENT_NOT_FOUND', message: 'not found' },
          { status: 404 },
        )
      : HttpResponse.json(found);
  }),
];

import { beforeEach, describe, expect, it } from 'vitest';

import { api, createAnnouncement, createCategory, resetDatabase } from './helpers.js';

interface AnnouncementBody {
  id: string;
  title: string;
  body: string;
  publicationDate: string;
  lastUpdate: string;
  categories: { id: string; name: string }[];
}

interface ListBody {
  items: AnnouncementBody[];
  page: number;
  limit: number;
  total: number;
}

describe('announcements API', () => {
  beforeEach(resetDatabase);

  it('creates a valid announcement with server-managed lastUpdate', async () => {
    const city = await createCategory('City');
    const before = Date.now();

    const { status, body } = await api('/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Road closure',
        body: 'Main street closed on Monday.',
        publicationDate: '2026-03-01T09:00:00.000Z',
        categoryIds: [city.id, city.id], // duplicate ids are collapsed
      }),
    });

    expect(status).toBe(201);
    const created = body as AnnouncementBody;
    expect(created.title).toBe('Road closure');
    expect(created.categories).toHaveLength(1);
    expect(new Date(created.lastUpdate).getTime()).toBeGreaterThanOrEqual(before - 1000);
  });

  it('rejects an announcement without categories', async () => {
    const { status, body } = await api('/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: 'No categories',
        body: 'x',
        publicationDate: '2026-03-01T09:00:00.000Z',
        categoryIds: [],
      }),
    });

    expect(status).toBe(400);
    const error = body as { code: string; errors: Record<string, string[]> };
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.errors.categoryIds).toBeDefined();
  });

  it('rejects nonexistent category ids explicitly', async () => {
    const { status, body } = await api('/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Ghost category',
        body: 'x',
        publicationDate: '2026-03-01T09:00:00.000Z',
        categoryIds: ['019621a0-0000-7000-8000-0000000000ff'],
      }),
    });

    expect(status).toBe(400);
    const error = body as { code: string; message: string };
    expect(error.code).toBe('INVALID_CATEGORY_SELECTION');
    expect(error.message).toContain('019621a0-0000-7000-8000-0000000000ff');
  });

  it('lists announcements ordered by lastUpdate descending', async () => {
    const city = await createCategory('City');
    await createAnnouncement({
      title: 'Oldest',
      body: 'x',
      lastUpdate: '2026-01-01T10:00:00.000Z',
      categoryIds: [city.id],
    });
    await createAnnouncement({
      title: 'Newest',
      body: 'x',
      lastUpdate: '2026-03-01T10:00:00.000Z',
      categoryIds: [city.id],
    });
    await createAnnouncement({
      title: 'Middle',
      body: 'x',
      lastUpdate: '2026-02-01T10:00:00.000Z',
      categoryIds: [city.id],
    });

    const { body } = await api('/announcements');
    const titles = (body as ListBody).items.map((item) => item.title);
    expect(titles).toEqual(['Newest', 'Middle', 'Oldest']);
  });

  it('searches title case-insensitively', async () => {
    const city = await createCategory('City');
    await createAnnouncement({ title: 'Storm warning tonight', body: 'x', categoryIds: [city.id] });
    await createAnnouncement({ title: 'Quiet day', body: 'x', categoryIds: [city.id] });

    const { body } = await api('/announcements?search=STORM');
    const list = body as ListBody;
    expect(list.total).toBe(1);
    expect(list.items[0]?.title).toBe('Storm warning tonight');
  });

  it('searches body text', async () => {
    const city = await createCategory('City');
    await createAnnouncement({
      title: 'A',
      body: 'gusts up to 100 km/h expected',
      categoryIds: [city.id],
    });
    await createAnnouncement({ title: 'B', body: 'calm weather', categoryIds: [city.id] });

    const { body } = await api('/announcements?search=gusts%20up');
    expect((body as ListBody).total).toBe(1);
    expect((body as ListBody).items[0]?.title).toBe('A');
  });

  it('filters by category with ANY-match semantics', async () => {
    const city = await createCategory('City');
    const health = await createCategory('Health');
    const culture = await createCategory('Culture');
    await createAnnouncement({ title: 'City only', body: 'x', categoryIds: [city.id] });
    await createAnnouncement({ title: 'Health only', body: 'x', categoryIds: [health.id] });
    await createAnnouncement({ title: 'Culture only', body: 'x', categoryIds: [culture.id] });
    await createAnnouncement({
      title: 'City and health',
      body: 'x',
      categoryIds: [city.id, health.id],
    });

    const { body } = await api(`/announcements?categoryIds=${city.id},${health.id}`);
    const titles = (body as ListBody).items.map((item) => item.title).sort();
    expect(titles).toEqual(['City and health', 'City only', 'Health only']);
  });

  it('paginates with a stable total and disjoint pages', async () => {
    const city = await createCategory('City');
    for (let index = 0; index < 5; index += 1) {
      await createAnnouncement({
        title: `Item ${String(index)}`,
        body: 'x',
        lastUpdate: `2026-01-0${String(index + 1)}T10:00:00.000Z`,
        categoryIds: [city.id],
      });
    }

    const page1 = (await api('/announcements?limit=2&page=1')).body as ListBody;
    const page2 = (await api('/announcements?limit=2&page=2')).body as ListBody;
    const page3 = (await api('/announcements?limit=2&page=3')).body as ListBody;

    expect(page1.total).toBe(5);
    expect(page1.items).toHaveLength(2);
    expect(page2.items).toHaveLength(2);
    expect(page3.items).toHaveLength(1);
    const ids = [...page1.items, ...page2.items, ...page3.items].map((item) => item.id);
    expect(new Set(ids).size).toBe(5);
  });

  it('rejects invalid pagination values', async () => {
    expect((await api('/announcements?page=0')).status).toBe(400);
    expect((await api('/announcements?limit=101')).status).toBe(400);
    expect((await api('/announcements?page=abc')).status).toBe(400);
  });

  it('refreshes lastUpdate on update, including category-only changes', async () => {
    const city = await createCategory('City');
    const health = await createCategory('Health');
    const created = await createAnnouncement({
      title: 'Original',
      body: 'x',
      lastUpdate: '2026-01-01T10:00:00.000Z',
      categoryIds: [city.id],
    });

    const { status, body } = await api(`/announcements/${created.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ categoryIds: [health.id] }),
    });

    expect(status).toBe(200);
    const updated = body as AnnouncementBody;
    expect(updated.categories.map((category) => category.name)).toEqual(['Health']);
    expect(new Date(updated.lastUpdate).getTime()).toBeGreaterThan(
      new Date('2026-01-01T10:00:00.000Z').getTime(),
    );
  });

  it('returns contract-shaped 404s for missing announcements', async () => {
    const missing = '019621b0-0000-7000-8000-0000000000ff';

    const get = await api(`/announcements/${missing}`);
    expect(get.status).toBe(404);
    expect((get.body as { code: string }).code).toBe('ANNOUNCEMENT_NOT_FOUND');

    const patch = await api(`/announcements/${missing}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: 'x' }),
    });
    expect(patch.status).toBe(404);

    const del = await api(`/announcements/${missing}`, { method: 'DELETE' });
    expect(del.status).toBe(404);
  });

  it('deletes an announcement and returns 204 with an empty body', async () => {
    const city = await createCategory('City');
    const created = await createAnnouncement({
      title: 'Doomed',
      body: 'x',
      categoryIds: [city.id],
    });

    const del = await api(`/announcements/${created.id}`, { method: 'DELETE' });
    expect(del.status).toBe(204);
    expect(del.body).toBeUndefined();

    expect((await api(`/announcements/${created.id}`)).status).toBe(404);
  });

  it('combines search, category filter and pagination consistently (PostgreSQL provider semantics)', async () => {
    const city = await createCategory('City');
    const health = await createCategory('Health');
    await createAnnouncement({
      title: 'Water works downtown',
      body: 'pipes',
      lastUpdate: '2026-01-03T10:00:00.000Z',
      categoryIds: [city.id],
    });
    await createAnnouncement({
      title: 'Water quality report',
      body: 'clean',
      lastUpdate: '2026-01-02T10:00:00.000Z',
      categoryIds: [health.id],
    });
    await createAnnouncement({
      title: 'Unrelated festival',
      body: 'water balloons everywhere',
      lastUpdate: '2026-01-01T10:00:00.000Z',
      categoryIds: [city.id],
    });

    // search matches title OR body; category narrows with ANY; order lastUpdate DESC
    const { body } = await api(`/announcements?search=water&categoryIds=${city.id}&limit=1&page=1`);
    const list = body as ListBody;
    expect(list.total).toBe(2);
    expect(list.items).toHaveLength(1);
    expect(list.items[0]?.title).toBe('Water works downtown');
  });
});

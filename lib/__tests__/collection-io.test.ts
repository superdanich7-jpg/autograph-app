/**
 * Unit Tests — lib/collection-io.ts
 * Разбор импортируемого JSON (round-trip с ExportCollection).
 */

import { parseCollectionImport } from '../collection-io';

describe('parseCollectionImport', () => {
  test('некорректный JSON -> невалидно, ошибка', () => {
    const r = parseCollectionImport('{not json');
    expect(r.valid).toBe(false);
    expect(r.posts).toHaveLength(0);
    expect(r.errors[0]).toContain('JSON');
  });

  test('нет массива posts -> невалидно', () => {
    const r = parseCollectionImport(JSON.stringify({ foo: 1 }));
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toContain('массив постов');
  });

  test('пустой массив -> невалидно', () => {
    const r = parseCollectionImport(JSON.stringify({ posts: [] }));
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toContain('нет автографов');
  });

  test('верхнеуровневый массив тоже принимается', () => {
    const r = parseCollectionImport(JSON.stringify([{ celebrityName: 'Пеле' }]));
    expect(r.valid).toBe(true);
    expect(r.posts).toHaveLength(1);
    expect(r.posts[0].celebrityName).toBe('Пеле');
  });

  test('нормализация: category/rarity по умолчанию, evidence фильтруется', () => {
    const r = parseCollectionImport(JSON.stringify({
      posts: [{ celebrityName: 'X', category: 'sports', rarity: 'rare', evidence: ['photo', 'bogus', 'video'] }],
    }));
    expect(r.valid).toBe(true);
    expect(r.posts[0].category).toBe('sports');
    expect(r.posts[0].rarity).toBe('rare');
    expect(r.posts[0].evidence).toEqual(['photo', 'video']);
  });

  test('неизвестные category/rarity -> fallback + ошибка', () => {
    const r = parseCollectionImport(JSON.stringify({
      posts: [{ celebrityName: 'Y', category: 'weird', rarity: 'mythic' }],
    }));
    expect(r.valid).toBe(true);
    expect(r.posts[0].category).toBe('other');
    expect(r.posts[0].rarity).toBe('common');
    expect(r.errors.some((e) => e.includes('категория'))).toBe(true);
    expect(r.errors.some((e) => e.includes('редкость'))).toBe(true);
  });

  test('description маппится в caption (совместимость со старым экспортом)', () => {
    const r = parseCollectionImport(JSON.stringify({ posts: [{ celebrityName: 'Z', description: 'Моя подпись' }] }));
    expect(r.posts[0].caption).toBe('Моя подпись');
  });

  test('scores клампятся в 0..9999', () => {
    const r = parseCollectionImport(JSON.stringify({
      posts: [{ celebrityName: 'A', realScore: -5, fakeScore: 999999 }],
    }));
    expect(r.posts[0].realScore).toBe(0);
    expect(r.posts[0].fakeScore).toBe(9999);
  });

  test('безымянный -> "Без имени"', () => {
    const r = parseCollectionImport(JSON.stringify({ posts: [{ category: 'music' }] }));
    expect(r.posts[0].celebrityName).toBe('Без имени');
  });

  test('не-объектные записи пропускаются с ошибкой', () => {
    const r = parseCollectionImport(JSON.stringify({ posts: ['oops', { celebrityName: 'ok' }] }));
    expect(r.valid).toBe(true);
    expect(r.posts).toHaveLength(1);
    expect(r.errors.some((e) => e.includes('#1'))).toBe(true);
  });
});

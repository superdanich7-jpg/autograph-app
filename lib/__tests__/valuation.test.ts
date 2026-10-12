/**
 * Unit Tests — lib/valuation.ts
 * Эвристическая оценка стоимости коллекции (CEO-идея #8).
 */

import { Post } from '../../context/PostsContext';
import { estimateCollectionValue, estimatePostValue, formatUsd } from '../valuation';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'p1',
    ownerId: 'me',
    ownerName: 'Me',
    uri: 'file://x.jpg',
    caption: '',
    timestamp: new Date().toISOString(),
    likes: 0,
    liked: false,
    saved: false,
    comments: [],
    celebrityName: 'Celeb',
    location: '',
    dateReceived: '',
    category: 'other',
    rarity: 'common',
    evidence: [],
    isAnalyzed: false,
    realVotes: 0,
    fakeVotes: 0,
    realScore: 0,
    fakeScore: 0,
    votesByUser: {},
    voteWeightsByUser: {},
    ...overrides,
  };
}

describe('estimatePostValue', () => {
  test('легендарный дороже редкого, редкий дороже обычного', () => {
    const common = estimatePostValue(makePost({ rarity: 'common' }));
    const rare = estimatePostValue(makePost({ rarity: 'rare' }));
    const legendary = estimatePostValue(makePost({ rarity: 'legendary' }));
    expect(rare).toBeGreaterThan(common);
    expect(legendary).toBeGreaterThan(rare);
  });

  test('подтверждённый автограф дороже неподтверждённого', () => {
    const verified = estimatePostValue(makePost({ realScore: 10, fakeScore: 0 }));
    const unverified = estimatePostValue(makePost({ realScore: 0, fakeScore: 0 }));
    expect(verified).toBeGreaterThan(unverified);
  });

  test('музыка дороже «другого» при равной редкости', () => {
    const music = estimatePostValue(makePost({ category: 'music' }));
    const other = estimatePostValue(makePost({ category: 'other' }));
    expect(music).toBeGreaterThan(other);
  });

  test('оценка всегда >= 1', () => {
    expect(estimatePostValue(makePost({ rarity: 'common', category: 'other' }))).toBeGreaterThanOrEqual(1);
  });
});

describe('estimateCollectionValue', () => {
  test('пустая коллекция → нули', () => {
    expect(estimateCollectionValue([])).toEqual({ total: 0, count: 0, average: 0, verifiedRatio: 0 });
  });

  test('суммирует стоимость и считает среднее', () => {
    const posts = [
      makePost({ id: 'a', rarity: 'common' }),
      makePost({ id: 'b', rarity: 'legendary' }),
    ];
    const v = estimateCollectionValue(posts);
    expect(v.count).toBe(2);
    expect(v.total).toBe(estimatePostValue(posts[0]) + estimatePostValue(posts[1]));
    expect(v.average).toBe(Math.round(v.total / 2));
  });

  test('verifiedRatio считает долю подтверждённых (>=70%)', () => {
    const posts = [
      makePost({ id: 'a', realScore: 10, fakeScore: 0 }), // verified
      makePost({ id: 'b', realScore: 0, fakeScore: 0 }), // not
    ];
    expect(estimateCollectionValue(posts).verifiedRatio).toBeCloseTo(0.5);
  });
});

describe('formatUsd', () => {
  test('форматирует с разделителями разрядов', () => {
    expect(formatUsd(1250)).toContain('1');
    expect(formatUsd(1250)).toContain('$');
    expect(formatUsd(0)).toBe('$0');
  });
});

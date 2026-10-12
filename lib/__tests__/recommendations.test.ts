/**
 * Unit Tests — lib/recommendations.ts
 * Персональные рекомендации «Вам может понравиться» (CEO-идея #6).
 */

import { Post } from '../../context/PostsContext';
import { getFavoriteCategory, recommendPosts } from '../recommendations';

const now = Date.now();

function makePost(overrides: Partial<Post> & { id: string }): Post {
  return {
    ownerId: 'other',
    ownerName: 'Кто-то',
    uri: 'file://x.jpg',
    caption: '',
    timestamp: new Date(now).toISOString(),
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

describe('getFavoriteCategory', () => {
  test('пустая коллекция → null', () => {
    expect(getFavoriteCategory([])).toBeNull();
  });

  test('возвращает самую частую категорию', () => {
    const posts = [
      makePost({ id: '1', category: 'sports' }),
      makePost({ id: '2', category: 'sports' }),
      makePost({ id: '3', category: 'music' }),
    ];
    expect(getFavoriteCategory(posts)).toBe('sports');
  });
});

describe('recommendPosts', () => {
  test('исключает свои посты', () => {
    const posts = [
      makePost({ id: 'mine', ownerId: 'me', rarity: 'legendary' }),
      makePost({ id: 'theirs', ownerId: 'other' }),
    ];
    const recs = recommendPosts(posts, { currentUserId: 'me' }, 5, now);
    expect(recs.map((r) => r.post.id)).not.toContain('mine');
    expect(recs.length).toBe(1);
  });

  test('исключает excludeIds', () => {
    const posts = [makePost({ id: 'a' }), makePost({ id: 'b' })];
    const recs = recommendPosts(posts, { currentUserId: 'me', excludeIds: ['a'] }, 5, now);
    expect(recs.map((r) => r.post.id)).toEqual(['b']);
  });

  test('категория + редкость получают высокий скор и встают выше', () => {
    const posts = [
      makePost({ id: 'plain', category: 'other', rarity: 'common' }),
      makePost({ id: 'match', category: 'sports', rarity: 'legendary' }),
    ];
    const recs = recommendPosts(posts, { currentUserId: 'me', favoriteCategory: 'sports' }, 5, now);
    expect(recs[0].post.id).toBe('match');
    expect(recs[0].score).toBeGreaterThan(recs[1].score);
  });

  test('скор в диапазоне 0..100', () => {
    const posts = [makePost({ id: 'max', category: 'music', rarity: 'legendary', realScore: 10, fakeScore: 0 })];
    const recs = recommendPosts(posts, { currentUserId: 'me', favoriteCategory: 'music' }, 5, now);
    expect(recs[0].score).toBeGreaterThanOrEqual(0);
    expect(recs[0].score).toBeLessThanOrEqual(100);
  });

  test('каждая рекомендация несёт непустую причину', () => {
    const posts = [makePost({ id: 'a' }), makePost({ id: 'b', rarity: 'legendary' })];
    const recs = recommendPosts(posts, { currentUserId: 'me' }, 5, now);
    for (const r of recs) expect(r.reason.length).toBeGreaterThan(0);
  });

  test('свежий пост ранжируется выше старого при равных прочих', () => {
    const old = new Date(now - 40 * 24 * 60 * 60 * 1000).toISOString();
    const posts = [
      makePost({ id: 'old', timestamp: old, rarity: 'common' }),
      makePost({ id: 'new', timestamp: new Date(now).toISOString(), rarity: 'common' }),
    ];
    const recs = recommendPosts(posts, { currentUserId: 'me' }, 5, now);
    expect(recs[0].post.id).toBe('new');
  });

  test('соблюдает лимит', () => {
    const posts = Array.from({ length: 10 }, (_, i) => makePost({ id: `p${i}` }));
    const recs = recommendPosts(posts, { currentUserId: 'me' }, 3, now);
    expect(recs.length).toBe(3);
  });

  test('пустой список постов → пустой результат', () => {
    expect(recommendPosts([], { currentUserId: 'me' })).toEqual([]);
  });
});

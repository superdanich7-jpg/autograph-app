/**
 * Unit Tests — lib/communities.ts
 * Приватные сообщества коллекционеров (CEO-идея #5).
 */

import {
  approveMember,
  Community,
  createCommunity,
  getMembership,
  leaveCommunity,
  normalizeCommunityInput,
  rejectMember,
  requestJoin,
  sortCommunitiesForUser,
  validateCommunityInput,
} from '../communities';

// createCommunity строит объект, поэтому базовую собираем через него + точечный override.
function base(overrides: Partial<Community> = {}): Community {
  const c = createCommunity(
    { name: 'Спорт-клуб', description: 'desc', category: 'sports', isPrivate: false, emoji: '🏆' },
    'owner-1',
    'comm-1'
  );
  return { ...c, ...overrides };
}

describe('normalizeCommunityInput', () => {
  test('валидирует категорию и приводит к other при мусоре', () => {
    expect(normalizeCommunityInput({ category: 'music' }).category).toBe('music');
    expect(normalizeCommunityInput({ category: 'xxx' }).category).toBe('other');
    expect(normalizeCommunityInput({ category: 42 }).category).toBe('other');
  });

  test('дефолтная эмодзи при отсутствии', () => {
    expect(normalizeCommunityInput({}).emoji).toBe('🏆');
    expect(normalizeCommunityInput({ emoji: '🎬' }).emoji).toBe('🎬');
  });

  test('isPrivate только при true', () => {
    expect(normalizeCommunityInput({ isPrivate: true }).isPrivate).toBe(true);
    expect(normalizeCommunityInput({ isPrivate: 'yes' }).isPrivate).toBe(false);
  });
});

describe('validateCommunityInput', () => {
  test('слишком короткое имя', () => {
    expect(validateCommunityInput({ name: 'ab' }).valid).toBe(false);
  });
  test('нормальное имя', () => {
    expect(validateCommunityInput({ name: 'Музыка' }).valid).toBe(true);
  });
  test('слишком длинное имя', () => {
    expect(validateCommunityInput({ name: 'a'.repeat(41) }).valid).toBe(false);
  });
});

describe('createCommunity', () => {
  test('владелец автоматически участник, нет pending', () => {
    const c = base();
    expect(c.memberIds).toContain('owner-1');
    expect(c.pendingIds).toEqual([]);
    expect(c.ownerId).toBe('owner-1');
  });
});

describe('getMembership', () => {
  test('владелец определяется', () => {
    const m = getMembership(base(), 'owner-1');
    expect(m.isOwner).toBe(true);
    expect(m.isMember).toBe(true);
  });
  test('посторонний не участник', () => {
    const m = getMembership(base(), 'user-2');
    expect(m.isMember).toBe(false);
    expect(m.isPending).toBe(false);
  });
});

describe('requestJoin', () => {
  test('публичное → сразу участник', () => {
    const c = requestJoin(base({ isPrivate: false }), 'user-2');
    expect(c.memberIds).toContain('user-2');
    expect(c.pendingIds).not.toContain('user-2');
  });

  test('приватное → в pending, не участник', () => {
    const c = requestJoin(base({ isPrivate: true }), 'user-2');
    expect(c.memberIds).not.toContain('user-2');
    expect(c.pendingIds).toContain('user-2');
  });

  test('повторная заявка не дублирует', () => {
    let c = requestJoin(base({ isPrivate: true }), 'user-2');
    c = requestJoin(c, 'user-2');
    expect(c.pendingIds.filter((id) => id === 'user-2').length).toBe(1);
  });
});

describe('approveMember / rejectMember', () => {
  test('одобрение переносит из pending в участники', () => {
    let c = requestJoin(base({ isPrivate: true }), 'user-2');
    c = approveMember(c, 'user-2');
    expect(c.memberIds).toContain('user-2');
    expect(c.pendingIds).not.toContain('user-2');
  });

  test('отклонение убирает из pending', () => {
    let c = requestJoin(base({ isPrivate: true }), 'user-2');
    c = rejectMember(c, 'user-2');
    expect(c.pendingIds).not.toContain('user-2');
    expect(c.memberIds).not.toContain('user-2');
  });
});

describe('leaveCommunity', () => {
  test('участник выходит', () => {
    let c = requestJoin(base({ isPrivate: false }), 'user-2');
    c = leaveCommunity(c, 'user-2');
    expect(c.memberIds).not.toContain('user-2');
  });

  test('владелец не может просто выйти', () => {
    const c = leaveCommunity(base(), 'owner-1');
    expect(c.memberIds).toContain('owner-1');
  });
});

describe('sortCommunitiesForUser', () => {
  test('сообщества где пользователь участник — выше', () => {
    const mine = base({ id: 'a', memberIds: ['owner-1', 'user-2'] });
    const other = base({ id: 'b', memberIds: ['owner-1', 'x', 'y', 'z'] });
    const sorted = sortCommunitiesForUser([other, mine], 'user-2');
    expect(sorted[0].id).toBe('a');
  });
});

import {
  acceptFriendRequest,
  createFriend,
  formatPresence,
  getFriendIds,
  getFriendship,
  getIncomingRequests,
  removeFriend,
  sendFriendRequest,
  suggestFriends,
  validateFriendInput,
  type FriendRequest,
} from '../friends';

describe('friends', () => {
  const NOW = '2026-10-14T12:00:00.000Z';

  const req = (from: string, to: string): FriendRequest => ({ id: `r-${from}-${to}`, fromId: from, toId: to, createdAt: NOW });

  describe('validateFriendInput', () => {
    it('accepts valid input', () => {
      expect(validateFriendInput({ name: 'Иван', handle: '@Ivan_99' })).toEqual({ valid: true });
    });
    it('rejects short name', () => {
      expect(validateFriendInput({ name: 'И', handle: 'ivan' }).valid).toBe(false);
    });
    it('rejects invalid handle chars', () => {
      expect(validateFriendInput({ name: 'Иван', handle: 'иван' }).valid).toBe(false);
      expect(validateFriendInput({ name: 'Иван', handle: 'ivan!' }).valid).toBe(false);
    });
    it('rejects missing handle', () => {
      expect(validateFriendInput({ name: 'Иван', handle: '' }).error).toBe('Укажите @handle');
    });
  });

  describe('createFriend', () => {
    it('creates with defaults', () => {
      const f = createFriend({ name: 'Аня', handle: 'anya', avatar: '👤' }, 'u1', NOW);
      expect(f).toMatchObject({ id: 'u1', name: 'Аня', handle: 'anya', online: false });
      expect(f.lastSeen).toBe(NOW);
    });
  });

  describe('friend requests + mutual friendship', () => {
    it('send creates outgoing request', () => {
      const reqs = sendFriendRequest([], 'me', 'bob', 'r1', NOW);
      expect(getFriendship(reqs, 'me', 'bob').status).toBe('requested');
      expect(getFriendship(reqs, 'bob', 'me').status).toBe('incoming');
    });
    it('no self-request', () => {
      expect(sendFriendRequest([], 'me', 'me', 'r1')).toEqual([]);
    });
    it('no duplicate request', () => {
      const once = sendFriendRequest([], 'me', 'bob', 'r1', NOW);
      const twice = sendFriendRequest(once, 'me', 'bob', 'r2', NOW);
      expect(twice).toHaveLength(1);
    });
    it('mutual requests become friends', () => {
      let reqs = sendFriendRequest([], 'me', 'bob', 'r1', NOW);
      reqs = acceptFriendRequest(reqs, 'bob', 'me');
      expect(getFriendship(reqs, 'me', 'bob').isFriend).toBe(true);
      expect(getFriendIds(reqs, 'me')).toContain('bob');
    });
    it('incoming requests listed', () => {
      const reqs = [req('bob', 'me')];
      expect(getIncomingRequests(reqs, 'me')).toHaveLength(1);
    });
    it('removeFriend clears both directions', () => {
      let reqs = [req('me', 'bob'), req('bob', 'me')];
      reqs = removeFriend(reqs, 'me', 'bob');
      expect(getFriendship(reqs, 'me', 'bob').isFriend).toBe(false);
    });
  });

  describe('suggestFriends', () => {
    it('excludes friends, pending and self; sorts by mutual', () => {
      const candidates = [
        createFriend({ name: 'Bob', handle: 'bob', avatar: '👤', mutualCount: 1, online: true }, 'bob'),
        createFriend({ name: 'Cat', handle: 'cat', avatar: '👤', mutualCount: 9 }, 'cat'),
        createFriend({ name: 'Pal', handle: 'pal', avatar: '👤', mutualCount: 5 }, 'pal'),
      ];
      const reqs = [req('me', 'pal')]; // pal already requested
      const sug = suggestFriends(candidates, reqs, 'me', 5);
      expect(sug.map((f) => f.id)).toEqual(['cat', 'bob']);
    });
  });

  describe('formatPresence', () => {
    const base = createFriend({ name: 'X', handle: 'x', avatar: '👤' }, 'x');
    it('online', () => {
      expect(formatPresence({ ...base, online: true })).toBe('в сети');
    });
    it('minutes ago', () => {
      const now = new Date('2026-10-14T12:00:00Z').getTime();
      expect(formatPresence({ ...base, online: false, lastSeen: '2026-10-14T11:55:00Z' }, now)).toBe('5 мин назад');
    });
    it('days ago', () => {
      const now = new Date('2026-10-14T12:00:00Z').getTime();
      expect(formatPresence({ ...base, online: false, lastSeen: '2026-10-11T12:00:00Z' }, now)).toBe('3 дн назад');
    });
  });
});

/**
 * Friends — система друзей и присутствия (соцграф).
 *
 * CEO-запрос (Фаза 3). Рисерч соцсетей 2026: follow/friend, mutual friends,
 * suggestions, presence — ключевые драйверы удержания. DM + друзья = «core loop».
 *
 * Здесь — ЧИСТАЯ модель и логика (тестируемо, без нативных зависимостей).
 * Персистентность: offline-first через PostsContext (как Community/Collection),
 * с опциональной синхронизацией в Supabase (см. supabase/migrations/008_friends.sql).
 */

export type FriendStatus = 'none' | 'requested' | 'incoming' | 'friends';

export interface Friend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  online: boolean;
  lastSeen: string;
  specialty?: string;
  mutualCount?: number;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  toId: string;
  createdAt: string;
}

export interface Friendship {
  status: FriendStatus;
  isFriend: boolean;
  isPending: boolean;
  isIncoming: boolean;
}

const HANDLE_RE = /^[a-z0-9_]+$/;

export function normalizeFriendInput(input: {
  name?: unknown;
  handle?: unknown;
  avatar?: unknown;
  specialty?: unknown;
}): { name: string; handle: string; avatar: string; specialty: string } {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const rawHandle = typeof input.handle === 'string' ? input.handle.trim().toLowerCase() : '';
  const handle = rawHandle.replace(/^@/, '').replace(/\s+/g, '');
  const avatar = typeof input.avatar === 'string' && input.avatar.trim() ? input.avatar.trim() : '👤';
  const specialty = typeof input.specialty === 'string' ? input.specialty.trim() : '';
  return { name, handle, avatar, specialty };
}

export function validateFriendInput(input: { name?: unknown; handle?: unknown }): { valid: boolean; error?: string } {
  const { name, handle } = normalizeFriendInput(input);
  if (name.length < 2) return { valid: false, error: 'Имя должно быть не короче 2 символов' };
  if (name.length > 40) return { valid: false, error: 'Имя слишком длинное (макс. 40)' };
  if (!handle) return { valid: false, error: 'Укажите @handle' };
  if (handle.length < 3) return { valid: false, error: 'Handle слишком короткий (мин. 3)' };
  if (!HANDLE_RE.test(handle)) return { valid: false, error: 'Handle: только a-z, 0-9 и _' };
  return { valid: true };
}

export function createFriend(
  input: { name: string; handle: string; avatar: string; specialty?: string; online?: boolean; mutualCount?: number },
  id: string,
  now: string = new Date().toISOString()
): Friend {
  return {
    id,
    name: input.name,
    handle: input.handle,
    avatar: input.avatar,
    online: input.online ?? false,
    lastSeen: now,
    specialty: input.specialty || undefined,
    mutualCount: input.mutualCount ?? undefined,
  };
}

export function getFriendship(requests: FriendRequest[], userId: string, otherId: string): Friendship {
  const outgoing = requests.find((r) => r.fromId === userId && r.toId === otherId);
  const incoming = requests.find((r) => r.fromId === otherId && r.toId === userId);
  if (outgoing && incoming) {
    return { status: 'friends', isFriend: true, isPending: false, isIncoming: false };
  }
  if (incoming) return { status: 'incoming', isFriend: false, isPending: false, isIncoming: true };
  if (outgoing) return { status: 'requested', isFriend: false, isPending: true, isIncoming: false };
  return { status: 'none', isFriend: false, isPending: false, isIncoming: false };
}

export function getFriendIds(requests: FriendRequest[], userId: string): string[] {
  return requests
    .filter((r) => r.fromId === userId)
    .filter((r) => requests.some((x) => x.fromId === r.toId && x.toId === userId))
    .map((r) => r.toId);
}

export function sendFriendRequest(
  requests: FriendRequest[],
  fromId: string,
  toId: string,
  id: string,
  now: string = new Date().toISOString()
): FriendRequest[] {
  if (fromId === toId) return requests;
  const exists = requests.some((r) => r.fromId === fromId && r.toId === toId);
  if (exists) return requests;
  return [...requests, { id, fromId, toId, createdAt: now }];
}

export function acceptFriendRequest(requests: FriendRequest[], userId: string, otherId: string): FriendRequest[] {
  return sendFriendRequest(requests, userId, otherId, `req-${userId}-${otherId}`);
}

export function removeFriendRequest(requests: FriendRequest[], fromId: string, toId: string): FriendRequest[] {
  return requests.filter((r) => !(r.fromId === fromId && r.toId === toId));
}

export function removeFriend(requests: FriendRequest[], userId: string, otherId: string): FriendRequest[] {
  return requests.filter(
    (r) => !((r.fromId === userId && r.toId === otherId) || (r.fromId === otherId && r.toId === userId))
  );
}

export function getIncomingRequests(requests: FriendRequest[], userId: string): FriendRequest[] {
  return requests.filter((r) => r.toId === userId);
}

export function getOutgoingRequests(requests: FriendRequest[], userId: string): FriendRequest[] {
  return requests.filter((r) => r.fromId === userId);
}

export function sortFriends(friends: Friend[]): Friend[] {
  return [...friends].sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return a.name.localeCompare(b.name, 'ru');
  });
}

export function suggestFriends(
  candidates: Friend[],
  requests: FriendRequest[],
  userId: string,
  limit = 5
): Friend[] {
  return candidates
    .filter((c) => c.id !== userId)
    .filter((c) => getFriendship(requests, userId, c.id).status === 'none')
    .sort((a, b) => (b.mutualCount ?? 0) - (a.mutualCount ?? 0) || (b.online ? 1 : 0) - (a.online ? 1 : 0))
    .slice(0, limit);
}

export function formatPresence(friend: Friend, now: number = Date.now()): string {
  if (friend.online) return 'в сети';
  const diff = Math.max(0, now - new Date(friend.lastSeen).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн назад`;
}


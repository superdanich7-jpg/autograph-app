/**
 * Communities — приватные сообщества коллекционеров.
 *
 * CEO-идея #5 (Фаза 2). Рисерч: закрытые клубы по интересам (спорт, музыка,
 * кино) — сильный драйвер удержания и UGC. Discord/Reddit-паттерн.
 *
 * Здесь — ЧИСТАЯ модель и логика членства (тестируемо, без нативных зависимостей).
 * Персистентность: offline-first через PostsContext (как Collection), с опциональной
 * синхронизацией в Supabase (см. supabase/migrations/007_communities.sql).
 */

export type CommunityCategory = 'sports' | 'music' | 'movies' | 'politics' | 'other';

export interface Community {
  id: string;
  name: string;
  description: string;
  category: CommunityCategory;
  /** Приватное сообщество требует одобрения/приглашения. */
  isPrivate: boolean;
  /** ID создателя. */
  ownerId: string;
  /** Участники (id пользователей). */
  memberIds: string[];
  /** Заявки на вступление (для приватных). */
  pendingIds: string[];
  createdAt: string;
  /** Эмодзи-иконка для UI. */
  emoji: string;
}

export interface CommunityMembership {
  communityId: string;
  isMember: boolean;
  isPending: boolean;
  isOwner: boolean;
}

const VALID_CATEGORIES: CommunityCategory[] = ['sports', 'music', 'movies', 'politics', 'other'];

/** Валидирует и нормализует поля при создании сообщества. */
export function normalizeCommunityInput(input: {
  name?: unknown;
  description?: unknown;
  category?: unknown;
  isPrivate?: unknown;
  emoji?: unknown;
}): { name: string; description: string; category: CommunityCategory; isPrivate: boolean; emoji: string } {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const category = VALID_CATEGORIES.includes(input.category as CommunityCategory)
    ? (input.category as CommunityCategory)
    : 'other';
  const isPrivate = input.isPrivate === true;
  const emoji = typeof input.emoji === 'string' && input.emoji.trim() ? input.emoji.trim() : '🏆';
  return { name, description, category, isPrivate, emoji };
}

/** Проверяет, валидны ли данные для создания. */
export function validateCommunityInput(input: {
  name?: unknown;
}): { valid: boolean; error?: string } {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (name.length < 3) return { valid: false, error: 'Название должно быть не короче 3 символов' };
  if (name.length > 40) return { valid: false, error: 'Название слишком длинное (макс. 40)' };
  return { valid: true };
}

/** Создаёт объект сообщества (владелец автоматически становится участником). */
export function createCommunity(
  input: { name: string; description: string; category: CommunityCategory; isPrivate: boolean; emoji: string },
  ownerId: string,
  id: string,
  now: string = new Date().toISOString()
): Community {
  return {
    id,
    name: input.name,
    description: input.description,
    category: input.category,
    isPrivate: input.isPrivate,
    ownerId,
    memberIds: [ownerId],
    pendingIds: [],
    createdAt: now,
    emoji: input.emoji,
  };
}

/** Вычисляет статус членства пользователя в сообществе. */
export function getMembership(community: Community, userId: string): CommunityMembership {
  return {
    communityId: community.id,
    isMember: community.memberIds.includes(userId),
    isPending: community.pendingIds.includes(userId),
    isOwner: community.ownerId === userId,
  };
}

/**
 * Заявка/вступление. Публичное → сразу участник.
 * Приватное → в pending (нужно одобрение владельцем).
 */
export function requestJoin(community: Community, userId: string): Community {
  const m = getMembership(community, userId);
  if (m.isMember || m.isPending) return community;
  if (community.isPrivate) {
    return { ...community, pendingIds: [...community.pendingIds, userId] };
  }
  return { ...community, memberIds: [...community.memberIds, userId] };
}

/** Владелец одобряет заявку. */
export function approveMember(community: Community, userId: string): Community {
  if (!community.pendingIds.includes(userId)) return community;
  return {
    ...community,
    pendingIds: community.pendingIds.filter((id) => id !== userId),
    memberIds: community.memberIds.includes(userId) ? community.memberIds : [...community.memberIds, userId],
  };
}

/** Отклоняет заявку. */
export function rejectMember(community: Community, userId: string): Community {
  return { ...community, pendingIds: community.pendingIds.filter((id) => id !== userId) };
}

/** Выход из сообщества (владелец не может просто выйти — сначала передать/удалить). */
export function leaveCommunity(community: Community, userId: string): Community {
  if (community.ownerId === userId) return community;
  return { ...community, memberIds: community.memberIds.filter((id) => id !== userId) };
}

/** Сортирует сообщества: сначала те, где пользователь участник, потом по размеру. */
export function sortCommunitiesForUser(communities: Community[], userId: string): Community[] {
  return [...communities].sort((a, b) => {
    const aMember = a.memberIds.includes(userId) ? 1 : 0;
    const bMember = b.memberIds.includes(userId) ? 1 : 0;
    if (aMember !== bMember) return bMember - aMember;
    return b.memberIds.length - a.memberIds.length;
  });
}

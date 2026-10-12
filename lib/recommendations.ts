/**
 * Recommendations — персональные рекомендации «Вам может понравиться».
 *
 * CEO-идея #6 (Фаза 2): персональная лента. В отличие от платных ML-решений,
 * наш движок детерминированный и оффлайн-совместимый: scoring на основе
 * категории, редкости, достоверности и свежести постов.
 *
 * Рисерч: Instagram/TikTok «Вам может понравиться» повышает время сессии.
 * Чистые функции → легко тестировать.
 */

import { Post } from '../context/PostsContext';
import { getAuthenticityPercent } from './helpers';

export interface RecommendationProfile {
  /** ID текущего пользователя — чтобы не рекомендовать свои же посты. */
  currentUserId: string;
  /** Любимая категория пользователя (по его коллекции) — если есть. */
  favoriteCategory?: Post['category'] | null;
  /** ID, которые уже показывали/лайкали — исключаем из рекомендаций. */
  excludeIds?: string[];
}

export interface Recommendation {
  post: Post;
  /** Итоговый скор 0..100 (чем выше, тем релевантнее). */
  score: number;
  /** Человекочитаемая причина — показываем чипом «почему это рекомендовано». */
  reason: string;
}

// Веса факторов (сумма «идеала» ≈ 100).
const WEIGHT_CATEGORY = 34;
const WEIGHT_AUTHENTICITY = 24;
const WEIGHT_RARITY = 22;
const WEIGHT_FRESHNESS = 20;

/** Свежесть: экспоненциальное затухание. 1 → только что, 0 → очень старое. */
function freshnessScore(timestamp: string, now: number = Date.now()): number {
  const age = now - new Date(timestamp).getTime();
  const day = 24 * 60 * 60 * 1000;
  const ageDays = age / day;
  // Полураспад ~14 дней.
  return Math.max(0, Math.min(1, Math.pow(0.5, ageDays / 14)));
}

/** Оценка редкости 0..1. */
function rarityScore(rarity: Post['rarity']): number {
  if (rarity === 'legendary') return 1;
  if (rarity === 'rare') return 0.6;
  return 0.25;
}

/**
 * Считает рекомендации для ленты. Исключает свои посты и excludeIds,
 * сортирует по скору и берёт топ-N.
 */
export function recommendPosts(
  posts: Post[],
  profile: RecommendationProfile,
  limit = 5,
  now: number = Date.now()
): Recommendation[] {
  const exclude = new Set(profile.excludeIds ?? []);
  const favorite = profile.favoriteCategory ?? null;

  const scored = posts
    .filter((p) => p.ownerId !== profile.currentUserId && !exclude.has(p.id))
    .map((p) => {
      const catFactor = favorite && p.category === favorite ? 1 : 0;
      const authFactor = getAuthenticityPercent(p) / 100;
      const rareFactor = rarityScore(p.rarity);
      const freshFactor = freshnessScore(p.timestamp, now);

      const score = Math.round(
        catFactor * WEIGHT_CATEGORY +
          authFactor * WEIGHT_AUTHENTICITY +
          rareFactor * WEIGHT_RARITY +
          freshFactor * WEIGHT_FRESHNESS
      );

      return { post: p, score, reason: describeReason(p, favorite) };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/** Формирует причину рекомендации — по самому сильному фактору. */
function describeReason(post: Post, favorite: Post['category'] | null): string {
  const auth = getAuthenticityPercent(post);
  if (favorite && post.category === favorite && post.rarity !== 'common') {
    return 'Из вашей любимой категории';
  }
  if (post.rarity === 'legendary') return 'Легендарный автограф';
  if (auth >= 80) return 'Высокая достоверность сообщества';
  if (favorite && post.category === favorite) return 'Похоже на вашу коллекцию';
  if (post.rarity === 'rare') return 'Редкий автограф';
  return 'Свежее в сообществе';
}

/** Определяет любимую категорию пользователя по его коллекции (мода). */
export function getFavoriteCategory(posts: Post[]): Post['category'] | null {
  if (posts.length === 0) return null;
  const counts = new Map<Post['category'], number>();
  for (const p of posts) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  let best: Post['category'] | null = null;
  let bestCount = 0;
  for (const [cat, count] of counts) {
    if (count > bestCount) {
      best = cat;
      bestCount = count;
    }
  }
  return best;
}

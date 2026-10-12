/**
 * Collection Valuation — оценка стоимости коллекции автографов.
 *
 * CEO-идея #8 (Фаза 2): вирусный метрик «Моя коллекция стоит ~$X».
 * Рисерч: Relic Roster / PSA показывают оценку — мощный социальный триггер
 * для шейринга и возврата.
 *
 * Важно (честно): это ЭВРИСТИЧЕСКАЯ оценка-ориентир, не рыночная цена.
 * Реальные API (PWCC/Beckett/eBay) — внешний платный доступ, требует бэкенда
 * (Фаза 3). Здесь — прозрачная формула на основе редкости, категории и
 * подтверждённости, чтобы пользователь понимал логику.
 *
 * Чистые функции → легко тестировать.
 */

import { Post } from '../context/PostsContext';
import { getAuthenticityPercent } from './helpers';

export interface ValuationBreakdown {
  /** Общая ориентировочная стоимость, USD. */
  total: number;
  /** Количество оценённых автографов. */
  count: number;
  /** Средняя стоимость за автограф (округлено). */
  average: number;
  /** Доля коллекции, подтверждённая сообществом (0..1). */
  verifiedRatio: number;
}

// Базовая цена по редкости (USD) — консервативные ориентиры.
const BASE_BY_RARITY: Record<Post['rarity'], number> = {
  common: 25,
  rare: 120,
  legendary: 500,
};

// Множители по категории (некоторые категории дороже на вторичном рынке).
const CATEGORY_MULTIPLIER: Record<Post['category'], number> = {
  sports: 1.4,
  music: 1.6,
  movies: 1.3,
  politics: 1.2,
  other: 1.0,
};

/** Множитель за подтверждённость: выше достоверность → выше оценка. */
function authenticityMultiplier(authPercent: number): number {
  // 0% → 0.7x, 50% → 1.0x, 100% → 1.5x
  return 0.7 + (authPercent / 100) * 0.8;
}

/** Оценивает один автограф (округлено до доллара). */
export function estimatePostValue(post: Post): number {
  const base = BASE_BY_RARITY[post.rarity] ?? 25;
  const catMul = CATEGORY_MULTIPLIER[post.category] ?? 1.0;
  const authMul = authenticityMultiplier(getAuthenticityPercent(post));
  return Math.max(1, Math.round(base * catMul * authMul));
}

/** Оценивает всю коллекцию + сводка. */
export function estimateCollectionValue(posts: Post[]): ValuationBreakdown {
  if (posts.length === 0) {
    return { total: 0, count: 0, average: 0, verifiedRatio: 0 };
  }
  const values = posts.map(estimatePostValue);
  const total = values.reduce((s, v) => s + v, 0);
  const verified = posts.filter((p) => getAuthenticityPercent(p) >= 70).length;

  return {
    total,
    count: posts.length,
    average: Math.round(total / posts.length),
    verifiedRatio: verified / posts.length,
  };
}

/** Форматирует сумму в читаемый вид: $1 250. */
export function formatUsd(amount: number): string {
  return `$${Math.round(amount).toLocaleString('ru-RU').replace(/\u00A0/g, ' ')}`;
}

/**
 * Trust Tiers — уровни доверия коллекционера по score.
 * Рисерч: Reddit/StackOverflow — видимый статус повышает качество и вовлечённость.
 *
 * Чистые функции для лёгкого тестирования.
 */

export type TrustTier = 'newcomer' | 'verified' | 'expert' | 'authority';

export interface TrustInfo {
  tier: TrustTier;
  label: string;
  icon: string;
  colorHint: 'info' | 'success' | 'warning' | 'primary';
}

/** Определяет уровень доверия по очкам (0..∞). */
export function getTrustTier(score: number): TrustInfo {
  if (score >= 90) return { tier: 'authority', label: 'Авторитет', icon: '👑', colorHint: 'warning' };
  if (score >= 70) return { tier: 'expert', label: 'Эксперт', icon: '🥇', colorHint: 'primary' };
  if (score >= 40) return { tier: 'verified', label: 'Проверенный', icon: '✅', colorHint: 'success' };
  return { tier: 'newcomer', label: 'Новичок', icon: '🌱', colorHint: 'info' };
}

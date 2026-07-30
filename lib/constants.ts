/**
 * Constants — все magic numbers и конфигурации в одном месте.
 * В продакшн-приложениях константы выносятся отдельно:
 * - Упрощает изменение значений
 * - Убирает magic numbers из кода
 * - Централизованная конфигурация
 */

// ─── App Config ────────────────────────────────

export const APP_NAME = 'Autograph';
export const APP_VERSION = '1.0.0';

// ─── Storage Keys ──────────────────────────────

export const STORAGE_KEYS = {
  POSTS: 'autograph.posts.v1',
  PROFILE: 'autograph.profile.v1',
  SETTINGS: 'autograph.settings.v1',
  ONBOARDING: 'autograph.onboarding.v1',
} as const;

// ─── API Config ────────────────────────────────

export const API_CONFIG = {
  TIMEOUT_MS: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  BATCH_SIZE: 50,
} as const;

// ─── Validation ────────────────────────────────

export const VALIDATION = {
  MAX_NAME_LENGTH: 100,
  MAX_BIO_LENGTH: 500,
  MAX_COMMENT_LENGTH: 1000,
  MAX_POSTS_PER_USER: 1000,
  MIN_PASSWORD_LENGTH: 8,
} as const;

// ─── UI Config ─────────────────────────────────

export const UI_CONFIG = {
  DEBOUNCE_MS: 300,
  ANIMATION_DURATION_MS: 200,
  TOAST_DURATION_MS: 3000,
  PAGINATION_SIZE: 20,
  MAX_IMAGE_SIZE_MB: 10,
} as const;

// ─── Achievement Thresholds ────────────────────

export const ACHIEVEMENT_THRESHOLDS = {
  FIRST_POST: 1,
  TEN_POSTS: 10,
  FIFTY_POSTS: 50,
  HUNDRED_POSTS: 100,
  FIRST_LIKE: 1,
  TEN_LIKES: 10,
  FIRST_COMMENT: 1,
  TEN_COMMENTS: 10,
} as const;

// ─── Rarity Config ─────────────────────────────

export const RARITY_CONFIG = {
  COMMON: { color: '#6B7280', label: 'Обычный' },
  RARE: { color: '#3B82F6', label: 'Редкий' },
  EPIC: { color: '#8B5CF6', label: 'Эпический' },
  LEGENDARY: { color: '#F59E0B', label: 'Легендарный' },
} as const;

// ─── Category Icons ────────────────────────────

export const CATEGORY_ICONS: Record<string, string> = {
  sports: '🏆',
  music: '🎵',
  movies: '🎬',
  politics: '🏛️',
  other: '📝',
};
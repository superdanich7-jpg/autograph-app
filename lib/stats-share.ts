/**
 * Collector Stats Share — формирует «виральный» текст-резюме коллекционера
 * (Spotify-Wrapped стиль) + deep-link на профиль.
 *
 * Чистые функции → легко тестировать, без нативных зависимостей.
 */

export interface CollectorStatsInput {
  name: string;
  totalPosts: number;
  totalRealVotes: number;
  legendary: number;
  uniqueCelebrities: number;
  favoriteCategory: string;
  reputationLabel?: string;
  reputationScore?: number;
  profileUrl?: string;
}

export interface CollectorStatsSummary {
  headline: string;
  lines: string[];
  text: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Спорт: '🏅',
  Музыка: '🎵',
  Кино: '🎬',
  Политика: '🏛️',
  Другое: '✨',
};

/** Определяет «титул» коллекционера по его статистике (геймификация шаринга). */
export function getCollectorTitle(stats: Pick<CollectorStatsInput, 'totalPosts' | 'legendary' | 'totalRealVotes'>): string {
  if (stats.legendary >= 3) return 'Легендарный охотник за автографами';
  if (stats.totalPosts >= 10) return 'Заядлый коллекционер';
  if (stats.totalPosts >= 5) return 'Растущий коллекционер';
  if (stats.totalRealVotes >= 5) return 'Доверенный хранитель';
  return 'Начинающий коллекционер';
}

/** Формирует структурированное резюме для шейринга. */
export function buildCollectorStatsSummary(stats: CollectorStatsInput): CollectorStatsSummary {
  const title = getCollectorTitle(stats);
  const categoryEmoji = CATEGORY_EMOJI[stats.favoriteCategory] ?? '✨';

  const lines: string[] = [];
  lines.push(`🔏 Автографов в коллекции: ${stats.totalPosts}`);
  if (stats.uniqueCelebrities > 0) lines.push(`⭐ Уникальных имён: ${stats.uniqueCelebrities}`);
  if (stats.totalRealVotes > 0) lines.push(`✅ Подтверждений сообщества: ${stats.totalRealVotes}`);
  if (stats.legendary > 0) lines.push(`🏆 Легендарных: ${stats.legendary}`);
  if (stats.favoriteCategory) lines.push(`${categoryEmoji} Любимая категория: ${stats.favoriteCategory}`);
  if (typeof stats.reputationScore === 'number' && stats.reputationLabel) {
    lines.push(`${stats.reputationLabel} · ${stats.reputationScore} очков доверия`);
  }

  const headline = `🏅 ${stats.name} — ${title}`;
  const text = [headline, ...lines, stats.profileUrl ? `\nМоя коллекция: ${stats.profileUrl}` : '']
    .filter(Boolean)
    .join('\n');

  return { headline, lines, text };
}

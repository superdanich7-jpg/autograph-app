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

/**
 * Стрик (серия) активности по дням — количество подряд идущих дней
 * (включая сегодня, если была активность), в которые пользователь
 * добавлял автографы. Рисерч: Duolingo/BeReal — стрики повышают D30 retention.
 *
 * Чистая функция: принимает ISO-строки timestamp'ов постов.
 */
export function getDayStreak(timestamps: string[], today: Date = new Date()): number {
  if (timestamps.length === 0) return 0;

  const toDayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const dayKeys = new Set(timestamps.map((t) => toDayKey(new Date(t))));

  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  // Если сегодня не было активности — серия считается от вчера (чтобы не показывать 0 сразу).
  if (!dayKeys.has(toDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dayKeys.has(toDayKey(cursor))) return 0;
  }

  let streak = 0;
  while (dayKeys.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}


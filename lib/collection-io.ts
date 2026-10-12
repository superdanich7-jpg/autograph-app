/**
 * Collection IO — разбор импортируемого JSON коллекции (round-trip с ExportCollection).
 *
 * Чистые функции: валидация и нормализация → легко тестировать.
 * Импорт восстановит метаданные; изображение (uri) берём из файла, если он есть,
 * иначе — заглушка (пользователь дозагрузит фото вручную).
 */

export interface ImportablePost {
  celebrityName?: string;
  category?: string;
  rarity?: string;
  caption?: string;
  location?: string;
  dateReceived?: string;
  uri?: string;
  evidence?: unknown;
  realScore?: number;
  fakeScore?: number;
}

export interface ParsedImport {
  valid: boolean;
  posts: ImportablePost[];
  errors: string[];
}

const VALID_CATEGORIES = ['sports', 'music', 'movies', 'politics', 'other'];
const VALID_RARITIES = ['common', 'rare', 'legendary'];
const VALID_EVIDENCE = ['photo', 'selfie', 'ticket', 'video', 'certificate'];

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function clampInt(v: unknown, min: number, max: number, fallback = 0): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback;
  return Math.max(min, Math.min(max, n));
}

/**
 * Разбирает JSON-строку экспорта коллекции. Возвращает нормализованные посты
 * и список ошибок (не бросает исключений — удобно для UI).
 */
export function parseCollectionImport(raw: string): ParsedImport {
  const errors: string[] = [];
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    return { valid: false, posts: [], errors: ['Файл не является корректным JSON.'] };
  }

  const arr = Array.isArray(data) ? data : data?.posts;
  if (!Array.isArray(arr)) {
    return { valid: false, posts: [], errors: ['Не найдён массив постов (ожидается { posts: [...] }).'] };
  }
  if (arr.length === 0) {
    return { valid: false, posts: [], errors: ['В файле нет автографов для импорта.'] };
  }

  const posts: ImportablePost[] = [];
  arr.forEach((entry, i) => {
    if (!entry || typeof entry !== 'object') {
      errors.push(`Запись #${i + 1} пропущена: не объект.`);
      return;
    }
    const category = str(entry.category);
    if (category && !VALID_CATEGORIES.includes(category)) errors.push(`#${i + 1}: неизвестная категория «${category}» → other.`);
    const rarity = str(entry.rarity);
    if (rarity && !VALID_RARITIES.includes(rarity)) errors.push(`#${i + 1}: неизвестная редкость «${rarity}» → common.`);

    const evidence = Array.isArray(entry.evidence)
      ? entry.evidence.filter((e: unknown) => typeof e === 'string' && VALID_EVIDENCE.includes(e))
      : [];

    posts.push({
      celebrityName: str(entry.celebrityName, 'Без имени'),
      category: VALID_CATEGORIES.includes(category) ? category : 'other',
      rarity: VALID_RARITIES.includes(rarity) ? rarity : 'common',
      caption: str(entry.caption ?? entry.description, ''),
      location: str(entry.location, ''),
      dateReceived: str(entry.dateReceived, ''),
      uri: str(entry.uri, ''),
      evidence,
      realScore: clampInt(entry.realScore, 0, 9999, 0),
      fakeScore: clampInt(entry.fakeScore, 0, 9999, 0),
    });
  });

  if (posts.length === 0) {
    return { valid: false, posts: [], errors: ['Не удалось разобрать ни одной записи.'] };
  }

  return { valid: true, posts, errors };
}

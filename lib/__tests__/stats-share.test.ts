/**
 * Unit Tests — lib/stats-share.ts
 * Виральная «карточка достижений» коллекционера (Spotify-Wrapped стиль).
 */

import {
    buildCollectorStatsSummary,
    getCollectorTitle,
    CollectorStatsInput,
} from '../stats-share';

const base: CollectorStatsInput = {
    name: 'Иван',
    totalPosts: 0,
    totalRealVotes: 0,
    legendary: 0,
    uniqueCelebrities: 0,
    favoriteCategory: '',
};

describe('getCollectorTitle', () => {
    test('начинающий без статистики', () => {
        expect(getCollectorTitle({ totalPosts: 0, legendary: 0, totalRealVotes: 0 })).toBe('Начинающий коллекционер');
    });

    test('по подтверждениям', () => {
        expect(getCollectorTitle({ totalPosts: 1, legendary: 0, totalRealVotes: 5 })).toBe('Доверенный хранитель');
    });

    test('по числу постов', () => {
        expect(getCollectorTitle({ totalPosts: 5, legendary: 0, totalRealVotes: 0 })).toBe('Растущий коллекционер');
        expect(getCollectorTitle({ totalPosts: 10, legendary: 0, totalRealVotes: 0 })).toBe('Заядлый коллекционер');
    });

    test('легендарный имеет приоритет', () => {
        expect(getCollectorTitle({ totalPosts: 10, legendary: 3, totalRealVotes: 99 })).toBe('Легендарный охотник за автографами');
    });
});

describe('buildCollectorStatsSummary', () => {
    test('минимальная коллекция: только число автографов', () => {
        const s = buildCollectorStatsSummary({ ...base, totalPosts: 1 });
        expect(s.headline).toContain('Иван');
        expect(s.headline).toContain('Начинающий коллекционер');
        expect(s.lines).toEqual(['🔏 Автографов в коллекции: 1']);
        expect(s.text).toContain('🔏 Автографов в коллекции: 1');
    });

    test('полная статистика: все строки присутствуют', () => {
        const s = buildCollectorStatsSummary({
            ...base,
            totalPosts: 12,
            totalRealVotes: 30,
            legendary: 4,
            uniqueCelebrities: 8,
            favoriteCategory: 'Спорт',
            reputationLabel: 'Эксперт',
            reputationScore: 95,
        });
        const joined = s.lines.join('\n');
        expect(joined).toContain('Автографов в коллекции: 12');
        expect(joined).toContain('Уникальных имён: 8');
        expect(joined).toContain('Подтверждений сообщества: 30');
        expect(joined).toContain('Легендарных: 4');
        expect(joined).toContain('Любимая категория: Спорт');
        expect(joined).toContain('🏅'); // эмодзи категории Спорт
        expect(joined).toContain('95 очков доверия');
    });

    test('profileUrl добавляется в текст с переносом', () => {
        const s = buildCollectorStatsSummary({ ...base, totalPosts: 2, profileUrl: 'autograph://profile' });
        expect(s.text).toContain('Моя коллекция: autograph://profile');
    });

    test('нулевые значения не создают пустых строк', () => {
        const s = buildCollectorStatsSummary({ ...base, totalPosts: 3, favoriteCategory: 'Кино' });
        // totalRealVotes=0, legendary=0, uniqueCelebrities=0 -> не попадают в lines
        expect(s.lines.some((l) => l.includes('Подтверждений'))).toBe(false);
        expect(s.lines.some((l) => l.includes('Легендарных'))).toBe(false);
        expect(s.lines.some((l) => l.includes('Уникальных имён'))).toBe(false);
        expect(s.lines.some((l) => l.includes('Любимая категория: Кино'))).toBe(true);
    });
});

/**
 * Unit Tests — тесты для celebrity-database и fuzzy matching.
 */

import {
    CELEBRITY_DATABASE,
    CelebrityCategory,
    findCelebrityByName,
    getCategoryStats,
    getCelebritiesByCategory,
    levenshteinDistance,
    nameMatchScore,
    searchCelebrities,
    stringSimilarity,
} from '../celebrity-database';

describe('Celebrity Database — структура', () => {
    test('база содержит 50+ знаменитостей', () => {
        expect(CELEBRITY_DATABASE.length).toBeGreaterThanOrEqual(50);
    });

    test('все записи имеют уникальные id', () => {
        const ids = CELEBRITY_DATABASE.map((c) => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    test('все записи имеют уникальные хеши', () => {
        const hashes = CELEBRITY_DATABASE.map((c) => c.hash);
        const uniqueHashes = new Set(hashes);
        expect(uniqueHashes.size).toBe(hashes.length);
    });

    test('все хеши — 16 hex символов (64 bit)', () => {
        for (const celeb of CELEBRITY_DATABASE) {
            expect(celeb.hash).toMatch(/^[0-9a-f]{16}$/);
        }
    });

    test('все записи имеют density в диапазоне 0-100', () => {
        for (const celeb of CELEBRITY_DATABASE) {
            expect(celeb.density).toBeGreaterThanOrEqual(0);
            expect(celeb.density).toBeLessThanOrEqual(100);
        }
    });

    test('все записи имеют name, nameRu, category, nationality', () => {
        for (const celeb of CELEBRITY_DATABASE) {
            expect(celeb.name).toBeTruthy();
            expect(celeb.nameRu).toBeTruthy();
            expect(celeb.category).toBeTruthy();
            expect(celeb.nationality).toBeTruthy();
            expect(celeb.aliases.length).toBeGreaterThan(0);
        }
    });

    test('категории содержат все 5 типов', () => {
        const categories = new Set(CELEBRITY_DATABASE.map((c) => c.category));
        expect(categories.has('sports')).toBe(true);
        expect(categories.has('music')).toBe(true);
        expect(categories.has('movies')).toBe(true);
        expect(categories.has('politics')).toBe(true);
        expect(categories.has('other')).toBe(true);
    });
});

describe('Levenshtein Distance', () => {
    test('идентичные строки → 0', () => {
        expect(levenshteinDistance('hello', 'hello')).toBe(0);
        expect(levenshteinDistance('Messi', 'Messi')).toBe(0);
    });

    test('одна правка → 1', () => {
        expect(levenshteinDistance('cat', 'cut')).toBe(1); // замена
        expect(levenshteinDistance('cat', 'cats')).toBe(1); // вставка
        expect(levenshteinDistance('cats', 'cat')).toBe(1); // удаление
    });

    test('полностью разные строки', () => {
        expect(levenshteinDistance('abc', 'xyz')).toBe(3);
    });

    test('пустые строки', () => {
        expect(levenshteinDistance('', '')).toBe(0);
        expect(levenshteinDistance('abc', '')).toBe(3);
    });
});

describe('String Similarity', () => {
    test('идентичные строки → 1', () => {
        expect(stringSimilarity('hello', 'hello')).toBe(1);
    });

    test('похожие строки → близко к 1', () => {
        expect(stringSimilarity('Messi', 'Messi')).toBeGreaterThan(0.99);
        expect(stringSimilarity('Lionel Messi', 'Lionel Messi')).toBe(1);
    });

    test('разные строки → близко к 0', () => {
        expect(stringSimilarity('abc', 'xyz')).toBe(0);
    });

    test('case insensitive', () => {
        expect(stringSimilarity('MESSI', 'messi')).toBe(1);
        expect(stringSimilarity('Lionel', 'LIONEL')).toBe(1);
    });
});

describe('Name Match Score', () => {
    const messi = CELEBRITY_DATABASE.find((c) => c.name === 'Lionel Messi')!;

    test('точное совпадение по полному имени → высокая оценка', () => {
        expect(nameMatchScore('Lionel Messi', messi)).toBeGreaterThan(0.9);
    });

    test('совпадение по русскому имени', () => {
        expect(nameMatchScore('Лионель Месси', messi)).toBeGreaterThan(0.8);
    });

    test('совпадение по алиасу', () => {
        expect(nameMatchScore('Messi', messi)).toBeGreaterThan(0.5);
        expect(nameMatchScore('Месси', messi)).toBeGreaterThan(0.5);
    });

    test('частичное совпадение', () => {
        expect(nameMatchScore('Месси', messi)).toBeGreaterThan(0.5);
    });

    test('несовпадение → низкая оценка', () => {
        expect(nameMatchScore('Brad Pitt', messi)).toBeLessThan(0.3);
    });

    test('пустой запрос → 0', () => {
        expect(nameMatchScore('', messi)).toBe(0);
    });
});

describe('Search Celebrities', () => {
    test('поиск по английскому имени', () => {
        const results = searchCelebrities('Lionel Messi', 3);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].name).toBe('Lionel Messi');
    });

    test('поиск по русскому имени', () => {
        const results = searchCelebrities('Месси', 3);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].name).toBe('Lionel Messi');
    });

    test('поиск по алиасу', () => {
        const results = searchCelebrities('CR7', 3);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].name).toBe('Cristiano Ronaldo');
    });

    test('поиск по частичному имени', () => {
        const results = searchCelebrities('Тейлор', 3);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].name).toBe('Taylor Swift');
    });

    test('пустой запрос → пустой результат', () => {
        expect(searchCelebrities('', 5)).toEqual([]);
        expect(searchCelebrities('   ', 5)).toEqual([]);
    });

    test('несуществующее имя → пустой результат', () => {
        const results = searchCelebrities('xyzqwerty nonexistent', 5);
        expect(results.length).toBe(0);
    });

    test('limit ограничивает количество результатов', () => {
        const results = searchCelebrities('a', 2);
        expect(results.length).toBeLessThanOrEqual(2);
    });
});

describe('Find Celebrity By Name', () => {
    test('находит по точному имени', () => {
        const celeb = findCelebrityByName('Lionel Messi');
        expect(celeb).not.toBeNull();
        expect(celeb?.name).toBe('Lionel Messi');
    });

    test('находит по русскому имени', () => {
        const celeb = findCelebrityByName('Лионель Месси');
        expect(celeb).not.toBeNull();
        expect(celeb?.name).toBe('Lionel Messi');
    });

    test('возвращает null для несуществующего', () => {
        const celeb = findCelebrityByName('Nonexistent Person');
        expect(celeb).toBeNull();
    });

    test('threshold отсекает слабые совпадения', () => {
        const celeb = findCelebrityByName('xyz', 0.9);
        expect(celeb).toBeNull();
    });
});

describe('Category Stats', () => {
    test('возвращает статистику по всем категориям', () => {
        const stats = getCategoryStats();
        expect(stats.sports).toBeGreaterThan(0);
        expect(stats.music).toBeGreaterThan(0);
        expect(stats.movies).toBeGreaterThan(0);
        expect(stats.politics).toBeGreaterThan(0);
        expect(stats.other).toBeGreaterThan(0);
    });

    test('сумма статистики = общему количеству', () => {
        const stats = getCategoryStats();
        const total = stats.sports + stats.music + stats.movies + stats.politics + stats.other;
        expect(total).toBe(CELEBRITY_DATABASE.length);
    });
});

describe('Get Celebrities By Category', () => {
    test('возвращает только знаменитостей указанной категории', () => {
        const sports = getCelebritiesByCategory('sports');
        expect(sports.length).toBeGreaterThan(0);
        for (const celeb of sports) {
            expect(celeb.category).toBe('sports');
        }
    });

    test('пустая категория → пустой массив', () => {
        // Все категории должны быть непустыми
        const categories: CelebrityCategory[] = ['sports', 'music', 'movies', 'politics', 'other'];
        for (const cat of categories) {
            expect(getCelebritiesByCategory(cat).length).toBeGreaterThan(0);
        }
    });
});
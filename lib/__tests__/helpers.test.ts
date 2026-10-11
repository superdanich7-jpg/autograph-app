/**
 * Unit Tests — lib/helpers.ts
 * Бизнес-логика: достоверность, спорность, лейблы категорий/редкости/доказательств.
 */

import {
    generateId,
    getAuthenticity,
    getAuthenticityPercent,
    getCategoryLabel,
    getEvidenceLabel,
    getRarityLabel,
    isDisputed,
} from '../helpers';
import { Post, PostCategory } from '../../context/PostsContext';

function makePost(overrides: Partial<Post> = {}): Post {
    return {
        id: 'post-1',
        ownerId: 'user-1',
        ownerName: 'Collector',
        uri: 'https://example.com/photo.jpg',
        caption: '',
        timestamp: '2026-01-01T00:00:00.000Z',
        likes: 0,
        liked: false,
        saved: false,
        comments: [],
        celebrityName: 'Lionel Messi',
        location: 'Buenos Aires',
        dateReceived: '2025-12-31',
        category: 'sports',
        rarity: 'common',
        evidence: ['photo'],
        isAnalyzed: false,
        realVotes: 0,
        fakeVotes: 0,
        realScore: 0,
        fakeScore: 0,
        votesByUser: {},
        voteWeightsByUser: {},
        ...overrides,
    };
}

describe('getAuthenticity', () => {
    test('возвращает 0% при отсутствии голосов', () => {
        const result = getAuthenticity(makePost());
        expect(result.totalVotes).toBe(0);
        expect(result.totalScore).toBe(0);
        expect(result.confidence).toBe(0);
    });

    test('считает процент по сумме очков (не по количеству голосов)', () => {
        const post = makePost({ realVotes: 1, fakeVotes: 1, realScore: 3, fakeScore: 1 });
        const result = getAuthenticity(post);
        expect(result.totalVotes).toBe(2);
        expect(result.totalScore).toBe(4);
        expect(result.confidence).toBe(75);
    });

    test('округляет до целого', () => {
        const post = makePost({ realScore: 1, fakeScore: 2 });
        expect(getAuthenticity(post).confidence).toBe(33);
    });
});

describe('getAuthenticityPercent', () => {
    test('совпадает с confidence из getAuthenticity', () => {
        const post = makePost({ realScore: 7, fakeScore: 3 });
        expect(getAuthenticityPercent(post)).toBe(70);
        expect(getAuthenticityPercent(post)).toBe(getAuthenticity(post).confidence);
    });

    test('0 при нулевом totalScore', () => {
        expect(getAuthenticityPercent(makePost())).toBe(0);
    });
});

describe('isDisputed', () => {
    test('не спорный при 0 голосов', () => {
        expect(isDisputed(makePost())).toBe(false);
    });

    test('спорный при 1:1', () => {
        expect(isDisputed(makePost({ realScore: 1, fakeScore: 1 }))).toBe(true);
    });

    test('спорный при почти равных (2:3)', () => {
        expect(isDisputed(makePost({ realScore: 2, fakeScore: 3 }))).toBe(true);
    });

    test('не спорный при явном перевесе (4:1)', () => {
        expect(isDisputed(makePost({ realScore: 4, fakeScore: 1 }))).toBe(false);
    });

    test('не спорный при totalScore < 2 (1:0)', () => {
        expect(isDisputed(makePost({ realScore: 1, fakeScore: 0 }))).toBe(false);
    });
});

describe('лейблы', () => {
    test('getCategoryLabel возвращает известную категорию', () => {
        expect(getCategoryLabel('sports' as PostCategory)).not.toBe('Другое');
    });

    test('getCategoryLabel возвращает "Другое" для неизвестного значения', () => {
        expect(getCategoryLabel('unknown' as PostCategory)).toBe('Другое');
    });

    test('getRarityLabel покрывает все уровни', () => {
        expect(getRarityLabel('legendary')).toBe('Легендарный');
        expect(getRarityLabel('rare')).toBe('Редкий');
        expect(getRarityLabel('common')).toBe('Обычный');
    });

    test('getEvidenceLabel покрывает все типы доказательств', () => {
        expect(getEvidenceLabel('photo')).toBe('Фото');
        expect(getEvidenceLabel('selfie')).toBe('Селфи');
        expect(getEvidenceLabel('ticket')).toBe('Билет');
        expect(getEvidenceLabel('video')).toBe('Видео');
        expect(getEvidenceLabel('certificate')).toBe('Сертификат');
    });
});

describe('generateId', () => {
    test('возвращает уникальные id', () => {
        const ids = new Set(Array.from({ length: 100 }, () => generateId()));
        expect(ids.size).toBe(100);
    });

    test('непустая строка', () => {
        expect(generateId().length).toBeGreaterThan(0);
    });
});

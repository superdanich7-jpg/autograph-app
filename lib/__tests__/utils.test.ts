/**
 * Unit Tests — тесты для utility functions.
 * Используем Jest для проверки бизнес-логики.
 */

import {
    capitalize,
    clamp,
    formatNumber,
    formatRelativeTime,
    generateId,
    groupBy,
    hexToRgb,
    isEmail,
    isStrongPassword,
    rgbToHex,
    sortBy,
    truncate,
    unique,
} from '../utils';

describe('String Utilities', () => {
    test('truncate cuts long strings', () => {
        expect(truncate('Hello World', 5)).toBe('He...');
        expect(truncate('Hi', 10)).toBe('Hi');
        expect(truncate('', 5)).toBe('');
    });

    test('capitalize capitalizes first letter', () => {
        expect(capitalize('hello')).toBe('Hello');
        expect(capitalize('HELLO')).toBe('Hello');
        expect(capitalize('')).toBe('');
    });
});

describe('Number Utilities', () => {
    test('formatNumber formats large numbers', () => {
        expect(formatNumber(1000)).toBe('1.0K');
        expect(formatNumber(1500000)).toBe('1.5M');
        expect(formatNumber(500)).toBe('500');
    });

    test('clamp constrains values', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-5, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
    });
});

describe('Date Utilities', () => {
    test('formatRelativeTime returns string', () => {
        const result = formatRelativeTime(new Date());
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });
});

describe('Validation Utilities', () => {
    test('isEmail validates emails', () => {
        expect(isEmail('test@example.com')).toBe(true);
        expect(isEmail('invalid')).toBe(false);
        expect(isEmail('')).toBe(false);
    });

    test('isStrongPassword validates passwords', () => {
        expect(isStrongPassword('Abc12345')).toBe(true);
        expect(isStrongPassword('abc')).toBe(false);
        expect(isStrongPassword('12345678')).toBe(false);
    });
});

describe('Array Utilities', () => {
    test('unique removes duplicates', () => {
        expect(unique([1, 1, 2, 3])).toEqual([1, 2, 3]);
        expect(unique(['a', 'a', 'b'])).toEqual(['a', 'b']);
    });

    test('groupBy groups by key', () => {
        const data = [
            { type: 'a', value: 1 },
            { type: 'b', value: 2 },
            { type: 'a', value: 3 },
        ];
        const result = groupBy(data, 'type');
        expect(result.a).toHaveLength(2);
        expect(result.b).toHaveLength(1);
    });

    test('sortBy sorts ascending and descending', () => {
        const data = [{ val: 3 }, { val: 1 }, { val: 2 }];
        expect(sortBy(data, 'val', 'asc').map((d) => d.val)).toEqual([1, 2, 3]);
        expect(sortBy(data, 'val', 'desc').map((d) => d.val)).toEqual([3, 2, 1]);
    });
});

describe('ID Generation', () => {
    test('generateId returns unique strings', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
        expect(typeof id1).toBe('string');
        expect(id1.length).toBeGreaterThan(0);
    });
});

describe('Color Utilities', () => {
    test('hexToRgb parses hex colors', () => {
        expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
        expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
        expect(hexToRgb('invalid')).toBeNull();
    });

    test('rgbToHex converts to hex', () => {
        expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
        expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    });
});
/**
 * Тесты i18n: паритет ключей RU/EN, интерполяция, детект языка.
 */

import { detectLang, Lang, translate, translations, TranslationKey } from '../i18n';

describe('i18n', () => {
    const ruKeys = Object.keys(translations.ru) as TranslationKey[];

    it('полный паритет ключей ru и en', () => {
        expect(Object.keys(translations.en).sort()).toEqual([...ruKeys].sort());
    });

    it('нет пустых переводов', () => {
        for (const key of ruKeys) {
            expect(translations.ru[key].trim()).not.toBe('');
            expect(translations.en[key].trim()).not.toBe('');
        }
    });

    it('интерполяция переменных', () => {
        expect(translate('ru', 'filtersActive', { n: 3 })).toBe('Фильтров активно: 3');
        expect(translate('en', 'voteStats', { real: 2, fake: 1 })).toBe('2 say real • 1 say fake');
        expect(translate('en', 'matchFound', { name: 'Messi' })).toBe('Possible match: Messi');
    });

    it('строка без переменных возвращается как есть', () => {
        expect(translate('ru', 'received', { value: '01.02.2026' })).toBe('Получен: 01.02.2026');
    });

    it('detectLang возвращает валидный язык', () => {
        expect(detectLang()).toMatch(/^(ru|en)$/ as unknown as RegExp);
    });

    it('en-словарь покрывает все типизированные ключи', () => {
        const langs: Lang[] = ['ru', 'en'];
        for (const lang of langs) {
            for (const key of ruKeys) {
                expect(typeof translations[lang][key]).toBe('string');
            }
        }
    });
});

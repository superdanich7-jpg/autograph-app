/**
 * LanguageContext — выбор языка RU/EN с сохранением в AsyncStorage.
 * До загрузки сохранённого выбора используется язык системы (detectLang).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { detectLang, Lang, translate, TranslationKey } from '../lib/i18n';

const LANG_STORAGE_KEY = 'autograph.lang';

type LanguageContextType = {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lang, setLangState] = useState<Lang>(() => detectLang());

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(LANG_STORAGE_KEY);
                if (mounted && (stored === 'ru' || stored === 'en')) {
                    setLangState(stored);
                }
            } catch {
                // Нет доступа к хранилищу — остаёмся на языке системы.
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const setLang = (next: Lang) => {
        setLangState(next);
        AsyncStorage.setItem(LANG_STORAGE_KEY, next).catch(() => {
            // Сохранение — не критичный путь.
        });
    };

    const value = useMemo<LanguageContextType>(
        () => ({
            lang,
            setLang,
            t: (key, vars) => translate(lang, key, vars),
        }),
        [lang],
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};

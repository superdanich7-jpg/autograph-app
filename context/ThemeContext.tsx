import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';
// A1: единый источник токенов — палитры живут в lib/theme.ts, дублей нет.
import { darkTheme, lightTheme } from '../lib/theme';
import type { ThemeColors } from '../lib/theme';

export type ThemeMode = 'light' | 'dark';

export { darkTheme, lightTheme };
export type { ThemeColors };

type ThemeContextType = {
    theme: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const initialMode: ThemeMode = systemScheme === 'dark' ? 'dark' : 'light';
    const [theme, setThemeState] = useState<ThemeMode>(initialMode);
    // Статический пререндер (Node) рисует инлайн-стили в light-теме, а React
    // при гидрации не перезаписывает неизменённые style-атрибуты — фон и панели
    // оставались «застрявшими» в light. Перерендер после монтирования обновляет
    // инлайн-стили у всех потребителей темы.
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);

    const toggleTheme = () => {
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const setTheme = (mode: ThemeMode) => {
        setThemeState(mode);
    };

    const colors = theme === 'light' ? lightTheme : darkTheme;

    // На web за пределами #root виден <body>: без синхронизации под «плавающими»
    // элементами (таб-бар, шапки) проступает белый фон браузера.
    useEffect(() => {
        if (Platform.OS !== 'web' || typeof document === 'undefined') return;
        document.body.style.backgroundColor = colors.background;
        document.body.style.colorScheme = theme;
    }, [colors.background, theme]);

    const value = useMemo(
        () => ({ theme, colors, toggleTheme, setTheme }),
        // hydrated сознательно в зависимостях: его флип перерисовывает потребителей
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [theme, hydrated],
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};

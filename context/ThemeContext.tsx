import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
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

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};

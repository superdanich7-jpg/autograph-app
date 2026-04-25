// context/ThemeContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    primaryText: string;
    card: string;
    placeholder: string;
    danger: string;
};

export const lightTheme: ThemeColors = {
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
    primary: '#007AFF',
    primaryText: '#ffffff',
    card: '#ffffff',
    placeholder: '#999999',
    danger: '#ff3b30',
};

export const darkTheme: ThemeColors = {
    background: '#000000',
    surface: '#1c1c1e',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    border: '#38383a',
    primary: '#0A84FF',
    primaryText: '#ffffff',
    card: '#1c1c1e',
    placeholder: '#666666',
    danger: '#ff453a',
};

type ThemeContextType = {
    theme: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [theme, setThemeState] = useState<ThemeMode>(systemScheme || 'light');

    const toggleTheme = () => {
        setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const setTheme = (mode: ThemeMode) => {
        setThemeState(mode);
    };

    const colors = theme === 'light' ? lightTheme : darkTheme;

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
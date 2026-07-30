import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    borderLight: string;
    primary: string;
    primaryLight: string;
    primaryText: string;
    card: string;
    placeholder: string;
    danger: string;
    dangerLight: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    info: string;
    infoLight: string;
};

export const lightTheme: ThemeColors = {
    background: '#F8FAFC',
    surface: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    primaryText: '#FFFFFF',
    card: '#FFFFFF',
    placeholder: '#94A3B8',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    success: '#22C55E',
    successLight: '#DCFCE7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#EFF6FF',
};

export const darkTheme: ThemeColors = {
    background: '#020617',
    surface: '#0F172A',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    border: '#334155',
    borderLight: '#1E293B',
    primary: '#3B82F6',
    primaryLight: '#1E3A5F',
    primaryText: '#FFFFFF',
    card: '#1E293B',
    placeholder: '#64748B',
    danger: '#EF4444',
    dangerLight: '#450A0A',
    success: '#22C55E',
    successLight: '#052E16',
    warning: '#FBBF24',
    warningLight: '#422006',
    info: '#60A5FA',
    infoLight: '#172554',
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
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
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

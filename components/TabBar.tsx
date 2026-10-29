/**
 * TabBar — стандартная нижняя панель: сплошной фон, тонкая верхняя линия,
 * три слота и золотая кнопка «Добавить» строго по центру, выступающая над панелью.
 */

import { Ionicons } from '@expo/vector-icons';
import { Href, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { hapticSelection } from '../lib/haptics';
import { shadows } from '../lib/theme';
import type { TranslationKey } from '../lib/i18n';

type TabItem = {
    name: string;
    labelKey: TranslationKey;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    href: Href;
};

const sideTabs: TabItem[] = [
    {
        name: 'index',
        labelKey: 'tabFeed',
        icon: 'home-outline',
        activeIcon: 'home',
        href: '/',
    },
    {
        name: 'profile',
        labelKey: 'tabProfile',
        icon: 'person-outline',
        activeIcon: 'person',
        href: '/profile',
    },
];

export default function CustomTabBar() {
    const pathname = usePathname();
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();

    const addActive = pathname === '/upload';

    const renderSide = (tab: TabItem) => {
        const isActive =
            pathname === tab.href ||
            (tab.name === 'index' && pathname === '/') ||
            (tab.name === 'index' && pathname === '/community');

        return (
            <TouchableOpacity
                key={tab.name}
                style={styles.sideItem}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t(tab.labelKey)}
                onPress={() => {
                    hapticSelection();
                    if (!isActive) {
                        router.push(tab.href);
                    }
                }}
            >
                <Ionicons
                    name={isActive ? tab.activeIcon : tab.icon}
                    size={23}
                    color={isActive ? colors.primary : colors.textSecondary}
                />
                <Text
                    style={[
                        styles.label,
                        { color: isActive ? colors.primary : colors.textSecondary },
                    ]}
                    numberOfLines={1}
                >
                    {t(tab.labelKey)}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View
            style={[
                styles.bar,
                {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                    paddingBottom: Math.max(insets.bottom, 10),
                },
            ]}
        >
            {renderSide(sideTabs[0])}

            <View style={styles.centerSlot} pointerEvents="box-none">
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.accent, ...shadows.md }]}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={t('tabAdd')}
                    onPress={() => {
                        hapticSelection();
                        if (!addActive) {
                            router.push('/upload');
                        }
                    }}
                >
                    <Ionicons name="add" size={28} color="#0B1220" />
                </TouchableOpacity>
                <Text
                    style={[styles.label, { color: addActive ? colors.primary : colors.textSecondary }]}
                    numberOfLines={1}
                >
                    {t('tabAdd')}
                </Text>
            </View>

            {renderSide(sideTabs[1])}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        minHeight: 64,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    sideItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        paddingTop: 8,
        paddingBottom: 2,
    },
    centerSlot: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 3,
        paddingBottom: 2,
    },
    fab: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: -20,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
    },
});

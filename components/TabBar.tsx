/**
 * TabBar — современная навигация с floating pill design.
 * Следует трендам 2024-2025: glassmorphism, floating tabs, micro-interactions.
 */

import { Ionicons } from '@expo/vector-icons';
import { Href, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { hapticSelection } from '../lib/haptics';
import { radii, shadows, spacing } from '../lib/theme';

type TabItem = {
    name: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    href: Href;
    accent?: boolean;
};

const tabs: TabItem[] = [
    {
        name: 'index',
        label: 'Лента',
        icon: 'home-outline',
        activeIcon: 'home',
        href: '/',
    },
    {
        name: 'community',
        label: 'Клуб',
        icon: 'people-outline',
        activeIcon: 'people',
        href: '/community',
    },
    {
        name: 'upload',
        label: 'Добавить',
        icon: 'add-circle-outline',
        activeIcon: 'add-circle',
        href: '/upload',
        accent: true,
    },
    {
        name: 'profile',
        label: 'Профиль',
        icon: 'person-outline',
        activeIcon: 'person',
        href: '/profile',
    },
];

export default function CustomTabBar() {
    const pathname = usePathname();
    const router = useRouter();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.container,
                {
                    paddingBottom: Math.max(insets.bottom, 8),
                    backgroundColor: 'transparent',
                },
            ]}
        >
            <View
                style={[
                    styles.tabBar,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        ...shadows.lg,
                    },
                ]}
            >
                {tabs.map((tab) => {
                    const isActive =
                        pathname === tab.href ||
                        (tab.name === 'index' && pathname === '/');

                    return (
                        <TouchableOpacity
                            key={tab.name}
                            style={[
                                styles.tabItem,
                                isActive && styles.tabItemActive,
                                tab.accent && styles.accentItem,
                            ]}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={tab.label}
                            onPress={() => {
                                hapticSelection();
                                if (!isActive) {
                                    router.push(tab.href);
                                }
                            }}
                        >
                            {tab.accent ? (
                                <View
                                    style={[
                                        styles.fab,
                                        {
                                            backgroundColor: isActive
                                                ? colors.primary
                                                : colors.surface,
                                            borderColor: isActive
                                                ? colors.primary
                                                : colors.border,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name={isActive ? tab.activeIcon : tab.icon}
                                        size={24}
                                        color={
                                            isActive
                                                ? colors.primaryText
                                                : colors.textSecondary
                                        }
                                    />
                                </View>
                            ) : (
                                <>
                                    <View
                                        style={[
                                            styles.iconContainer,
                                            isActive && {
                                                backgroundColor: colors.primaryLight,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={isActive ? tab.activeIcon : tab.icon}
                                            size={22}
                                            color={
                                                isActive
                                                    ? colors.primary
                                                    : colors.textSecondary
                                            }
                                        />
                                    </View>
                                    <Text
                                        style={[
                                            styles.label,
                                            {
                                                color: isActive
                                                    ? colors.primary
                                                    : colors.textSecondary,
                                                fontWeight: isActive ? '700' : '500',
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {tab.label}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
    },
    tabBar: {
        flexDirection: 'row',
        minHeight: 72,
        borderWidth: 1,
        borderRadius: radii.xxl,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        borderRadius: radii.lg,
    },
    tabItemActive: {
        // Active state handled by icon container
    },
    accentItem: {
        justifyContent: 'center',
    },
    iconContainer: {
        width: 44,
        height: 32,
        borderRadius: radii.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        width: 52,
        height: 52,
        borderRadius: radii.xl,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
    },
});
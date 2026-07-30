/**
 * AchievementsSection — сетка достижений пользователя.
 * Показывает полученные и недоступные достижения.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import {
    Achievement,
    getAllAchievements,
    getRarityBg,
    getRarityColor,
    getUserAchievements
} from '../lib/achievements';

type Props = {
    userId: string;
};

export default function AchievementsSection({ userId }: Props) {
    const { colors } = useTheme();

    // Don't show achievements for guest users
    if (!userId || userId === 'guest') {
        return null;
    }
    const [all, setAll] = useState<Achievement[]>([]);
    const [earned, setEarned] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, [userId]);

    async function load() {
        setLoading(true);
        try {
            const [allAch, userAch] = await Promise.all([
                getAllAchievements(),
                getUserAchievements(userId),
            ]);
            setAll(allAch);
            setEarned(new Set(userAch.map((ua) => ua.achievement_id)));
        } catch (e) {
            console.warn('Failed to load achievements:', e);
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }

    const earnedCount = all.filter((a) => earned.has(a.id)).length;

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>🏆 Достижения</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {earnedCount}/{all.length}
                </Text>
            </View>

            <View style={styles.progressRow}>
                <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                backgroundColor: colors.primary,
                                width: `${all.length > 0 ? (earnedCount / all.length) * 100 : 0}%`,
                            },
                        ]}
                    />
                </View>
            </View>

            <FlatList
                data={all}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const isEarned = earned.has(item.id);
                    return (
                        <View
                            style={[
                                styles.badge,
                                {
                                    backgroundColor: isEarned
                                        ? getRarityBg(item.rarity)
                                        : colors.surface,
                                    borderColor: isEarned
                                        ? getRarityColor(item.rarity)
                                        : colors.border,
                                    opacity: isEarned ? 1 : 0.45,
                                },
                            ]}
                        >
                            <Text style={styles.icon}>{item.icon}</Text>
                            <Text
                                style={[
                                    styles.badgeTitle,
                                    {
                                        color: isEarned ? colors.text : colors.textSecondary,
                                    },
                                ]}
                                numberOfLines={2}
                            >
                                {item.title}
                            </Text>
                            {isEarned && (
                                <View
                                    style={[
                                        styles.rarityDot,
                                        { backgroundColor: getRarityColor(item.rarity) },
                                    ]}
                                />
                            )}
                            {!isEarned && (
                                <Ionicons
                                    name="lock-closed"
                                    size={12}
                                    color={colors.textSecondary}
                                    style={styles.lockIcon}
                                />
                            )}
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
    },
    loading: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    progressRow: {
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    list: {
        paddingVertical: 4,
        gap: 10,
    },
    badge: {
        width: 90,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    icon: {
        fontSize: 28,
        marginBottom: 4,
    },
    badgeTitle: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    rarityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 4,
    },
    lockIcon: {
        marginTop: 4,
    },
});
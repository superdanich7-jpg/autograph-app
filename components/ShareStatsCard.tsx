/**
 * ShareStatsCard — «виральная» карточка-шаринг статистики коллекционера.
 * Spotify-Wrapped стиль: пользователь делится своими достижениями → органический охват.
 *
 * Использует expo-sharing (уже в проекте) + QR-код профиля из lib/sharing.ts.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePosts } from '../context/PostsContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { hapticMedium, hapticSuccess } from '../lib/haptics';
import { getCategoryLabel } from '../lib/helpers';
import { buildCollectorStatsSummary } from '../lib/stats-share';
import { showToast } from './Toast';

export default function ShareStatsCard() {
    const { posts, profile, reputation } = usePosts();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const [sharing, setSharing] = useState(false);

    const summary = useMemo(() => {
        const totalRealVotes = posts.reduce((s, p) => s + p.realVotes, 0);
        const legendary = posts.filter((p) => p.rarity === 'legendary').length;
        const uniqueCelebrities = new Set(posts.map((p) => p.celebrityName.trim()).filter(Boolean)).size;
        const counts: Record<string, number> = {};
        for (const p of posts) counts[p.category] = (counts[p.category] || 0) + 1;
        const favoriteCategoryValue = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
        const favoriteCategory = favoriteCategoryValue ? getCategoryLabel(favoriteCategoryValue as any) : '';

        return buildCollectorStatsSummary({
            name: profile.name || t('statsCollector'),
            totalPosts: posts.length,
            totalRealVotes,
            legendary,
            uniqueCelebrities,
            favoriteCategory,
            reputationLabel: reputation.label,
            reputationScore: reputation.score,
            profileUrl: Linking.createURL('/profile'),
        });
    }, [posts, profile.name, reputation]);

    const handleShare = async () => {
        if (posts.length === 0) {
            Alert.alert(t('statsShareNothing'), t('statsShareEmpty'));
            return;
        }
        setSharing(true);
        hapticMedium();
        try {
            const available = await Sharing.isAvailableAsync();
            if (available) {
                await Sharing.shareAsync(summary.text, {
                    mimeType: 'text/plain',
                    dialogTitle: t('statsShareCta'),
                    UTI: 'public.plain-text',
                });
                hapticSuccess();
                showToast(t('statsShareThanks'), 'success');
            } else {
                Alert.alert(t('statsShareCta'), summary.text);
            }
        } catch (e) {
            Alert.alert(t('error'), t('statsShareError'));
        } finally {
            setSharing(false);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleShare}
            disabled={sharing}
            activeOpacity={0.85}
        >
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="trophy-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.body}>
                <Text style={[styles.title, { color: colors.text }]}>{summary.headline}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                    {sharing ? t('statsShareOpened') : t('statsShareText', { n: posts.length })}
                </Text>
            </View>
            <View style={[styles.shareChip, { backgroundColor: colors.surface }]}>
                <Ionicons name="share-social-outline" size={18} color={colors.primary} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 3,
        lineHeight: 17,
    },
    shareChip: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

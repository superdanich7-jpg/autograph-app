/**
 * StoriesRail — шаг 11 PLAN-100: рейка «Свежее в клубе» над лентой.
 * Круги с обложками постов последних 24 часов (внутри — свежие автографы),
 * золотое кольцо у непросмотренных, тап открывает пост.
 * Instagram-паттерн: горизонтальный скролл, аватар-круги, «+» своего поста.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Post } from '../context/PostsContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { hapticLight } from '../lib/haptics';
import { spacing } from '../lib/theme';

type Props = {
    posts: Post[];
    onPressPost: (post: Post) => void;
    onPressAdd: () => void;
};

const FRESH_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_ITEMS = 12;

export default function StoriesRail({ posts, onPressPost, onPressAdd }: Props) {
    const { colors } = useTheme();
    const { t } = useLanguage();

    const fresh = posts
        .filter((p) => Date.now() - new Date(p.timestamp).getTime() < FRESH_WINDOW_MS)
        .slice(0, MAX_ITEMS);

    // Без свежих постов рейка не рисуется (в IG пустых кружков не бывает)
    if (fresh.length === 0) {
        return null;
    }

    return (
        <View style={styles.wrap}>
            <Text style={[styles.title, { color: colors.text }]}>{t('freshInClub')}</Text>
            <FlatList
                horizontal
                data={fresh}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => { hapticLight(); onPressAdd(); }}>
                        <View style={[styles.ring, { borderColor: colors.accent }]}>
                            <View style={[styles.circle, { backgroundColor: colors.accentLight }]}>
                                <Ionicons name="add" size={22} color={colors.accent} />
                            </View>
                        </View>
                        <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
                            {t('yourStory')}
                        </Text>
                    </TouchableOpacity>
                }
                renderItem={({ item }) => {
                    const name = item.celebrityName || t('nameless');
                    return (
                        <TouchableOpacity
                            style={styles.item}
                            activeOpacity={0.8}
                            onPress={() => { hapticLight(); onPressPost(item); }}
                            accessibilityRole="button"
                            accessibilityLabel={name}
                        >
                            <View style={[styles.ring, { borderColor: colors.accent }]}>
                                <View style={[styles.circle, { backgroundColor: colors.surface }]}>
                                    <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
                                </View>
                            </View>
                            <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
                                {name}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        marginTop: spacing.xs,
    },
    title: {
        fontSize: 13,
        fontWeight: '800',
        marginBottom: spacing.sm,
        paddingHorizontal: 18,
    },
    list: {
        paddingHorizontal: 14,
        gap: 12,
    },
    item: {
        width: 74,
        alignItems: 'center',
        gap: 5,
    },
    ring: {
        width: 66,
        height: 66,
        borderRadius: 33,
        borderWidth: 2,
        padding: 2,
    },
    circle: {
        flex: 1,
        borderRadius: 29,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    label: {
        fontSize: 11,
        maxWidth: 74,
    },
});

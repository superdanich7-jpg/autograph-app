/**
 * AdvancedSearch — фильтры и поиск по коллекции.
 * Позволяет фильтровать по категории, достоверности, редкости.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Post } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import { getAuthenticityPercent, getCategoryLabel, getRarityLabel } from '../lib/helpers';

const CATEGORIES = ['all', 'sports', 'music', 'movies', 'politics', 'other'];
const CATEGORY_LABELS: Record<string, string> = { all: 'Все', sports: 'Спорт', music: 'Музыка', movies: 'Кино', politics: 'Политика', other: 'Другое' };
const RARITIES = ['all', 'common', 'rare', 'legendary'];
const RARITY_LABELS: Record<string, string> = { all: 'Все', common: 'Обычный', rare: 'Редкий', legendary: 'Легендарный' };
const SORT_OPTIONS = ['date', 'name', 'authenticity'] as const;
const SORT_LABELS: Record<string, string> = { date: 'По дате', name: 'По имени', authenticity: 'По достоверности' };

type SortKey = (typeof SORT_OPTIONS)[number];

type Props = {
    posts: Post[];
    onPostPress: (post: Post) => void;
};

export default function AdvancedSearch({ posts, onPostPress }: Props) {
    const { colors } = useTheme();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [rarity, setRarity] = useState('all');
    const [sortBy, setSortBy] = useState<SortKey>('date');
    const [minAuth, setMinAuth] = useState(0);

    const filtered = useMemo(() => {
        let result = posts;

        // Поиск по тексту
        if (query.trim()) {
            const q = query.toLowerCase();
            result = result.filter(
                (p) => (p.celebrityName || '').toLowerCase().includes(q) || (p.caption || '').toLowerCase().includes(q)
            );
        }

        // Фильтр по категории
        if (category !== 'all') {
            result = result.filter((p) => p.category === category);
        }

        // Фильтр по редкости
        if (rarity !== 'all') {
            result = result.filter((p) => p.rarity === rarity);
        }

        // Фильтр по достоверности
        if (minAuth > 0) {
            result = result.filter((p) => getAuthenticityPercent(p) >= minAuth);
        }

        // Сортировка
        switch (sortBy) {
            case 'name':
                result = [...result].sort((a, b) => (a.celebrityName || '').localeCompare(b.celebrityName || ''));
                break;
            case 'authenticity':
                result = [...result].sort((a, b) => getAuthenticityPercent(b) - getAuthenticityPercent(a));
                break;
            case 'date':
            default:
                result = [...result].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                break;
        }

        return result;
    }, [posts, query, category, rarity, sortBy, minAuth]);

    const hasFilters = query.trim() || category !== 'all' || rarity !== 'all' || minAuth > 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.searchRow}>
                <Ionicons name="search" size={18} color={colors.textSecondary} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Поиск по имени или описанию..."
                    placeholderTextColor={colors.placeholder}
                    returnKeyType="search"
                />
                {hasFilters && (
                    <TouchableOpacity onPress={() => { setQuery(''); setCategory('all'); setRarity('all'); setMinAuth(0); }}>
                        <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.filterRow}>
                <FlatList
                    data={CATEGORIES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(c) => c}
                    renderItem={({ item: c }) => (
                        <TouchableOpacity
                            style={[styles.filterChip, category === c && { backgroundColor: colors.primary }]}
                            onPress={() => setCategory(c)}
                        >
                            <Text style={[styles.filterChipText, category === c && { color: '#fff' }, { color: colors.text }]}>
                                {CATEGORY_LABELS[c]}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ gap: 6 }}
                />
            </View>

            <View style={styles.filterRow}>
                <FlatList
                    data={RARITIES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(r) => r}
                    renderItem={({ item: r }) => (
                        <TouchableOpacity
                            style={[styles.filterChip, rarity === r && { backgroundColor: colors.primary }]}
                            onPress={() => setRarity(r)}
                        >
                            <Text style={[styles.filterChipText, rarity === r && { color: '#fff' }, { color: colors.text }]}>
                                {RARITY_LABELS[r]}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ gap: 6 }}
                />
            </View>

            <View style={styles.sortRow}>
                {SORT_OPTIONS.map((s) => (
                    <TouchableOpacity
                        key={s}
                        style={[styles.sortBtn, sortBy === s && { backgroundColor: colors.primary }]}
                        onPress={() => setSortBy(s)}
                    >
                        <Text style={[styles.sortBtnText, sortBy === s && { color: '#fff' }, { color: colors.text }]}>
                            {SORT_LABELS[s]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.filterRow}>
                <Text style={[styles.countText, { color: colors.textSecondary }]}>Достоверность ≥ {minAuth}%</Text>
                <View style={styles.minAuthRow}>
                    {[0, 20, 40, 60, 80].map((v) => (
                        <TouchableOpacity
                            key={v}
                            style={[styles.minAuthChip, minAuth === v && { backgroundColor: colors.primary }]}
                            onPress={() => setMinAuth(v)}
                        >
                            <Text style={[styles.minAuthText, minAuth === v && { color: '#fff' }, { color: colors.text }]}>
                                {v}%
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>Найдено: {filtered.length}</Text>

            <FlatList
                data={filtered}
                keyExtractor={(p) => p.id}
                scrollEnabled={false}
                renderItem={({ item: post }) => (
                    <TouchableOpacity
                        style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => onPostPress(post)}
                    >
                        <View style={styles.resultRow}>
                            <View style={styles.resultInfo}>
                                <Text style={[styles.resultName, { color: colors.text }]}>{post.celebrityName || 'Без имени'}</Text>
                                <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>
                                    {getCategoryLabel(post.category)} • {getRarityLabel(post.rarity)}
                                </Text>
                            </View>
                            <View style={[styles.authBadge, { backgroundColor: getAuthenticityPercent(post) >= 70 ? '#D1FAE5' : '#FEE2E2' }]}>
                                <Text style={[styles.authBadgeText, { color: getAuthenticityPercent(post) >= 70 ? '#065F46' : '#991B1B' }]}>
                                    {getAuthenticityPercent(post)}%
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
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
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 0,
    },
    filterRow: {
        marginBottom: 10,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '600',
    },
    sortRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 10,
    },
    sortBtn: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    sortBtnText: {
        fontSize: 12,
        fontWeight: '600',
    },
    countText: {
        fontSize: 12,
        marginBottom: 6,
    },
    minAuthRow: {
        flexDirection: 'row',
        gap: 6,
    },
    minAuthChip: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    minAuthText: {
        fontSize: 12,
        fontWeight: '600',
    },
    resultCount: {
        fontSize: 12,
        marginBottom: 10,
    },
    resultCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        marginBottom: 8,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultInfo: {
        flex: 1,
    },
    resultName: {
        fontSize: 14,
        fontWeight: '700',
    },
    resultMeta: {
        fontSize: 12,
        marginTop: 2,
    },
    authBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    authBadgeText: {
        fontSize: 13,
        fontWeight: '700',
    },
});
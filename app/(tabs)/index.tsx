import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Keyboard,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    POST_CATEGORIES,
    Post,
    PostCategory,
    usePosts
} from '../../context/PostsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
    getAuthenticity,
    isDisputed,
} from '../../lib/helpers';
import { getFavoriteCategory, recommendPosts, Recommendation } from '../../lib/recommendations';
import RecommendedRail from '../../components/RecommendedRail';
import ShareSheet from '../../components/ShareSheet';
import PostDetailModal from '../../components/PostDetailModal';
import CommentsModal from '../../components/CommentsModal';
import FeedPostCard from '../../components/FeedPostCard';
import { PostCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, SegmentedControl } from '../../components/ui/primitives';
import { Sheet } from '../../components/ui/Sheet';
import { hapticLight } from '../../lib/haptics';
import { typography } from '../../lib/theme';

export default function FeedScreen() {
    const { posts, profile, currentUserId, canInteract, toggleLike, toggleSaved, addComment, voteAuthenticity, refreshCloudData, syncStatus } = usePosts();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [query, setQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | PostCategory>('all');
    const [onlyVerified, setOnlyVerified] = useState(false);
    const [sortMode, setSortMode] = useState<'latest' | 'trusted' | 'debated'>('latest');
    const [detailPost, setDetailPost] = useState<Post | null>(null);
    const [sharePost, setSharePost] = useState<Post | null>(null);
    const [filtersVisible, setFiltersVisible] = useState(false);

    // R-10: бейдж на кнопке поиска — сколько фильтров активно (поиск/категория/только-подтв./сортировка).
    const activeFilterCount =
        (query.trim() ? 1 : 0) +
        (categoryFilter !== 'all' ? 1 : 0) +
        (onlyVerified ? 1 : 0) +
        (sortMode !== 'latest' ? 1 : 0);

    const resetFilters = () => {
        hapticLight();
        setQuery('');
        setCategoryFilter('all');
        setOnlyVerified(false);
        setSortMode('latest');
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refreshCloudData();
        setRefreshing(false);
    }, [refreshCloudData]);

    const filteredPosts = useMemo(() => {
        const nextPosts = posts.filter((post) => {
            const normalizedQuery = query.trim().toLowerCase();
            const matchesQuery =
                !normalizedQuery ||
                post.celebrityName.toLowerCase().includes(normalizedQuery) ||
                post.location.toLowerCase().includes(normalizedQuery) ||
                post.caption.toLowerCase().includes(normalizedQuery);

            const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
            const authenticity = getAuthenticity(post);
            const matchesVerified = !onlyVerified || authenticity.confidence >= 70;

            return matchesQuery && matchesCategory && matchesVerified;
        });

        if (sortMode === 'trusted') {
            return [...nextPosts].sort((a, b) => {
                const authA = getAuthenticity(a);
                const authB = getAuthenticity(b);
                return authB.confidence - authA.confidence || authB.totalScore - authA.totalScore;
            });
        }

        if (sortMode === 'debated') {
            return [...nextPosts].sort((a, b) => {
                const diffA = Math.abs(a.realScore - a.fakeScore);
                const diffB = Math.abs(b.realScore - b.fakeScore);
                return diffA - diffB || (b.realScore + b.fakeScore) - (a.realScore + a.fakeScore);
            });
        }

        return nextPosts;
    }, [categoryFilter, onlyVerified, posts, query, sortMode]);

    const activePost = posts.find((post) => post.id === selectedPostId);
    const summary = useMemo(() => {
        const verified = posts.filter((post) => getAuthenticity(post).confidence >= 70).length;
        const disputed = posts.filter((post) => isDisputed(post)).length;
        const legendary = posts.filter((post) => post.rarity === 'legendary').length;
        return { verified, disputed, legendary };
    }, [posts]);

    const recommendations = useMemo<Recommendation[]>(
        () =>
            posts.length > 2
                ? recommendPosts(
                    posts,
                    {
                        currentUserId,
                        favoriteCategory: getFavoriteCategory(posts.filter((p) => p.ownerId === currentUserId)),
                    },
                    6
                )
                : [],
        [posts, currentUserId]
    );

    const handleSendComment = () => {
        if (selectedPostId && commentText.trim()) {
            addComment(selectedPostId, commentText);
            setCommentText('');
            Keyboard.dismiss();
        }
    };

    const handleRequireAuth = () => {
        Alert.alert(
            'Требуется вход',
            'Войдите в аккаунт, чтобы лайкать, комментировать и подтверждать автографы.',
            [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Войти', onPress: () => router.push('/auth') },
            ]
        );
    };

    const renderItem = ({ item, index }: { item: Post; index: number }) => (
        <View>
            {index === 3 && recommendations.length > 0 ? (
                <RecommendedRail
                    recommendations={recommendations}
                    colors={colors}
                    onOpenDetail={(post) => setDetailPost(post)}
                />
            ) : null}
            <FeedPostCard
                item={item}
                colors={colors}
                currentUserId={currentUserId}
                canInteract={canInteract}
                onOpenDetail={(post) => setDetailPost(post)}
                onToggleLike={toggleLike}
                onOpenComments={(id) => {
                    setSelectedPostId(id);
                    setCommentsVisible(true);
                }}
                onToggleSaved={toggleSaved}
                onVote={voteAuthenticity}
                onRequireAuth={handleRequireAuth}
            />
        </View>
    );


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={styles.screenHeader}>
                <View style={styles.headerText}>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>{t('feedTitle')}</Text>
                    {activeFilterCount > 0 ? (
                        <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
                            {`Фильтров активно: ${activeFilterCount}`}
                        </Text>
                    ) : null}
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.searchButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => {
                            hapticLight();
                            setFiltersVisible(true);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Поиск и фильтры"
                    >
                        <Ionicons name="search-outline" size={20} color={colors.text} />
                        {activeFilterCount > 0 ? (
                            <View style={[styles.filterBadge, { backgroundColor: colors.accent }]}>
                                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                            </View>
                        ) : null}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.headerAvatar, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}
                        onPress={() => {
                            hapticLight();
                            router.push('/profile');
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Профиль"
                    >
                        <Text style={[styles.headerAvatarText, { color: colors.accent }]}>
                            {(profile.name || 'C').trim().charAt(0).toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {initialLoading && posts.length === 0 ? (
                <View style={styles.list}>
                    <PostCardSkeleton />
                    <PostCardSkeleton />
                    <PostCardSkeleton />
                </View>
            ) : filteredPosts.length === 0 ? (
                <EmptyState
                    style={styles.emptyWrap}
                    icon={posts.length === 0 ? 'sparkles-outline' : 'search-outline'}
                    title={posts.length === 0 ? 'Коллекция пока пуста' : 'Ничего не найдено'}
                    hint={
                        posts.length === 0
                            ? 'Загрузите первый автограф — сообщество проверит его подлинность.'
                            : 'Попробуйте снять часть фильтров или изменить поисковый запрос.'
                    }
                    actionLabel={posts.length === 0 ? 'Добавить автограф' : undefined}
                    onAction={posts.length === 0 ? () => router.push('/(tabs)/upload') : undefined}
                />
            ) : (
                <FlatList
                    data={filteredPosts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                            progressBackgroundColor={colors.card}
                        />
                    }
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={Platform.OS === 'android'}
                    windowSize={5}
                    ListFooterComponent={
                        <View style={styles.feedFooter}>
                            <Ionicons name="checkmark-done-circle" size={22} color={colors.success} />
                            <Text style={[typography.bodySmall, { color: colors.textSecondary, fontWeight: '600' }]}>
                                Вы всё посмотрели
                            </Text>
                        </View>
                    }
                />
            )}

            <CommentsModal
                visible={commentsVisible}
                post={activePost}
                commentText={commentText}
                onChangeText={setCommentText}
                onClose={() => setCommentsVisible(false)}
                onSend={handleSendComment}
                colors={colors}
            />

            <PostDetailModal post={detailPost} visible={Boolean(detailPost)} onClose={() => setDetailPost(null)} onShare={(post) => setSharePost(post)} colors={colors} />
            <ShareSheet visible={Boolean(sharePost)} postId={sharePost?.id || ''} celebrityName={sharePost?.celebrityName || ''} imageUri={sharePost?.uri} onClose={() => setSharePost(null)} />

            {/* R-10: поиск + фильтры + сортировка + сводка — в одном sheet, хедер ленты чистый */}
            <Sheet visible={filtersVisible} onClose={() => setFiltersVisible(false)} title="Поиск и фильтры" subtitle="Лента сразу отреагирует на изменения" size="half">
                <View style={styles.sheetBody}>
                    <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Поиск по имени, месту или заметке"
                            placeholderTextColor={colors.placeholder}
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={() => setFiltersVisible(false)}
                            returnKeyType="search"
                        />
                        {query ? (
                            <TouchableOpacity onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Очистить поиск">
                                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <View style={styles.sheetChips}>
                        <TouchableOpacity
                            style={[styles.filterChip, { backgroundColor: categoryFilter === 'all' ? colors.primary : colors.surface }]}
                            onPress={() => setCategoryFilter('all')}
                        >
                            <Text style={[styles.filterChipText, { color: categoryFilter === 'all' ? colors.primaryText : colors.text }]}>Все</Text>
                        </TouchableOpacity>
                        {POST_CATEGORIES.map((item) => {
                            const active = categoryFilter === item.value;
                            return (
                                <TouchableOpacity
                                    key={item.value}
                                    style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.surface }]}
                                    onPress={() => setCategoryFilter(item.value)}
                                >
                                    <Text style={[styles.filterChipText, { color: active ? colors.primaryText : colors.text }]}>{item.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                        <TouchableOpacity
                            style={[styles.filterChip, { backgroundColor: onlyVerified ? colors.primary : colors.surface }]}
                            onPress={() => setOnlyVerified((prev) => !prev)}
                        >
                            <Text style={[styles.filterChipText, { color: onlyVerified ? colors.primaryText : colors.text }]}>Только подтвержденные</Text>
                        </TouchableOpacity>
                    </View>

                    <SegmentedControl
                        segments={[
                            { key: 'latest', label: 'Новые', icon: 'time-outline' },
                            { key: 'trusted', label: 'Достоверные', icon: 'shield-checkmark-outline' },
                            { key: 'debated', label: 'Спорные', icon: 'help-buoy' },
                        ]}
                        activeKey={sortMode}
                        onChange={(key) => {
                            hapticLight();
                            setSortMode(key as 'latest' | 'trusted' | 'debated');
                        }}
                    />

                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Подтверждено</Text>
                            <Text style={[styles.summaryValue, { color: colors.text }]}>{summary.verified}</Text>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Спорных</Text>
                            <Text style={[styles.summaryValue, { color: colors.text }]}>{summary.disputed}</Text>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Легендарных</Text>
                            <Text style={[styles.summaryValue, { color: colors.text }]}>{summary.legendary}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.resetButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={resetFilters}
                        accessibilityRole="button"
                        accessibilityLabel="Сбросить фильтры"
                    >
                        <Ionicons name="refresh-outline" size={18} color={colors.text} />
                        <Text style={[styles.resetButtonText, { color: colors.text }]}>Сбросить всё</Text>
                    </TouchableOpacity>
                </View>
            </Sheet>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    screenHeader: {
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: '800',
    },
    screenSubtitle: {
        marginTop: 4,
        fontSize: 14,
    },
    headerText: {
        flex: 1,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 999,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAvatarText: {
        fontSize: 16,
        fontWeight: '800',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchButton: {
        borderWidth: 1,
        borderRadius: 999,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    filterBadgeText: {
        color: '#0B1220',
        fontSize: 10,
        fontWeight: '700',
    },
    sheetBody: {
        gap: 14,
        paddingBottom: 24,
    },
    sheetChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    resetButton: {
        borderWidth: 1,
        borderRadius: 14,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    resetButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    filtersWrap: {
        paddingHorizontal: 14,
        paddingBottom: 8,
        gap: 10,
    },
    segmentWrap: {
        paddingHorizontal: 14,
        paddingBottom: 12,
    },
    feedFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 24,
    },
    searchBox: {
        borderWidth: 1,
        borderRadius: 16,
        minHeight: 48,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    filterChips: {
        gap: 8,
        paddingRight: 14,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 14,
        paddingBottom: 10,
    },
    summaryCard: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    summaryLabel: {
        fontSize: 12,
        marginBottom: 6,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    filterChip: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 14,
        paddingBottom: 18,
        gap: 14,
    },
    emptyWrap: {
        flex: 1,
        paddingHorizontal: 18,
        justifyContent: 'center',
    },
});

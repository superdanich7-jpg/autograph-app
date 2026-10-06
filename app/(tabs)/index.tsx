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
import { useTheme } from '../../context/ThemeContext';
import {
    getAuthenticity,
    isDisputed,
} from '../../lib/helpers';
import ShareSheet from '../../components/ShareSheet';
import PostDetailModal from '../../components/PostDetailModal';
import CommentsModal from '../../components/CommentsModal';
import FeedPostCard from '../../components/FeedPostCard';
import { PostCardSkeleton } from '../../components/ui/Skeleton';

export default function FeedScreen() {
    const { posts, profile, currentUserId, canInteract, toggleLike, toggleSaved, addComment, voteAuthenticity, refreshCloudData, syncStatus } = usePosts();
    const { colors } = useTheme();
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

    const renderItem = ({ item }: { item: Post }) => (
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
    );


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={styles.screenHeader}>
                <View>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>Коллекция</Text>
                    <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
                        Поиск, фильтры и быстрая проверка достоверности
                    </Text>
                </View>
                <View style={[styles.userPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
                    <Text style={[styles.userPillText, { color: colors.text }]}>{profile.name}</Text>
                </View>
            </View>

            <View style={styles.filtersWrap}>
                <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Поиск по имени, месту или заметке"
                        placeholderTextColor={colors.placeholder}
                        value={query}
                        onChangeText={setQuery}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
                    <TouchableOpacity
                        style={[styles.filterChip, { backgroundColor: categoryFilter === 'all' ? colors.primary : colors.surface }]}
                        onPress={() => setCategoryFilter('all')}
                    >
                        <Text style={[styles.filterChipText, { color: categoryFilter === 'all' ? colors.primaryText : colors.text }]}>
                            Все
                        </Text>
                    </TouchableOpacity>
                    {POST_CATEGORIES.map((item) => {
                        const active = categoryFilter === item.value;
                        return (
                            <TouchableOpacity
                                key={item.value}
                                style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.surface }]}
                                onPress={() => setCategoryFilter(item.value)}
                            >
                                <Text style={[styles.filterChipText, { color: active ? colors.primaryText : colors.text }]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                    <TouchableOpacity
                        style={[styles.filterChip, { backgroundColor: onlyVerified ? colors.primary : colors.surface }]}
                        onPress={() => setOnlyVerified((prev) => !prev)}
                    >
                        <Text style={[styles.filterChipText, { color: onlyVerified ? colors.primaryText : colors.text }]}>
                            Только подтвержденные
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, { backgroundColor: sortMode === 'latest' ? colors.primary : colors.surface }]}
                        onPress={() => setSortMode('latest')}
                    >
                        <Text style={[styles.filterChipText, { color: sortMode === 'latest' ? colors.primaryText : colors.text }]}>
                            Сначала новые
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, { backgroundColor: sortMode === 'trusted' ? colors.primary : colors.surface }]}
                        onPress={() => setSortMode('trusted')}
                    >
                        <Text style={[styles.filterChipText, { color: sortMode === 'trusted' ? colors.primaryText : colors.text }]}>
                            Самые достоверные
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, { backgroundColor: sortMode === 'debated' ? colors.primary : colors.surface }]}
                        onPress={() => setSortMode('debated')}
                    >
                        <Text style={[styles.filterChipText, { color: sortMode === 'debated' ? colors.primaryText : colors.text }]}>
                            Самые спорные
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

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

            {initialLoading && posts.length === 0 ? (
                <View style={styles.list}>
                    <PostCardSkeleton />
                    <PostCardSkeleton />
                    <PostCardSkeleton />
                </View>
            ) : filteredPosts.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
                            <Ionicons name="search-outline" size={28} color={colors.primary} />
                        </View>
                        <Text style={[styles.emptyText, { color: colors.text }]}>Ничего не найдено</Text>
                        <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                            Попробуйте снять часть фильтров или изменить поисковый запрос.
                        </Text>
                    </View>
                </View>
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
        fontWeight: '700',
    },
    screenSubtitle: {
        marginTop: 4,
        fontSize: 14,
    },
    userPill: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    userPillText: {
        fontSize: 12,
        fontWeight: '600',
    },
    filtersWrap: {
        paddingHorizontal: 14,
        paddingBottom: 8,
        gap: 10,
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
    emptyCard: {
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 28,
        alignItems: 'center',
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyHint: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});

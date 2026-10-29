import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { usePosts } from '../../context/PostsContext';
import { useLanguage } from '../../context/LanguageContext';
import { trustLabel } from '../../lib/i18n';
import { useTheme } from '../../context/ThemeContext';
import { getAuthenticityPercent } from '../../lib/helpers';
import { getTrustTier } from '../../lib/trust';

export default function CommunityScreen() {
    const { posts, profile, reputation, communityCollectors, toggleFollowCollector } = usePosts();
    const { colors } = useTheme();
    const { t, lang } = useLanguage();
    const router = useRouter();

    const leaderboard = useMemo(() => {
        const board = [
            ...communityCollectors,
            {
                id: 'you',
                name: profile.name,
                badge: '*',
                specialty: t('yourCollection'),
                score: reputation.score,
                featuredCelebrity: posts[0]?.celebrityName || t('upTitle'),
            },
        ].sort((a, b) => b.score - a.score);

        return board.map((item, index) => ({ ...item, rank: index + 1 }));
    }, [communityCollectors, posts, profile.name, reputation.score]);

    const hottestPosts = useMemo(
        () =>
            [...posts]
                .sort((a, b) => getAuthenticityPercent(b) - getAuthenticityPercent(a) || b.realScore - a.realScore)
                .slice(0, 3),
        [posts]
    );

    const disputedPosts = useMemo(
        () =>
            [...posts]
                .filter((post) => post.realScore + post.fakeScore >= 2 && Math.abs(post.realScore - post.fakeScore) <= 1)
                .sort((a, b) => b.realScore + b.fakeScore - (a.realScore + a.fakeScore))
                .slice(0, 3),
        [posts]
    );

    const activityFeed = useMemo(() => {
        const activities = posts.slice(0, 5).map((post, index) => ({
            id: `${post.id}-${index}`,
            text:
                index % 2 === 0
                    ? t('activityUploaded', { name: profile.name, card: post.celebrityName, votes: post.realVotes })
                    : t('activitySaved', { name: profile.name, card: post.celebrityName }),
        }));

        if (activities.length === 0) {
            return [
                { id: 'seed-1', text: t('demoActivity1') },
                { id: 'seed-2', text: t('demoActivity2') },
            ];
        }

        return activities;
    }, [posts, profile.name]);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background }]}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>{t('clubTitle')}</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {t('clubSubtitle')}
                    </Text>
                </View>

                <Card variant="default" padding="md">
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('topCollectors')}</Text>
                        <Badge label={t('demoBadge')} variant="gold" size="sm" />
                    </View>
                    {leaderboard.map((item) => {
                        const isFollowing = profile.following.includes(item.id);
                        const isCurrentUser = item.id === 'you';

                        const rowBody = (
                            <View style={styles.boardLeft}>
                                <Text style={styles.boardBadge}>{item.badge}</Text>
                                <View>
                                    <Text style={[styles.boardName, { color: colors.text }]}>
                                        {item.rank}. {item.name}
                                    </Text>
                                    <Text style={[styles.boardHint, { color: colors.textSecondary }]}>
                                        {item.specialty} • {item.featuredCelebrity}
                                    </Text>
                                    <View style={[styles.trustChip, { backgroundColor: colors.surface }]}>
                                        <Text style={styles.trustChipText}>
                                            {getTrustTier(item.score).icon} {trustLabel(getTrustTier(item.score).tier, lang)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );

                        return (
                            <View key={item.id} style={[styles.boardRow, { borderBottomColor: colors.border }]}>
                                {isCurrentUser ? (
                                    <View style={styles.boardLinkWrap}>{rowBody}</View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.boardLinkWrap}
                                        activeOpacity={0.82}
                                        onPress={() => router.push({ pathname: '/collector/[id]', params: { id: item.id } })}
                                    >
                                        {rowBody}
                                    </TouchableOpacity>
                                )}

                                <View style={styles.boardRight}>
                                    <Text style={[styles.boardScore, { color: colors.text }]}>{item.score}</Text>
                                    {!isCurrentUser ? (
                                        <TouchableOpacity
                                            style={[
                                                styles.followButton,
                                                { backgroundColor: isFollowing ? colors.surface : colors.primary },
                                            ]}
                                            onPress={() => toggleFollowCollector(item.id)}
                                        >
                                            <Text
                                                style={[
                                                    styles.followButtonText,
                                                    { color: isFollowing ? colors.text : colors.primaryText },
                                                ]}
                                            >
                                                {isFollowing ? t('following') : t('follow')}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            </View>
                        );
                    })}
                </Card>

                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('subscriptions')}</Text>
                        <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>
                            {t('followingCount', { n: profile.following.length })}
                        </Text>
                    </View>
                    {profile.following.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {t('noFollowing')}
                        </Text>
                    ) : (
                        communityCollectors
                            .filter((collector) => profile.following.includes(collector.id))
                            .map((collector) => (
                                <View key={collector.id} style={[styles.followingRow, { backgroundColor: colors.surface }]}>
                                    <View>
                                        <Text style={[styles.followingName, { color: colors.text }]}>{collector.name}</Text>
                                        <Text style={[styles.followingHint, { color: colors.textSecondary }]}>
                                            {t('collectorScore', { specialty: collector.specialty, score: collector.score })}
                                        </Text>
                                    </View>
                                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                                </View>
                            ))
                    )}
                </View>

                <Card variant="default" padding="md">
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('activityFeed')}</Text>
                        <Badge label={t('latestEvents')} variant="default" size="sm" />
                    </View>
                    {activityFeed.map((item) => (
                        <View key={item.id} style={[styles.activityRow, { borderBottomColor: colors.border }]}>
                            <View style={[styles.activityIcon, { backgroundColor: colors.surface }]}>
                                <Ionicons name="pulse-outline" size={16} color={colors.primary} />
                            </View>
                            <Text style={[styles.activityText, { color: colors.text }]}>{item.text}</Text>
                        </View>
                    ))}
                </Card>

                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('strongCards')}</Text>
                        <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>{t('bestTrust')}</Text>
                    </View>
                    {hottestPosts.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {t('noShowcase')}
                        </Text>
                    ) : (
                        hottestPosts.map((post) => (
                            <View key={post.id} style={[styles.postRow, { borderBottomColor: colors.border }]}>
                                <View style={[styles.postIcon, { backgroundColor: colors.surface }]}>
                                    <Ionicons name="flame-outline" size={18} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.postName, { color: colors.text }]}>{post.celebrityName}</Text>
                                    <Text style={[styles.postMeta, { color: colors.textSecondary }]}>
                                        {t('cardVerifications', { location: post.location, votes: post.realVotes })}
                                    </Text>
                                </View>
                                <Text style={[styles.postScore, { color: colors.text }]}>{getAuthenticityPercent(post)}%</Text>
                            </View>
                        ))
                    )}
                </View>

                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('disputedCases')}</Text>
                        <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>{t('needVotes')}</Text>
                    </View>
                    {disputedPosts.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {t('noDisputed')}
                        </Text>
                    ) : (
                        disputedPosts.map((post) => (
                            <View key={post.id} style={[styles.postRow, { borderBottomColor: colors.border }]}>
                                <View style={[styles.postIcon, { backgroundColor: colors.surface }]}>
                                    <Ionicons name="help-circle-outline" size={18} color={colors.danger} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.postName, { color: colors.text }]}>{post.celebrityName}</Text>
                                    <Text style={[styles.postMeta, { color: colors.textSecondary }]}>
                                        {t('cardVotesSplit', { real: post.realVotes, fake: post.fakeVotes })}
                                    </Text>
                                </View>
                                <Text style={[styles.postScore, { color: colors.text }]}>{getAuthenticityPercent(post)}%</Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    content: {
        padding: 16,
        paddingBottom: 20,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
    },
    sectionCard: {
        borderWidth: 1,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    sectionMeta: {
        fontSize: 12,
        fontWeight: '600',
    },
    boardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 10,
    },
    boardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    boardLinkWrap: {
        flex: 1,
    },
    boardRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    boardBadge: {
        fontSize: 22,
    },
    boardName: {
        fontSize: 15,
        fontWeight: '700',
    },
    boardHint: {
        marginTop: 2,
        fontSize: 12,
    },
    trustChip: {
        alignSelf: 'flex-start',
        marginTop: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    trustChipText: {
        fontSize: 11,
        fontWeight: '700',
    },
    boardScore: {
        fontSize: 16,
        fontWeight: '700',
    },
    followButton: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    followButtonText: {
        fontSize: 12,
        fontWeight: '700',
    },
    followingRow: {
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    followingName: {
        fontSize: 14,
        fontWeight: '700',
    },
    followingHint: {
        marginTop: 2,
        fontSize: 12,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    activityIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    postRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    postIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    postName: {
        fontSize: 15,
        fontWeight: '700',
    },
    postMeta: {
        marginTop: 2,
        fontSize: 12,
    },
    postScore: {
        fontSize: 15,
        fontWeight: '700',
    },
    emptyText: {
        fontSize: 14,
        lineHeight: 20,
    },
});

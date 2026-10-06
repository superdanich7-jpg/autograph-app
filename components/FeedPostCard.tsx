import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Post } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import {
    getAuthenticity,
    getCategoryLabel,
    getEvidenceLabel,
    getRarityLabel,
    isDisputed,
} from '../lib/helpers';
import Badge from './ui/Badge';
import VoteButton from './ui/VoteButton';

type Colors = ReturnType<typeof useTheme>['colors'];

export default function FeedPostCard({
    item,
    colors,
    currentUserId,
    canInteract,
    onOpenDetail,
    onToggleLike,
    onOpenComments,
    onToggleSaved,
    onVote,
    onRequireAuth,
}: {
    item: Post;
    colors: Colors;
    currentUserId: string;
    canInteract: boolean;
    onOpenDetail: (post: Post) => void;
    onToggleLike: (id: string) => void;
    onOpenComments: (id: string) => void;
    onToggleSaved: (id: string) => void;
    onVote: (id: string, vote: 'real' | 'fake') => void;
    onRequireAuth: () => void;
}) {
    const authenticity = getAuthenticity(item);
    const userVote = item.votesByUser[currentUserId];
    const disputed = isDisputed(item);
    const isOwnPost = item.ownerId === currentUserId;
    const votingDisabled = !canInteract || isOwnPost;

    return (
        <View style={[styles.post, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.postHeader}>
                <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                    <Ionicons name="person" size={18} color={colors.textSecondary} />
                </View>
                <View style={styles.headerText}>
                    <Text style={[styles.username, { color: colors.text }]}>{item.celebrityName || 'Autograph User'}</Text>
                    <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                        {new Date(item.timestamp).toLocaleDateString('ru-RU')}
                        {item.location ? ` • ${item.location}` : ''}
                    </Text>
                </View>
            </View>

            <TouchableOpacity activeOpacity={0.92} onPress={() => onOpenDetail(item)}>
                <Image source={{ uri: item.uri }} style={styles.postImage} resizeMode="cover" />
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => {
                        if (!canInteract) {
                            onRequireAuth();
                            return;
                        }
                        onToggleLike(item.id);
                    }}
                    style={[styles.actionButton, { backgroundColor: colors.surface }]}
                    activeOpacity={0.8}
                >
                    <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={18} color={item.liked ? colors.danger : colors.text} />
                    <Text style={[styles.actionText, { color: colors.text }]}>{item.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.surface }]}
                    onPress={() => {
                        if (!canInteract) {
                            onRequireAuth();
                            return;
                        }
                        onOpenComments(item.id);
                    }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
                    <Text style={[styles.actionText, { color: colors.text }]}>{item.comments.length}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.surface }]}
                    onPress={() => onToggleSaved(item.id)}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={item.saved ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        color={item.saved ? colors.primary : colors.text}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.metaBlock}>
                <Text style={[styles.metaTitle, { color: colors.text }]}>{item.celebrityName || 'Автограф без имени'}</Text>
                <Text style={[styles.metaLine, { color: colors.textSecondary }]}>
                    Автор: {item.ownerName || 'Collector'}
                </Text>
                <Text style={[styles.metaLine, { color: colors.textSecondary }]}>
                    Получен: {item.dateReceived || 'Дата не указана'}
                </Text>
                {item.caption ? <Text style={[styles.caption, { color: colors.text }]}>{item.caption}</Text> : null}
            </View>

            <View style={styles.badgesRow}>
                <Badge label={getCategoryLabel(item.category)} variant="primary" size="sm" />
                <Badge label={getRarityLabel(item.rarity)} variant={item.rarity === 'legendary' ? 'warning' : 'default'} size="sm" />
                {disputed ? (
                    <Badge label="Спорный" variant="danger" size="sm" />
                ) : null}
                {item.evidence.slice(0, 2).map((entry) => (
                    <Badge key={entry} label={getEvidenceLabel(entry)} variant="default" size="sm" />
                ))}
            </View>

            {item.isAnalyzed ? (
                <View style={[styles.aiCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.aiTitleRow}>
                        <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                        <Text style={[styles.aiTitle, { color: colors.text }]}>Предварительная проверка</Text>
                    </View>
                    <Text style={[styles.aiHint, { color: colors.textSecondary }]}>
                        Возможное совпадение: {item.aiSuggestion || item.celebrityName}
                        {typeof item.aiConfidence === 'number' ? ` (${item.aiConfidence}% совпадения)` : ''}
                    </Text>
                </View>
            ) : null}

            <View style={styles.voteSection}>
                <View style={styles.voteButtonsRow}>
                    <VoteButton
                        label="Подтверждаю"
                        icon="checkmark-circle"
                        active={userVote === 'real'}
                        color={colors.primary}
                        surface={colors.surface}
                        text={colors.text}
                        onPress={() => onVote(item.id, 'real')}
                        disabled={votingDisabled}
                    />
                    <VoteButton
                        label="Фейк"
                        icon="close-circle"
                        active={userVote === 'fake'}
                        color={colors.danger}
                        surface={colors.surface}
                        text={colors.text}
                        onPress={() => onVote(item.id, 'fake')}
                        disabled={votingDisabled}
                    />
                </View>

                {votingDisabled ? (
                    <Text style={[styles.interactionHint, { color: colors.textSecondary }]}>
                        {!canInteract
                            ? 'Войдите, чтобы лайкать, комментировать и подтверждать автографы.'
                            : 'За собственный пост голосовать нельзя.'}
                    </Text>
                ) : null}

                <View style={styles.voteStatsRow}>
                    <Text style={[styles.voteStatsText, { color: colors.textSecondary }]}>
                        {item.realVotes} за реальный • {item.fakeVotes} за фейк
                    </Text>
                    <Text style={[styles.voteConfidence, { color: colors.text }]}>
                        {authenticity.totalVotes === 0 ? 'Нет голосов' : `${authenticity.confidence}% достоверности`}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    post: {
        borderWidth: 1,
        borderRadius: 22,
        overflow: 'hidden',
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    headerText: {
        flex: 1,
    },
    username: {
        fontSize: 15,
        fontWeight: '700',
    },
    timestamp: {
        marginTop: 2,
        fontSize: 12,
    },
    postImage: {
        width: '100%',
        height: 340,
    },
    actions: {
        flexDirection: 'row',
        paddingHorizontal: 14,
        paddingTop: 12,
        gap: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 6,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    metaBlock: {
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 12,
        gap: 6,
    },
    metaTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    metaLine: {
        fontSize: 13,
    },
    caption: {
        fontSize: 14,
        lineHeight: 20,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 14,
        paddingBottom: 12,
    },
    aiCard: {
        marginHorizontal: 14,
        marginBottom: 12,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 4,
    },
    aiTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    aiTitle: {
        fontSize: 13,
        fontWeight: '700',
    },
    aiHint: {
        fontSize: 13,
        lineHeight: 18,
    },
    voteSection: {
        paddingHorizontal: 14,
        paddingBottom: 16,
        gap: 10,
    },
    voteButtonsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    interactionHint: {
        fontSize: 12,
        lineHeight: 17,
    },
    voteStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    voteStatsText: {
        fontSize: 12,
        flex: 1,
    },
    voteConfidence: {
        fontSize: 12,
        fontWeight: '700',
    },
});

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Post } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../lib/haptics';
import {
    getCategoryLabel,
    getEvidenceLabel,
    getRarityLabel,
    isDisputed,
} from '../lib/helpers';
import { getAuthenticityVerdict } from '../lib/authenticity';
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
    const verdict = getAuthenticityVerdict(item);
    const userVote = item.votesByUser[currentUserId];
    const [imageError, setImageError] = useState(false);
    const disputed = isDisputed(item);
    const isOwnPost = item.ownerId === currentUserId;
    const votingDisabled = !canInteract || isOwnPost;

    // Instagram-style double-tap to like: heart overlay + haptic + auth guard.
    // Single tap opens detail, but is debounced so a following tap completes the like.
    const heartAnim = useRef(new Animated.Value(0)).current;
    const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        heartAnim.setValue(0);
    }, [heartAnim, item.id]);

    useEffect(() => () => {
        if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
    }, []);

    const runLike = () => {
        if (!canInteract) {
            onRequireAuth();
            return;
        }
        if (!item.liked) {
            onToggleLike(item.id);
        }
        hapticMedium();
        Animated.sequence([
            Animated.spring(heartAnim, { toValue: 1, useNativeDriver: true, friction: 3 }),
            Animated.timing(heartAnim, { toValue: 0, delay: 500, duration: 400, useNativeDriver: true }),
        ]).start();
    };

    const handleImagePress = () => {
        if (singleTapTimer.current) {
            clearTimeout(singleTapTimer.current);
            singleTapTimer.current = null;
            runLike();
            return;
        }
        singleTapTimer.current = setTimeout(() => {
            singleTapTimer.current = null;
            onOpenDetail(item);
        }, 260);
    };

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

            <TouchableOpacity activeOpacity={0.92} onPress={handleImagePress}>
                {imageError ? (
                    <View
                        style={[
                            styles.postImage,
                            { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
                        ]}
                    >
                        <Ionicons name="image-outline" size={44} color={colors.textSecondary} />
                        <Text style={[styles.caption, { color: colors.textSecondary }]}>
                            Фото не удалось загрузить
                        </Text>
                    </View>
                ) : (
                    <Image
                        source={{ uri: item.uri }}
                        style={styles.postImage}
                        resizeMode={Platform.OS === 'web' ? 'contain' : 'cover'}
                        onError={() => setImageError(true)}
                    />
                )}
                {/* B2: вердикт-оверлей на фото (glass) — подлинность видна до открытия */}
                <View
                    pointerEvents="none"
                    style={[
                        styles.verdictOverlay,
                        {
                            backgroundColor: colors.glass,
                            borderColor:
                                verdict.colorHint === 'success' ? colors.success
                                    : verdict.colorHint === 'danger' ? colors.danger
                                        : verdict.colorHint === 'warning' ? colors.warning
                                            : colors.info,
                        },
                    ]}
                >
                    <Ionicons
                        name={
                            verdict.verdict === 'genuine' ? 'shield-checkmark'
                                : verdict.verdict === 'likely-fake' ? 'warning'
                                    : verdict.verdict === 'disputed' ? 'help-buoy'
                                        : 'help-circle-outline'
                        }
                        size={14}
                        color={
                            verdict.colorHint === 'success' ? colors.success
                                : verdict.colorHint === 'danger' ? colors.danger
                                    : verdict.colorHint === 'warning' ? colors.warning
                                        : colors.info
                        }
                    />
                    <Text
                        style={[
                            styles.verdictOverlayText,
                            {
                                color: verdict.colorHint === 'success' ? colors.success
                                    : verdict.colorHint === 'danger' ? colors.danger
                                        : verdict.colorHint === 'warning' ? colors.warning
                                            : colors.info,
                            },
                        ]}
                    >
                        {verdict.label} · {verdict.score}%
                    </Text>
                </View>
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.heartOverlay,
                        {
                            opacity: heartAnim,
                            transform: [
                                { scale: heartAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.15] }) },
                            ],
                        },
                    ]}
                >
                    <Ionicons name="heart" size={96} color="#ffffff" />
                </Animated.View>
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => {
                        if (!canInteract) {
                            onRequireAuth();
                            return;
                        }
                        onToggleLike(item.id);
                        hapticLight();
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

            {disputed ? (
                <TouchableOpacity
                    style={[styles.debateBanner, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}
                    onPress={() => {
                        if (!canInteract) {
                            onRequireAuth();
                            return;
                        }
                        onOpenComments(item.id);
                    }}
                    activeOpacity={0.85}
                >
                    <Ionicons name="help-buoy" size={20} color={colors.warning} />
                    <View style={styles.debateBannerBody}>
                        <Text style={[styles.debateBannerTitle, { color: colors.text }]}>Спорный автограф</Text>
                        <Text style={[styles.debateBannerHint, { color: colors.textSecondary }]}>
                            Сообщество разделилось — присоединиться к дискуссии
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.warning} />
                </TouchableOpacity>
            ) : null}

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
                        onPress={() => { onVote(item.id, 'real'); hapticMedium(); }}
                        disabled={votingDisabled}
                    />
                    <VoteButton
                        label="Фейк"
                        icon="close-circle"
                        active={userVote === 'fake'}
                        color={colors.danger}
                        surface={colors.surface}
                        text={colors.text}
                        onPress={() => { onVote(item.id, 'fake'); hapticMedium(); }}
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
                    <View
                        style={[
                            styles.verdictPill,
                            {
                                backgroundColor: verdict.colorHint === 'success' ? colors.successLight
                                    : verdict.colorHint === 'danger' ? colors.dangerLight
                                        : verdict.colorHint === 'warning' ? colors.warningLight
                                            : colors.infoLight,
                            },
                        ]}
                    >
                        <Ionicons
                            name={
                                verdict.verdict === 'genuine' ? 'shield-checkmark'
                                    : verdict.verdict === 'likely-fake' ? 'warning'
                                        : verdict.verdict === 'disputed' ? 'help-buoy'
                                            : 'help-circle-outline'
                            }
                            size={13}
                            color={
                                verdict.colorHint === 'success' ? colors.success
                                    : verdict.colorHint === 'danger' ? colors.danger
                                        : verdict.colorHint === 'warning' ? colors.warning
                                            : colors.info
                            }
                        />
                        <Text
                            style={[
                                styles.verdictPillText,
                                {
                                    color: verdict.colorHint === 'success' ? colors.success
                                        : verdict.colorHint === 'danger' ? colors.danger
                                            : verdict.colorHint === 'warning' ? colors.warning
                                                : colors.info,
                                },
                            ]}
                        >
                            {verdict.label} · {verdict.score}%
                        </Text>
                    </View>
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
    heartOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
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
        justifyContent: 'center',
        minHeight: 48,
        borderRadius: 999,
        paddingHorizontal: 16,
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
    debateBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 14,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
    },
    debateBannerBody: {
        flex: 1,
    },
    debateBannerTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    debateBannerHint: {
        fontSize: 12,
        lineHeight: 17,
        marginTop: 2,
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
        flex: 1,
    },
    verdictPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 4,
    },
    verdictPillText: {
        fontSize: 11,
        fontWeight: '700',
    },
    verdictOverlay: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    verdictOverlayText: {
        fontSize: 12,
        fontWeight: '800',
    },
});

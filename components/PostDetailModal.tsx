import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Post } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import { getAuthenticity, getCategoryLabel, getEvidenceLabel, getRarityLabel } from '../lib/helpers';

type Colors = ReturnType<typeof useTheme>['colors'];

export default function PostDetailModal({
    post,
    visible,
    onClose,
    onShare,
    colors,
}: {
    post: Post | null;
    visible: boolean;
    onClose: () => void;
    onShare?: (post: Post) => void;
    colors: Colors;
}) {
    if (!post) return null;

    const authenticity = getAuthenticity(post);

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
            <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>{post.celebrityName}</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => onShare?.(post)} style={styles.headerActionBtn}>
                            <Ionicons name="share-outline" size={22} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.detailScroll}>
                    <Image source={{ uri: post.uri }} style={styles.detailImage} resizeMode="cover" />

                    <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.detailTitle, { color: colors.text }]}>{post.celebrityName}</Text>
                        <Text style={[styles.detailMeta, { color: colors.textSecondary }]}>
                            {post.location} • {post.dateReceived}
                        </Text>
                        <Text style={[styles.detailDescription, { color: colors.text }]}>{post.caption || 'Без описания'}</Text>

                        <View style={styles.detailBadges}>
                            <View style={[styles.badge, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.badgeText, { color: colors.text }]}>{getCategoryLabel(post.category)}</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.badgeText, { color: colors.text }]}>{getRarityLabel(post.rarity)}</Text>
                            </View>
                        </View>

                        <Text style={[styles.evidenceTitle, { color: colors.textSecondary }]}>Доказательства</Text>
                        <View style={styles.detailBadges}>
                            {post.evidence.map((item) => (
                                <View key={item} style={[styles.badge, { backgroundColor: colors.surface }]}>
                                    <Text style={[styles.badgeText, { color: colors.text }]}>{getEvidenceLabel(item)}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.detailStats}>
                            <Text style={[styles.detailMeta, { color: colors.textSecondary }]}>
                                {post.realVotes} за реальный • {post.fakeVotes} за фейк
                            </Text>
                            <Text style={[styles.detailConfidence, { color: colors.text }]}>
                                {authenticity.totalVotes === 0 ? 'Нет голосов' : `${authenticity.confidence}% достоверности`}
                            </Text>
                        </View>

                        {post.isAnalyzed ? (
                            <View style={[styles.aiCard, { backgroundColor: colors.surface }]}>
                                <View style={styles.aiTitleRow}>
                                    <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                                    <Text style={[styles.aiTitle, { color: colors.text }]}>Предварительная проверка</Text>
                                </View>
                                <Text style={[styles.aiHint, { color: colors.textSecondary }]}>
                                    Возможное совпадение: {post.aiSuggestion || post.celebrityName}
                                    {typeof post.aiConfidence === 'number' ? ` (${post.aiConfidence}% совпадения)` : ''}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: { flex: 1 },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    modalTitle: { fontSize: 19, fontWeight: '700' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerActionBtn: { padding: 6 },
    closeButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailScroll: {
        padding: 16,
        gap: 16,
    },
    detailImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 22,
    },
    detailCard: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 16,
        gap: 10,
    },
    detailTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    detailMeta: {
        fontSize: 13,
        lineHeight: 18,
    },
    detailDescription: {
        fontSize: 15,
        lineHeight: 21,
    },
    detailBadges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    badge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    evidenceTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    detailStats: {
        gap: 6,
    },
    detailConfidence: {
        fontSize: 13,
        fontWeight: '700',
    },
    aiCard: {
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
});
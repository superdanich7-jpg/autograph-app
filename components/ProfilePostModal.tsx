import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Post, usePosts } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import { getAuthenticityPercent, getCategoryLabel, getRarityLabel } from '../lib/helpers';
import { showToast } from './Toast';

type Colors = ReturnType<typeof useTheme>['colors'];

export default function ProfilePostModal({
    post,
    colors,
    onClose,
}: {
    post: Post | null;
    colors: Colors;
    onClose: () => void;
}) {
    const { collections, addPostToCollection } = usePosts();

    if (!post) return null;

    return (
        <ScrollView style={styles.modalPostScroll} contentContainerStyle={styles.modalPostContent}>
            <Image source={{ uri: post.uri }} style={styles.modalPostImage} resizeMode="cover" />
            <View style={[styles.modalPostCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.modalPostTitle, { color: colors.text }]}>{post.celebrityName || 'Без имени'}</Text>
                <Text style={[styles.modalPostMeta, { color: colors.textSecondary }]}>
                    {post.location || 'Место не указано'} • {post.dateReceived || 'Дата не указана'}
                </Text>
                <Text style={[styles.modalPostMeta, { color: colors.textSecondary }]}>
                    {getCategoryLabel(post.category)} • {getRarityLabel(post.rarity)}
                </Text>
                {post.caption ? (
                    <Text style={[styles.modalPostCaption, { color: colors.text }]}>{post.caption}</Text>
                ) : null}

                <View style={styles.fullStatsRow}>
                    <View style={[styles.fullStat, { backgroundColor: colors.surface }]}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                        <Text style={[styles.fullStatText, { color: colors.text }]}>
                            {post.realVotes} подтверждений
                        </Text>
                    </View>
                    <View style={[styles.fullStat, { backgroundColor: colors.surface }]}>
                        <Ionicons name="close-circle" size={16} color={colors.danger} />
                        <Text style={[styles.fullStatText, { color: colors.text }]}>
                            {post.fakeVotes} фейк-меток
                        </Text>
                    </View>
                </View>

                <Text style={[styles.modalPostMeta, { color: colors.textSecondary }]}>
                    Достоверность: {getAuthenticityPercent(post)}%
                </Text>

                <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                        style={[styles.modalActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => {
                            if (collections.length === 0) {
                                Alert.alert('Нет подборок', 'Сначала создайте подборку в профиле.');
                                return;
                            }
                            const options = collections.map((c) => ({
                                text: c.name,
                                onPress: () => {
                                    addPostToCollection(c.id, post.id);
                                    showToast('Добавлено в подборку', 'success');
                                },
                            }));
                            options.push({ text: 'Отмена', onPress: () => {} });
                            Alert.alert('Добавить в подборку', 'Выберите подборку:', options, { cancelable: true });
                        }}
                    >
                        <Ionicons name="albums-outline" size={18} color={colors.text} />
                        <Text style={[styles.modalActionText, { color: colors.text }]}>В подборку</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    modalPostScroll: { flex: 1 },
    modalPostContent: { padding: 16, gap: 14 },
    modalPostImage: { width: '100%', aspectRatio: 1, borderRadius: 22 },
    modalPostCard: { borderWidth: 1, borderRadius: 22, padding: 16, gap: 8 },
    modalPostTitle: { fontSize: 20, fontWeight: '700' },
    modalPostMeta: { fontSize: 13, lineHeight: 18 },
    modalPostCaption: { fontSize: 14, lineHeight: 20 },
    fullStatsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
    fullStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 8,
        flex: 1,
    },
    fullStatText: { fontSize: 12, fontWeight: '600', flex: 1 },
    modalActionsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
    modalActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 11,
        paddingHorizontal: 14,
        flex: 1,
    },
    modalActionText: { fontWeight: '600', fontSize: 13 },
});
// app/(tabs)/index.tsx
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePosts } from '../../context/PostsContext';
import { useTheme } from '../../context/ThemeContext';

export default function FeedScreen() {
    const { posts, toggleLike, addComment } = usePosts();
    const { colors } = useTheme();
    const [refreshing, setRefreshing] = React.useState(false);

    // Состояние для модального окна
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 500);
    }, []);

    // Открыть модалку
    const openComments = (postId: string) => {
        setSelectedPostId(postId);
        setModalVisible(true);
    };

    // Отправить комментарий
    const handleSendComment = () => {
        if (selectedPostId && commentText.trim()) {
            addComment(selectedPostId, commentText);
            setCommentText(''); // Очистить поле
            Keyboard.dismiss();
        }
    };

    // Найти текущий пост для отображения в модалке
    const activePost = posts.find(p => p.id === selectedPostId);

    const renderItem = React.useCallback(({ item }: { item: any }) => (
        <View style={[styles.post, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.postHeader}>
                <View style={[styles.avatar, { backgroundColor: colors.surface }]} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.username, { color: colors.text }]}>@autograph_user</Text>
                    <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                        {new Date(item.timestamp).toLocaleDateString('ru-RU')}
                    </Text>
                </View>
            </View>

            <Image source={{ uri: item.uri }} style={styles.postImage} resizeMode="cover" />

            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => toggleLike(item.id)}
                    style={styles.actionButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.actionIcon}>{item.liked ? '❤️' : '🤍'}</Text>
                    <Text style={[styles.actionText, { color: colors.text }]}>{item.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openComments(item.id)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={[styles.actionText, { color: colors.text }]}>{item.comments?.length || 0}</Text>
                </TouchableOpacity>
            </View>

            {item.caption ? (
                <View style={styles.captionContainer}>
                    <Text style={[styles.caption, { color: colors.text }]}>
                        <Text style={{ fontWeight: 'bold' }}>autograph_user </Text>
                        {item.caption}
                    </Text>
                </View>
            ) : null}
        </View>
    ), [colors, toggleLike]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            {posts.length === 0 ? (
                <View style={[styles.empty, { backgroundColor: colors.background }]}>
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>📭</Text>
                    <Text style={[styles.emptyText, { color: colors.text }]}>Лента пуста</Text>
                    <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                        Загрузи первый автограф на вкладке Upload
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
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
                    removeClippedSubviews={Platform.OS === 'android'}
                    windowSize={5}
                />
            )}

            {/* --- МОДАЛЬНОЕ ОКНО КОММЕНТАРИЕВ --- */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    {/* Шапка модалки */}
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Комментарии</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={{ fontSize: 24, color: colors.primary, fontWeight: 'bold' }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Список комментариев */}
                    <FlatList
                        data={activePost?.comments || []}
                        keyExtractor={item => item.id}
                        style={{ flex: 1 }}
                        contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
                        ListEmptyComponent={
                            <Text style={[styles.noComments, { color: colors.textSecondary }]}>
                                Пока нет комментариев. Будь первым!
                            </Text>
                        }
                        renderItem={({ item }) => (
                            <View style={{ marginBottom: 15 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <Text style={[styles.commentUser, { color: colors.text }]}>@{item.user}</Text>
                                    <Text style={[styles.commentTime, { color: colors.textSecondary }]}> • {item.timestamp}</Text>
                                </View>
                                <Text style={[styles.commentText, { color: colors.text }]}>{item.text}</Text>
                            </View>
                        )}
                    />

                    {/* Поле ввода комментария */}
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                            <TextInput
                                style={[styles.commentInput, { color: colors.text, borderColor: colors.border }]}
                                placeholder="Написать комментарий..."
                                placeholderTextColor={colors.placeholder}
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, { backgroundColor: commentText ? colors.primary : colors.surface }]}
                                onPress={handleSendComment}
                                disabled={!commentText.trim()}
                            >
                                <Text style={{ color: commentText ? '#fff' : colors.textSecondary, fontWeight: 'bold' }}>➤</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { paddingBottom: 10 },
    post: { marginBottom: 0, paddingBottom: 12 },
    postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    avatar: { width: 36, height: 36, borderRadius: 18 },
    username: { fontWeight: '600', fontSize: 14 },
    timestamp: { fontSize: 11, marginTop: 2 },
    postImage: { width: '100%', height: 400 },
    actions: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8 },
    actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 24, paddingVertical: 4 },
    actionIcon: { fontSize: 20, marginRight: 4 },
    actionText: { fontSize: 13 },
    captionContainer: { paddingHorizontal: 12, paddingTop: 4 },
    caption: { fontSize: 14, lineHeight: 20 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
    emptyHint: { fontSize: 14, textAlign: 'center', maxWidth: 250 },

    // Стили Модалки
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    noComments: { textAlign: 'center', marginTop: 50, fontSize: 16 },
    commentUser: { fontWeight: 'bold', fontSize: 14 },
    commentTime: { fontSize: 12, marginLeft: 5 },
    commentText: { fontSize: 15, lineHeight: 20 },

    inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, alignItems: 'center' },
    commentInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, minHeight: 40, maxHeight: 100 },
    sendButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});
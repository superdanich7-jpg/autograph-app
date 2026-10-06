import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Post } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';

type Colors = ReturnType<typeof useTheme>['colors'];

export default function CommentsModal({
    visible,
    post,
    commentText,
    onChangeText,
    onClose,
    onSend,
    colors,
}: {
    visible: boolean;
    post: Post | undefined;
    commentText: string;
    onChangeText: (text: string) => void;
    onClose: () => void;
    onSend: () => void;
    colors: Colors;
}) {
    return (
        <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
            <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Комментарии</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={post?.comments || []}
                    keyExtractor={(item) => item.id}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 16, paddingBottom: 88 }}
                    ListEmptyComponent={
                        <Text style={[styles.noComments, { color: colors.textSecondary }]}>
                            Комментариев пока нет. Можно оставить первый.
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <View style={[styles.commentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.commentRow}>
                                <Text style={[styles.commentUser, { color: colors.text }]}>@{item.user}</Text>
                                <Text style={[styles.commentTime, { color: colors.textSecondary }]}>{item.timestamp}</Text>
                            </View>
                            <Text style={[styles.commentText, { color: colors.text }]}>{item.text}</Text>
                        </View>
                    )}
                />

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                        <TextInput
                            style={[
                                styles.commentInput,
                                {
                                    color: colors.text,
                                    borderColor: colors.border,
                                    backgroundColor: colors.card,
                                },
                            ]}
                            placeholder="Написать комментарий..."
                            placeholderTextColor={colors.placeholder}
                            value={commentText}
                            onChangeText={onChangeText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, { backgroundColor: commentText.trim() ? colors.primary : colors.surface }]}
                            onPress={onSend}
                            disabled={!commentText.trim()}
                        >
                            <Ionicons
                                name="arrow-up"
                                size={18}
                                color={commentText.trim() ? colors.primaryText : colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
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
    closeButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noComments: {
        textAlign: 'center',
        marginTop: 56,
        fontSize: 15,
    },
    commentCard: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 12,
    },
    commentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    commentUser: { fontWeight: '700', fontSize: 14 },
    commentTime: { fontSize: 12 },
    commentText: { fontSize: 15, lineHeight: 21 },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 12,
        borderTopWidth: 1,
        alignItems: 'flex-end',
        gap: 10,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 18,
        paddingHorizontal: 15,
        paddingVertical: 10,
        minHeight: 46,
        maxHeight: 110,
        fontSize: 15,
    },
    sendButton: {
        width: 46,
        height: 46,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
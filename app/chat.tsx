/**
 * ChatScreen — личные сообщения (DM). CEO-запрос (Фаза 3).
 * Тренды соцсетей 2026: список диалогов + пузыри сообщений + presence +
 * группировка по дням + поле ввода. Дизайн-система Ink&Gold.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePosts } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import { hapticLight } from '../lib/haptics';
import { buildConversations, formatMessageTime, groupByDay } from '../lib/chat';
import { formatPresence } from '../lib/friends';
import { radii, spacing, typography } from '../lib/theme';

type Colors = ReturnType<typeof useTheme>['colors'];

export default function ChatScreen() {
    const { colors } = useTheme();
    const {
        messages,
        friends,
        currentUserId,
        canInteract,
        getFriendById,
        sendMessage,
        markChatRead,
        getThreadWith,
    } = usePosts();

    const [activePeerId, setActivePeerId] = useState<string | null>(null);
    const [draft, setDraft] = useState('');

    const peers = useMemo(
        () => friends.map((f) => ({ id: f.id, name: f.name, avatar: f.avatar })),
        [friends]
    );
    const conversations = useMemo(
        () => buildConversations(messages, currentUserId, peers),
        [messages, currentUserId, peers]
    );

    const openThread = (peerId: string) => {
        hapticLight();
        setActivePeerId(peerId);
        markChatRead(peerId);
    };

    // ─── Экран переписки ──────────────────────────
    if (activePeerId) {
        const peer = getFriendById(activePeerId);
        const thread = getThreadWith(activePeerId);
        const groups = groupByDay(thread);

        const handleSend = () => {
            const text = draft.trim();
            if (!text) return;
            sendMessage(activePeerId, text);
            setDraft('');
        };

        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <View style={[styles.threadHeader, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => setActivePeerId(null)} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Назад к диалогам">
                            <Ionicons name="chevron-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <View style={[styles.threadAvatar, { backgroundColor: colors.surface }]}>
                            <Text style={styles.threadAvatarEmoji}>{peer?.avatar || '👤'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[typography.bodyMedium, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
                                {peer?.name || 'Собеседник'}
                            </Text>
                            <Text style={[typography.caption, { color: peer?.online ? colors.success : colors.textSecondary }]} numberOfLines={1}>
                                {peer ? formatPresence(peer) : ''}
                            </Text>
                        </View>
                    </View>

                    <FlatList
                        data={groups}
                        keyExtractor={(g) => g.key}
                        contentContainerStyle={styles.threadList}
                        ListHeaderComponent={
                            thread.some((m) => m.isDemo) ? (
                                <View style={[styles.demoNote, { backgroundColor: colors.accentLight }]}>
                                    <Text style={[typography.labelSmall, { color: colors.accent }]}>
                                        Демо-переписка — предзаполнена для примера
                                    </Text>
                                </View>
                            ) : null
                        }
                        renderItem={({ item: group }) => (
                            <View>
                                <View style={styles.daySep}>
                                    <Text style={[typography.caption, { color: colors.textTertiary }]}>{group.label}</Text>
                                </View>
                                {group.messages.map((m) => {
                                    const mine = m.fromId === currentUserId;
                                    return (
                                        <View
                                            key={m.id}
                                            style={[
                                                styles.bubble,
                                                mine
                                                    ? [styles.bubbleMine, { backgroundColor: colors.primary }]
                                                    : [styles.bubbleTheirs, { backgroundColor: colors.card, borderColor: colors.border }],
                                            ]}
                                        >
                                            <Text style={[typography.body, { color: mine ? colors.primaryText : colors.text }]}>{m.text}</Text>
                                            <Text style={[styles.bubbleTime, { color: mine ? colors.primaryText : colors.textTertiary }]}>
                                                {formatMessageTime(m.timestamp)}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    />

                    <View style={[styles.inputBar, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                            placeholder="Сообщение..."
                            placeholderTextColor={colors.placeholder}
                            value={draft}
                            onChangeText={setDraft}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!canInteract || !draft.trim()}
                            style={[styles.sendBtn, { backgroundColor: canInteract && draft.trim() ? colors.accent : colors.surface }]}
                            accessibilityRole="button"
                            accessibilityLabel="Отправить"
                        >
                            <Ionicons name="send" size={20} color={canInteract && draft.trim() ? colors.accentText : colors.textTertiary} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // ─── Список диалогов ──────────────────────────
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Сообщения</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Переписка с другими коллекционерами</Text>
            </View>

            <FlatList
                data={conversations}
                keyExtractor={(c) => c.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.convRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => openThread(item.peerId)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={`Открыть чат с ${item.peerName}`}
                    >
                        <View style={styles.convAvatarWrap}>
                            <View style={[styles.convAvatar, { backgroundColor: colors.surface }]}>
                                <Text style={styles.convAvatarEmoji}>{item.peerAvatar}</Text>
                            </View>
                            <View style={[styles.presenceDot, { backgroundColor: getFriendById(item.peerId)?.online ? colors.success : colors.textTertiary, borderColor: colors.card }]} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[typography.bodyMedium, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
                                {item.peerName}
                            </Text>
                            <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                                {item.lastMessage?.text}
                            </Text>
                        </View>
                        <View style={styles.convMeta}>
                            <Text style={[typography.labelSmall, { color: colors.textTertiary }]}>
                                {item.lastMessage ? formatMessageTime(item.lastMessage.timestamp) : ''}
                            </Text>
                            {item.unreadCount > 0 ? (
                                <View style={[styles.unreadBadge, { backgroundColor: colors.danger }]}>
                                    <Text style={[typography.labelSmall, { color: colors.primaryText }]}>{item.unreadCount}</Text>
                                </View>
                            ) : null}
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="chatbubbles-outline" size={44} color={colors.textTertiary} />
                        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                            Пока нет сообщений.{'\n'}Начните общение из раздела «Друзья».
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    title: { fontSize: 28, fontWeight: '800' },
    subtitle: { marginTop: 4, fontSize: 14 },
    list: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        paddingBottom: spacing.xl,
    },
    convRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderWidth: 1,
        borderRadius: radii.lg,
        padding: spacing.md,
    },
    convAvatarWrap: { position: 'relative' },
    convAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    convAvatarEmoji: { fontSize: 26 },
    presenceDot: {
        position: 'absolute',
        right: -1,
        bottom: -1,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
    },
    convMeta: { alignItems: 'flex-end', gap: 6 },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        paddingHorizontal: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    empty: {
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.xxxl,
        paddingHorizontal: spacing.xl,
    },
    threadHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    },
    backBtn: { padding: spacing.xs },
    threadAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    threadAvatarEmoji: { fontSize: 22 },
    demoNote: {
        alignSelf: 'center' as const,
        borderRadius: radii.full,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        marginBottom: spacing.md,
    },
    threadList: {
        padding: spacing.lg,
        gap: spacing.sm,
    },
    daySep: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    bubble: {
        maxWidth: '80%',
        borderRadius: radii.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginBottom: spacing.sm,
        gap: 2,
    },
    bubbleMine: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: radii.sm,
    },
    bubbleTheirs: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderBottomLeftRadius: radii.sm,
    },
    bubbleTime: {
        fontSize: 10,
        alignSelf: 'flex-end',
        opacity: 0.8,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 120,
        borderWidth: 1,
        borderRadius: radii.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: 15,
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

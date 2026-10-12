/**
 * CommunitiesList — приватные сообщества коллекционеров (CEO-идея #5).
 *
 * Список сообществ с членством + создание нового (публичное/приватное).
 * Offline-first: состояние живёт в PostsContext (communities). Частный
 * чат внутри сообщества — отдельная задача Фазы 3 (нужен realtime Supabase).
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePosts } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import { Community, CommunityCategory, getMembership, sortCommunitiesForUser, validateCommunityInput } from '../lib/communities';
import { hapticLight } from '../lib/haptics';
import Button from './ui/Button';

type Colors = ReturnType<typeof useTheme>['colors'];

const CATEGORIES: { value: CommunityCategory; label: string; emoji: string }[] = [
    { value: 'sports', label: 'Спорт', emoji: '🏅' },
    { value: 'music', label: 'Музыка', emoji: '🎵' },
    { value: 'movies', label: 'Кино', emoji: '🎬' },
    { value: 'politics', label: 'Политика', emoji: '🏛️' },
    { value: 'other', label: 'Другое', emoji: '✨' },
];

export default function CommunitiesList({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const { communities, currentUserId, createCommunity, requestJoinCommunity, approveCommunityJoin, leaveCommunity } = usePosts();
    const { colors } = useTheme();

    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<CommunityCategory>('sports');
    const [isPrivate, setIsPrivate] = useState(false);

    const sorted = sortCommunitiesForUser(communities, currentUserId);

    const reset = () => {
        setName('');
        setDescription('');
        setCategory('sports');
        setIsPrivate(false);
    };

    const handleCreate = () => {
        const validation = validateCommunityInput({ name });
        if (!validation.valid) {
            Alert.alert('Не получилось', validation.error || 'Проверьте название');
            return;
        }
        const emoji = CATEGORIES.find((c) => c.value === category)?.emoji ?? '🏆';
        createCommunity({ name: name.trim(), description: description.trim(), category, isPrivate, emoji });
        setShowCreate(false);
        reset();
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Сообщества</Text>
                    <View style={styles.headerActions}>
                        <Button title="Создать" onPress={() => setShowCreate(true)} variant="primary" size="sm" icon="add-outline" />
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={[styles.hint, { color: colors.textSecondary }]}>
                        Присоединяйтесь к клубам по интересам или создайте своё приватное сообщество.
                    </Text>

                    {sorted.length === 0 ? (
                        <View style={styles.empty}>
                            <Ionicons name="people-outline" size={36} color={colors.primary} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>Пока нет сообществ</Text>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                Создайте первое — публичное или приватное по приглашениям.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.list}>
                            {sorted.map((community) => (
                                <CommunityRow
                                    key={community.id}
                                    community={community}
                                    colors={colors}
                                    currentUserId={currentUserId}
                                    onJoin={() => requestJoinCommunity(community.id)}
                                    onLeave={() => leaveCommunity(community.id)}
                                    onApprove={(userId) => approveCommunityJoin(community.id, userId)}
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>

                {showCreate && (
                    <Modal visible={showCreate} animationType="slide" transparent onRequestClose={() => setShowCreate(false)}>
                        <View style={[styles.createOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                            <View style={[styles.createCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={[styles.createTitle, { color: colors.text }]}>Новое сообщество</Text>

                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                                    placeholder="Название (от 3 символов)"
                                    placeholderTextColor={colors.placeholder}
                                    value={name}
                                    onChangeText={setName}
                                />
                                <TextInput
                                    style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                                    placeholder="Описание"
                                    placeholderTextColor={colors.placeholder}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                />

                                <View style={styles.catRow}>
                                    {CATEGORIES.map((c) => (
                                        <TouchableOpacity
                                            key={c.value}
                                            onPress={() => { hapticLight(); setCategory(c.value); }}
                                            style={[
                                                styles.catChip,
                                                {
                                                    backgroundColor: category === c.value ? colors.primary : colors.surface,
                                                    borderColor: colors.border,
                                                },
                                            ]}
                                        >
                                            <Text style={[styles.catChipText, { color: category === c.value ? colors.primaryText : colors.text }]}>
                                                {c.emoji} {c.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.privateRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.privateTitle, { color: colors.text }]}>Приватное</Text>
                                        <Text style={[styles.privateHint, { color: colors.textSecondary }]}>
                                            Вступление только по одобрению владельца
                                        </Text>
                                    </View>
                                    <Switch
                                        value={isPrivate}
                                        onValueChange={setIsPrivate}
                                        trackColor={{ false: colors.border, true: colors.primary }}
                                        thumbColor="#ffffff"
                                    />
                                </View>

                                <View style={styles.createActions}>
                                    <Button title="Отмена" onPress={() => { setShowCreate(false); reset(); }} variant="secondary" size="sm" />
                                    <Button title="Создать" onPress={handleCreate} variant="primary" size="sm" />
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}
            </SafeAreaView>
        </Modal>
    );
}


function CommunityRow({
    community,
    colors,
    currentUserId,
    onJoin,
    onLeave,
    onApprove,
}: {
    community: Community;
    colors: Colors;
    currentUserId: string;
    onJoin: () => void;
    onLeave: () => void;
    onApprove: (userId: string) => void;
}) {
    const m = getMembership(community, currentUserId);
    const pendingCount = community.pendingIds.length;

    return (
        <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.itemEmoji}>{community.emoji}</Text>
            <View style={{ flex: 1 }}>
                <View style={styles.itemTitleRow}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>{community.name}</Text>
                    {community.isPrivate && <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />}
                </View>
                <Text style={[styles.itemMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                    {community.memberIds.length} участник(ов)
                    {m.isOwner ? ' · владелец' : ''}
                    {m.isPending ? ' · заявка на рассмотрении' : ''}
                </Text>
                {community.description ? (
                    <Text style={[styles.itemDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                        {community.description}
                    </Text>
                ) : null}

                {m.isOwner && pendingCount > 0 && (
                    <View style={styles.pendingBox}>
                        <Text style={[styles.pendingTitle, { color: colors.textSecondary }]}>
                            Заявки: {pendingCount}
                        </Text>
                        {community.pendingIds.map((pid) => (
                            <View key={pid} style={styles.pendingRow}>
                                <Text style={[styles.pendingUser, { color: colors.text }]} numberOfLines={1}>
                                    {pid}
                                </Text>
                                <TouchableOpacity onPress={() => onApprove(pid)} style={styles.approveBtn}>
                                    <Text style={[styles.approveText, { color: colors.primary }]}>Одобрить</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {!m.isMember && !m.isOwner && !m.isPending && (
                <TouchableOpacity onPress={onJoin} style={[styles.joinBtn, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.joinText, { color: colors.primaryText }]}>
                        {community.isPrivate ? 'Запросить' : 'Вступить'}
                    </Text>
                </TouchableOpacity>
            )}
            {m.isMember && !m.isOwner && (
                <TouchableOpacity onPress={onLeave} style={styles.joinBtn}>
                    <Text style={[styles.joinText, { color: colors.textSecondary }]}>Выйти</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    title: { fontSize: 22, fontWeight: '800' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    content: { paddingHorizontal: 16, paddingBottom: 24, gap: 14 },
    hint: { fontSize: 13, lineHeight: 19 },
    list: { gap: 12 },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
    },
    itemEmoji: { fontSize: 28 },
    itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    itemTitle: { fontSize: 16, fontWeight: '700' },
    itemMeta: { fontSize: 12, marginTop: 2 },
    itemDesc: { fontSize: 12, marginTop: 4, lineHeight: 17 },
    joinBtn: {
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    joinText: { fontSize: 13, fontWeight: '700' },
    pendingBox: { marginTop: 8, gap: 6 },
    pendingTitle: { fontSize: 12, fontWeight: '700' },
    pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    pendingUser: { flex: 1, fontSize: 12 },
    approveBtn: { paddingHorizontal: 8, paddingVertical: 4 },
    approveText: { fontSize: 12, fontWeight: '700' },
    empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
    emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
    createOverlay: { flex: 1, justifyContent: 'flex-end' },
    createCard: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        padding: 20,
        gap: 14,
    },
    createTitle: { fontSize: 19, fontWeight: '800' },
    input: {
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    textArea: { minHeight: 70, textAlignVertical: 'top' },
    catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catChip: {
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    catChipText: { fontSize: 13, fontWeight: '600' },
    privateRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    privateTitle: { fontSize: 15, fontWeight: '700' },
    privateHint: { fontSize: 12, marginTop: 2 },
    createActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
});

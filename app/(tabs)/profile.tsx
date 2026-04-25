import React from 'react';
import {
    Alert,
    Image, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { usePosts } from '../../context/PostsContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
    const { posts } = usePosts();
    const { colors, toggleTheme, theme } = useTheme();

    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Шапка */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => Alert.alert('🖼 Аватар', 'Смена фото скоро')}>
                    <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                        <Text style={{ fontSize: 40 }}>👤</Text>
                    </View>
                </TouchableOpacity>
                <Text style={[styles.name, { color: colors.text }]}>User Autograph</Text>
                <Text style={[styles.bio, { color: colors.textSecondary }]}>Коллекционер автографов 📸</Text>
            </View>

            {/* Статистика */}
            <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.text }]}>{totalPosts}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Постов</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.text }]}>{totalLikes}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Лайков</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Подписчиков</Text>
                </View>
            </View>

            {/* Кнопки */}
            <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={() => Alert.alert('✏️ Редактировать', 'Скоро')}>
                    <Text style={[styles.actionText, { color: colors.text }]}>✏️ Редактировать профиль</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={() => Alert.alert('⚙️ Настройки', 'Скоро')}>
                    <Text style={[styles.actionText, { color: colors.text }]}>⚙️ Настройки</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={toggleTheme}>
                    <Text style={[styles.actionText, { color: colors.text }]}>
                        {theme === 'light' ? '🌙 Тёмная тема' : '☀️ Светлая тема'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Коллекция */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>📚 Моя коллекция</Text>

                {posts.length === 0 ? (
                    <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                        <Text style={{ fontSize: 40 }}>📭</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Пока нет загруженных автографов</Text>
                        <Text style={[styles.emptyHint, { color: colors.placeholder }]}>Загрузи первый пост на вкладке Upload</Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {posts.slice(0, 6).map((post) => (
                            <TouchableOpacity key={post.id} style={[styles.gridItem, { backgroundColor: colors.surface }]} onPress={() => Alert.alert('🔍 Просмотр', post.caption || 'Без подписи')}>
                                <Image source={{ uri: post.uri }} style={styles.gridImage} resizeMode="cover" />
                                {post.likes > 0 && (
                                    <View style={styles.likeBadge}>
                                        <Text style={styles.likeBadgeText}>❤️ {post.likes}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { alignItems: 'center', padding: 30, borderBottomWidth: 1 },
    avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    name: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
    bio: { fontSize: 14 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, marginVertical: 10 },
    statItem: { alignItems: 'center' },
    statNumber: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 12, marginTop: 4 },
    statDivider: { width: 1, height: 40 },
    actions: { paddingHorizontal: 20, marginBottom: 20 },
    actionBtn: { padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
    actionText: { fontWeight: '600', fontSize: 15 },
    section: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    emptyState: { alignItems: 'center', padding: 30, borderRadius: 12 },
    emptyText: { fontSize: 15, marginBottom: 5 },
    emptyHint: { fontSize: 13, textAlign: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '32%', aspectRatio: 1, borderRadius: 10, overflow: 'hidden', marginBottom: 10, position: 'relative' },
    gridImage: { width: '100%', height: '100%' },
    likeBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    likeBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
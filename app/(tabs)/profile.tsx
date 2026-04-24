// app/(tabs)/profile.tsx
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

export default function ProfileScreen() {
    const { posts } = usePosts();

    // Считаем статистику
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);

    // Кнопки профиля
    const handleEdit = () => Alert.alert('✏️ Редактировать', 'Функция будет доступна после подключения бэкенда');
    const handleSettings = () => Alert.alert('⚙️ Настройки', 'Здесь будут настройки уведомлений, приватности и т.д.');
    const handleLogout = () => Alert.alert('👋 Выход', 'В демо-режиме выход отключён');

    // Посты для коллекции (берём последние 6)
    const myPosts = posts.slice(0, 6);

    return (
        <ScrollView style={styles.container}>
            {/* Шапка профиля */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => Alert.alert('🖼 Смена аватара', 'Функция будет после подключения бэкенда')}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>👤</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.name}>User Autograph</Text>
                <Text style={styles.bio}>Коллекционер автографов 📸</Text>
            </View>

            {/* Статистика */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{totalPosts}</Text>
                    <Text style={styles.statLabel}>Постов</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{totalLikes}</Text>
                    <Text style={styles.statLabel}>Лайков</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>12</Text>
                    <Text style={styles.statLabel}>Подписчиков</Text>
                </View>
            </View>

            {/* Кнопки действий */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleEdit}>
                    <Text style={styles.actionText}>✏️ Редактировать профиль</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={handleSettings}>
                    <Text style={[styles.actionText, styles.secondaryText]}>⚙️ Настройки</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={handleLogout}>
                    <Text style={[styles.actionText, styles.dangerText]}>🚪 Выйти</Text>
                </TouchableOpacity>
            </View>

            {/* Секция "Моя коллекция" */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📚 Моя коллекция</Text>

                {myPosts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyText}>Пока нет загруженных автографов</Text>
                        <Text style={styles.emptyHint}>Загрузи первый пост на вкладке Upload</Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {myPosts.map((post) => (
                            <TouchableOpacity
                                key={post.id}
                                style={styles.gridItem}
                                onPress={() => Alert.alert('🔍 Просмотр', post.caption || 'Без подписи')}
                            >
                                <Image
                                    source={{ uri: post.uri }}
                                    style={styles.gridImage}
                                    resizeMode="cover"
                                />
                                {/* Индикатор лайков на миниатюре */}
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
    container: { flex: 1, backgroundColor: '#fff' },

    // Шапка
    header: { alignItems: 'center', padding: 30, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#e1e1e1', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    avatarText: { fontSize: 40 },
    name: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
    bio: { color: '#666', fontSize: 14 },

    // Статистика
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: '#fafafa', marginVertical: 10 },
    statItem: { alignItems: 'center' },
    statNumber: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { color: '#888', fontSize: 12, marginTop: 4 },
    statDivider: { width: 1, backgroundColor: '#ddd', height: 40 },

    // Кнопки
    actions: { paddingHorizontal: 20, marginBottom: 20 },
    actionBtn: { padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
    actionText: { fontWeight: '600', fontSize: 15 },
    secondaryBtn: { backgroundColor: '#f0f0f0' },
    secondaryText: { color: '#333' },
    dangerBtn: { backgroundColor: '#ffebee' },
    dangerText: { color: '#c62828' },

    // Секция коллекции
    section: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

    // Пустое состояние
    emptyState: { alignItems: 'center', padding: 30, backgroundColor: '#f9f9f9', borderRadius: 12 },
    emptyIcon: { fontSize: 40, marginBottom: 10 },
    emptyText: { color: '#666', fontSize: 15, marginBottom: 5 },
    emptyHint: { color: '#999', fontSize: 13, textAlign: 'center' },

    // Сетка постов
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '32%', aspectRatio: 1, borderRadius: 10, overflow: 'hidden', marginBottom: 10, backgroundColor: '#eee', position: 'relative' },
    gridImage: { width: '100%', height: '100%' },

    // Бейдж лайков
    likeBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    likeBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
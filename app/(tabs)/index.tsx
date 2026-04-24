// app/(tabs)/index.tsx
import React from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { usePosts } from '../../context/PostsContext';

export default function FeedScreen() {
    const { posts, toggleLike } = usePosts();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 500);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.post}>
            {/* Шапка поста */}
            <View style={styles.postHeader}>
                <View style={styles.avatar} />
                <Text style={styles.username}>@user</Text>
                <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleDateString('ru-RU')}
                </Text>
            </View>

            {/* Фото */}
            <Image source={{ uri: item.uri }} style={styles.postImage} resizeMode="cover" />

            {/* Действия */}
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.actionButton}>
                    <Text style={styles.actionIcon}>{item.liked ? '❤️' : '🤍'}</Text>
                    <Text style={styles.actionText}>{item.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionText}>0</Text>
                </TouchableOpacity>
            </View>

            {/* Подпись */}
            {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
        </View>
    );

    return (
        <View style={styles.container}>
            {posts.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>📭 Пока нет постов</Text>
                    <Text style={styles.emptyHint}>Загрузи первый автограф на вкладке Upload</Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    list: { paddingVertical: 10 },
    post: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 15 },
    postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd', marginRight: 10 },
    username: { fontWeight: '600', fontSize: 15, flex: 1 },
    timestamp: { color: '#999', fontSize: 12 },
    postImage: { width: '100%', height: 400, backgroundColor: '#f5f5f5' },
    actions: { flexDirection: 'row', padding: 12 },
    actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    actionIcon: { fontSize: 20, marginRight: 5 },
    actionText: { fontSize: 14, color: '#333' },
    caption: { paddingHorizontal: 12, fontSize: 15, lineHeight: 20 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
    emptyHint: { color: '#999', textAlign: 'center' },
});
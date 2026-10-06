import React, { useState } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { usePosts } from '../context/PostsContext';
import { shareCollection } from '../lib/sharing';
import Button from './ui/Button';
import CreateCollectionModal from './CreateCollectionModal';

type CollectionItemProps = {
  collection: {
    id: string;
    name: string;
    description?: string;
    color: string;
    postIds: string[];
  };
  posts: ReturnType<typeof usePosts>['posts'];
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
  onShare: () => void;
  onDelete: () => void;
};

function CollectionItem({ collection, posts, onPress, colors, onShare, onDelete }: CollectionItemProps) {
  return (
    <TouchableOpacity style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
      <View style={[styles.icon, { backgroundColor: collection.color + '22' }]}>
        <Ionicons name="albums-outline" size={22} color={collection.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{collection.name}</Text>
        <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
          {collection.postIds.length} автограф{getCountSuffix(collection.postIds.length)}
        </Text>
      </View>
      <TouchableOpacity onPress={onShare} style={styles.actionBtn}>
        <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
        <Ionicons name="trash-outline" size={20} color={colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function getCountSuffix(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) return '';
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'а';
  return 'ов';
}

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function CollectionsList({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const { collections, posts, createCollection, deleteCollection, updateCollection, addPostToCollection, removePostFromCollection } =
    usePosts();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const handleCreate = (data: { name: string; description: string; color: string }) => {
    createCollection(data);
  };

  const handleShare = async (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return;
    await shareCollection({ count: collection.postIds.length, url: undefined });
  };

  const handleDelete = (collectionId: string) => {
    Alert.alert('Удалить подборку?', 'Автографы не будут удалены из коллекции.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => deleteCollection(collectionId) },
    ]);
  };

  const handleAddPost = (collectionId: string) => {
    if (posts.length === 0) {
      Alert.alert('Нет автографов', 'Сначала добавьте автографы в коллекцию.');
      return;
    }

    const options = posts.map((p) => ({
      text: p.celebrityName || 'Без имени',
      value: p.id,
    }));

    Alert.alert('Добавить автограф в подборку', 'Выберите автограф:', options.map((o) => ({
      text: o.text,
      onPress: () => addPostToCollection(collectionId, o.value),
    })), { cancelable: true });
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="albums-outline" size={36} color={colors.primary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Пока пусто</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Создайте первую подборку, чтобы начать группировать автографы.
      </Text>
    </View>
  );

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailCollectionId, setDetailCollectionId] = useState<string | null>(null);

  const openDetail = (collectionId: string) => {
    setDetailCollectionId(collectionId);
    setSelectedCollectionId(null);
    setDetailVisible(true);
  };

  const detailCollection = detailCollectionId ? collections.find((c) => c.id === detailCollectionId) : null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Мои подборки</Text>
          <View style={styles.headerActions}>
            <Button title="Создать" onPress={() => setShowCreate(true)} variant="primary" size="sm" icon="add-outline" />
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Группируйте автографы по темам. Например: «Спорт», «Легендарные», «На память».
          </Text>

          {collections.length === 0 ? (
            renderEmpty()
          ) : (
            <View style={styles.list}>
              {collections.map((collection) => (
                <CollectionItem
                  key={collection.id}
                  collection={collection}
                  posts={posts}
                  colors={colors}
                  onPress={() => openDetail(collection.id)}
                  onShare={() => handleShare(collection.id)}
                  onDelete={() => handleDelete(collection.id)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <CreateCollectionModal visible={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />

      <Modal visible={detailVisible && Boolean(detailCollection)} animationType="slide" onRequestClose={() => setDetailVisible(false)}>
        <SafeAreaView style={[styles.modalArea, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {detailCollection?.name} <Text style={styles.modalMeta}>{detailCollection?.postIds.length}</Text>
            </Text>
            <TouchableOpacity onPress={() => setDetailVisible(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={[styles.modalHint, { color: colors.textSecondary }]}>{detailCollection?.description}</Text>
            {detailCollection && detailCollection.postIds.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="images-outline" size={28} color={colors.primary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>В подборке пока нет автографов</Text>
                <Button
                  title="Добавить автограф"
                  onPress={() => handleAddPost(detailCollection.id)}
                  variant="primary"
                  size="sm"
                  icon="add-outline"
                />
              </View>
            ) : (
              <View style={styles.grid}>
                {detailCollection?.postIds
                  .map((id) => posts.find((p) => p.id === id))
                  .filter(Boolean)
                  .map((post) => (
                    <View key={post!.id} style={[styles.gridImageWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Image source={{ uri: post!.uri }} style={styles.gridImage} resizeMode="cover" />
                      <View style={[styles.gridOverlay, { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
                        <TouchableOpacity
                          style={[styles.gridAction, { backgroundColor: colors.danger }]}
                          onPress={() => {
                            Alert.alert('Удалить из подборки?', post!.celebrityName || 'Автограф', [
                              { text: 'Отмена', style: 'cancel' },
                              {
                                text: 'Удалить',
                                style: 'destructive',
                                onPress: () => removePostFromCollection(detailCollection!.id, post!.id),
                              },
                            ]);
                          }}
                        >
                          <Ionicons name="trash" size={18} color="#fff" />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.gridCaption, { color: colors.text }]} numberOfLines={1}>
                        {post!.celebrityName || 'Без имени'}
                      </Text>
                    </View>
                  ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 22, fontWeight: '700' },
  content: { gap: 12 },
  hint: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  list: { gap: 12 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  itemCount: { fontSize: 12, marginTop: 2 },
  actionBtn: { padding: 6 },
  modalArea: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  modalMeta: { fontSize: 14, fontWeight: '400' },
  modalHint: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  modalContent: { padding: 16, gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridImageWrap: {
    width: '47%',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridImage: { width: '100%', aspectRatio: 1 },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 10,
  },
  gridAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCaption: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

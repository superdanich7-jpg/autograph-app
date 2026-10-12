/**
 * RecommendedRail — горизонтальная карусель «Вам может понравиться».
 *
 * CEO-идея #6 (Фаза 2): персональные рекомендации в ленте (паттерн
 * Instagram/TikTok «Suggested»). Показывает чип причины — прозрачность
 * рекомендации повышает клики. Тап → открывает детали поста.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Post } from '../context/PostsContext';
import type { Recommendation } from '../lib/recommendations';
import { getRarityLabel } from '../lib/helpers';

type Colors = {
  background: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryText: string;
  surface: string;
};

export default function RecommendedRail({
  recommendations,
  colors,
  onOpenDetail,
}: {
  recommendations: Recommendation[];
  colors: Colors;
  onOpenDetail: (post: Post) => void;
}) {
  if (recommendations.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={16} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Вам может понравиться</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {recommendations.map((rec) => (
          <TouchableOpacity
            key={rec.post.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => onOpenDetail(rec.post)}
            activeOpacity={0.88}
          >
            <Image source={{ uri: rec.post.uri }} style={styles.thumb} resizeMode="cover" />
            <View style={styles.body}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {rec.post.celebrityName}
              </Text>
              <View style={[styles.reasonChip, { backgroundColor: colors.surface }]}>
                <Text style={[styles.reasonText, { color: colors.primary }]} numberOfLines={1}>
                  {rec.reason}
                </Text>
              </View>
              <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
                {getRarityLabel(rec.post.rarity)} · {rec.score}% match
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 6,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  rail: {
    gap: 10,
    paddingRight: 4,
  },
  card: {
    width: 150,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: 110,
  },
  body: {
    padding: 10,
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  reasonChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reasonText: {
    fontSize: 10,
    fontWeight: '700',
  },
  meta: {
    fontSize: 11,
  },
});

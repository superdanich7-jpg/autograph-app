/**
 * CollectionValueCard — вирусная карточка «Моя коллекция стоит ~$X».
 *
 * CEO-идея #8 (Фаза 2). Рисерч: Relic Roster / PSA показывают оценку —
 * мощный социальный триггер для шейринга и возврата. Показываем
 * ориентировочную стоимость + долю подтверждённых, с оговоркой, что это
 * эвристика (не рыночная цена).
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Post } from '../context/PostsContext';
import { estimateCollectionValue, formatUsd } from '../lib/valuation';

type Colors = {
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryText: string;
  success: string;
  surface: string;
};

export default function CollectionValueCard({
  posts,
  colors,
}: {
  posts: Post[];
  colors: Colors;
}) {
  if (posts.length === 0) return null;

  const v = estimateCollectionValue(posts);
  const verifiedPct = Math.round(v.verifiedRatio * 100);

  return (
    <View style={[styles.wrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <Ionicons name="trending-up" size={18} color={colors.primary} />
        <Text style={[styles.header, { color: colors.text }]}>Оценка коллекции</Text>
        <View style={[styles.chip, { backgroundColor: colors.surface }]}>
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>ориентировочно</Text>
        </View>
      </View>

      <Text style={[styles.amount, { color: colors.primary }]}>{formatUsd(v.total)}</Text>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {v.count} автограф(ов) · в среднем {formatUsd(v.average)}
        </Text>
      </View>

      <View style={styles.verifiedRow}>
        <View style={[styles.verifiedTrack, { backgroundColor: colors.surface }]}>
          <View
            style={[styles.verifiedFill, { width: `${verifiedPct}%`, backgroundColor: colors.success }]}
          />
        </View>
        <Text style={[styles.verifiedText, { color: colors.textSecondary }]}>
          {verifiedPct}% подтверждено сообществом
        </Text>
      </View>

      <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
        Эвристическая оценка по редкости, категории и подтверждённости — не рыночная цена.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  header: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  amount: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
  },
  meta: {
    fontSize: 13,
  },
  verifiedRow: {
    gap: 6,
    marginTop: 2,
  },
  verifiedTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  verifiedFill: {
    height: 8,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 12,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
});

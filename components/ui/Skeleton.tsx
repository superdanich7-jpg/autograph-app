/**
 * Skeleton — компонент для отображения загрузки.
 * Создаёт анимированную заглушку вместо пустого экрана.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../lib/theme';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = '100%', height = 20, borderRadius = radii.sm, style }: Props) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surface,
          opacity,
        },
        style,
      ]}
    />
  );
}

// ─── Pre-built Skeletons ───────────────────────

export function PostCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[postSkeletonStyles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={postSkeletonStyles.header}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={postSkeletonStyles.headerText}>
          <Skeleton width={120} height={14} />
          <Skeleton width={80} height={10} style={{ marginTop: 6 }} />
        </View>
      </View>

      {/* Image */}
      <Skeleton width="100%" height={200} borderRadius={radii.lg} />

      {/* Actions */}
      <View style={postSkeletonStyles.actions}>
        <Skeleton width={60} height={32} borderRadius={radii.full} />
        <Skeleton width={60} height={32} borderRadius={radii.full} />
        <Skeleton width={60} height={32} borderRadius={radii.full} />
      </View>
    </View>
  );
}

export function ProfileSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={profileSkeletonStyles.container}>
      {/* Avatar */}
      <Skeleton width={80} height={80} borderRadius={24} />
      <Skeleton width={120} height={18} style={{ marginTop: 12 }} />
      <Skeleton width={180} height={12} style={{ marginTop: 8 }} />

      {/* Stats */}
      <View style={profileSkeletonStyles.stats}>
        <Skeleton width={80} height={60} borderRadius={radii.lg} />
        <Skeleton width={80} height={60} borderRadius={radii.lg} />
        <Skeleton width={80} height={60} borderRadius={radii.lg} />
      </View>
    </View>
  );
}

const postSkeletonStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radii.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
});

const profileSkeletonStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
});
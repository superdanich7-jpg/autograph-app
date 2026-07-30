/**
 * AnimatedPostCard — анимированная карточка поста с свайпами.
 * Использует react-native-reanimated для плавных анимаций.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Post } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import { radii, shadows, spacing } from '../lib/theme';

type Props = {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onPress: () => void;
};

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

export default function AnimatedPostCard({
  post,
  onLike,
  onComment,
  onPress,
}: Props) {
  const { colors } = useTheme();

  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const likeScale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Tap gesture
  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.98, SPRING_CONFIG);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, SPRING_CONFIG);
      onPress();
    });

  // Double tap for like
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      likeScale.value = withSpring(1.3, SPRING_CONFIG, () => {
        likeScale.value = withSpring(1, SPRING_CONFIG);
      });
      onLike();
    });

  // Pan gesture for swipe
  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.2;
      opacity.value = 1 - Math.abs(e.translationX) / 300;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 100) {
        // Swipe action
        translateX.value = withTiming(e.translationX > 0 ? 400 : -400, {
          duration: 200,
        });
        opacity.value = withTiming(0, { duration: 200 });
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        opacity.value = withSpring(1, SPRING_CONFIG);
      }
    });

  // Compose gestures
  const composedGesture = Gesture.Simultaneous(
    Gesture.Race(doubleTapGesture, tapGesture),
    panGesture
  );

  // Animated styles
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const likeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            ...shadows.md,
          },
          cardStyle,
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {post.celebrityName?.charAt(0) || '?'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {post.celebrityName || 'Без имени'}
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {post.location || 'Место не указано'} • {formatDate(post.timestamp)}
            </Text>
          </View>
        </View>

        {/* Image */}
        {post.uri ? (
          <Image
            source={{ uri: post.uri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <Animated.View style={likeStyle}>
            <View
              style={[
                styles.actionButton,
                {
                  backgroundColor: post.liked
                    ? colors.dangerLight
                    : colors.surface,
                },
              ]}
            >
              <Ionicons
                name={post.liked ? 'heart' : 'heart-outline'}
                size={18}
                color={post.liked ? colors.danger : colors.textSecondary}
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color: post.liked ? colors.danger : colors.textSecondary,
                  },
                ]}
              >
                {post.likes}
              </Text>
            </View>
          </Animated.View>

          <View
            style={[
              styles.actionButton,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.actionText, { color: colors.textSecondary }]}
            >
              {post.comments?.length || 0}
            </Text>
          </View>

          <View
            style={[
              styles.actionButton,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.actionText, { color: colors.textSecondary }]}
            >
              {post.realVotes}
            </Text>
          </View>
        </View>

        {/* Caption */}
        {post.caption ? (
          <Text style={[styles.caption, { color: colors.text }]} numberOfLines={2}>
            {post.caption}
          </Text>
        ) : null}

        {/* Swipe Hint */}
        <View style={styles.swipeHint}>
          <Ionicons
            name="arrow-back"
            size={12}
            color={colors.textTertiary}
          />
          <Text style={[styles.hintText, { color: colors.textTertiary }]}>
            Свайпните для действий
          </Text>
          <Ionicons
            name="arrow-forward"
            size={12}
            color={colors.textTertiary}
          />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    opacity: 0.5,
  },
  hintText: {
    fontSize: 11,
  },
});
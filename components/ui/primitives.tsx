/**
 * Primitives 2.0 — PressableScale + Chip.
 * Press-scale 0.97 + min touch 48 (WCAG 2.2 AA).
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { hapticLight } from '../../lib/haptics';
import { minTouch, motion, radii, spacing, typography } from '../../lib/theme';

// ─── PressableScale ────────────────────────────

export function PressableScale({
  children,
  onPress,
  style,
  disabled,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.timing(scale, {
      toValue: motion.pressScale,
      duration: motion.durationFast,
      useNativeDriver: true,
    }).start();
  };
  const pressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: motion.durationFast,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={disabled}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={() => {
        hapticLight();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Chip ──────────────────────────────────────

type ChipProps = {
  label: string;
  active?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export function Chip({ label, active, icon, onPress }: ChipProps) {
  const { colors } = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityLabel={label}>
      <Animated.View
        style={[
          styles.chip,
          {
            backgroundColor: active ? colors.primary : colors.card,
            borderColor: active ? colors.primary : colors.border,
          },
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={16}
            color={active ? colors.primaryText : colors.textSecondary}
          />
        ) : null}
        <Text
          style={[
            typography.bodySmall,
            {
              color: active ? colors.primaryText : colors.text,
              fontWeight: active ? '700' : ('500' as const),
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

// ─── SegmentedControl ──────────────────────────

export type Segment = { key: string; label: string; icon?: keyof typeof Ionicons.glyphMap };

export function SegmentedControl({
  segments,
  activeKey,
  onChange,
}: {
  segments: Segment[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  const { colors } = useTheme();
  const activeIndex = Math.max(
    0,
    segments.findIndex((s) => s.key === activeKey),
  );
  const indicator = useRef(new Animated.Value(0)).current;
  const width = useRef(0);

  useEffect(() => {
    Animated.timing(indicator, {
      toValue: activeIndex,
      duration: motion.durationBase,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, indicator]);

  const onLayout = (e: LayoutChangeEvent) => {
    width.current = e.nativeEvent.layout.width / segments.length;
  };
  const segmentWidth = width.current || 0;

  return (
    <View
      onLayout={onLayout}
      style={[styles.segmented, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityRole="tablist"
    >
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.segmentIndicator,
            {
              width: segmentWidth - spacing.xs,
              backgroundColor: colors.card,
              transform: [
                {
                  translateX: indicator.interpolate({
                    inputRange: [0, segments.length - 1],
                    outputRange: [0, segmentWidth * (segments.length - 1)],
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}
      {segments.map((seg) => {
        const active = seg.key === activeKey;
        return (
          <TouchableOpacity
            key={seg.key}
            onPress={() => {
              hapticLight();
              onChange(seg.key);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.segment}
            activeOpacity={0.8}
          >
            {seg.icon ? (
              <Ionicons
                name={seg.icon}
                size={16}
                color={active ? colors.text : colors.textSecondary}
              />
            ) : null}
            <Text
              numberOfLines={1}
              style={[
                typography.bodySmall,
                { fontWeight: active ? '700' : ('500' as const), color: active ? colors.text : colors.textSecondary },
              ]}
            >
              {seg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── EmptyState ────────────────────────────────

export function EmptyState({
  icon,
  title,
  hint,
  actionLabel,
  onAction,
  style,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.empty, style]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={36} color={colors.textTertiary} />
      </View>
      <Text style={[typography.h3, { color: colors.text, textAlign: 'center' }]}>{title}</Text>
      {hint ? (
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>{hint}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction} accessibilityLabel={actionLabel}>
          <View style={[styles.emptyCta, { backgroundColor: colors.primary }]}>
            <Text style={[typography.bodyMedium, { color: colors.primaryText, fontWeight: '700' }]}>
              {actionLabel}
            </Text>
          </View>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: minTouch,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  segmented: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  segmentIndicator: {
    position: 'absolute',
    left: spacing.xs,
    top: spacing.xs,
    bottom: spacing.xs,
    borderRadius: radii.full,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 40,
    borderRadius: radii.full,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyCta: {
    minHeight: minTouch,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
});

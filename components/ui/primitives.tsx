/**
 * Primitives 2.0 — PressableScale + Chip.
 * Press-scale 0.97 + min touch 48 (WCAG 2.2 AA).
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
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
});

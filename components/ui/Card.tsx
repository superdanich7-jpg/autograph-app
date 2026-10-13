/**
 * Card — универсальная карточка для отображения контента.
 * Следует принципам Material Design 3 и Apple HIG.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radii, shadows, spacing } from '../../lib/theme';

type Props = {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'hero';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
}: Props) {
  const { colors } = useTheme();

  // A4: hero — edge-to-edge карточка с глубокой тенью (лента 2.0)
  if (variant === 'hero') {
    return (
      <View
        style={[
          styles.base,
          styles.hero,
          { backgroundColor: colors.card },
          shadows.lg,
          paddingStyles[padding],
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  const containerStyle = [
    styles.base,
    {
      backgroundColor: variant === 'outlined' ? 'transparent' : colors.card,
      borderColor: variant === 'outlined' ? colors.border : 'transparent',
      borderWidth: variant === 'outlined' ? 1 : 0,
    },
    variant === 'elevated' ? shadows.md : shadows.sm,
    paddingStyles[padding],
    style,
  ];

  return <View style={containerStyle}>{children}</View>;
}

const paddingStyles = StyleSheet.create({
  none: { padding: 0 },
  sm: { padding: spacing.sm },
  md: { padding: spacing.lg },
  lg: { padding: spacing.xxl },
});

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,
  },
  hero: {
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
});
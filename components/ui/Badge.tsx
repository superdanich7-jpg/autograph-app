/**
 * Badge — компонент для отображения меток и статусов.
 * Используется для редкости, категорий, статусов.
 */

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing, typography } from '../../lib/theme';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

export default function Badge({
  label,
  variant = 'default',
  size = 'md',
  icon,
  style,
}: Props) {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: colors.primaryLight },
          text: { color: colors.primary },
        };
      case 'success':
        return {
          container: { backgroundColor: colors.successLight },
          text: { color: colors.success },
        };
      case 'warning':
        return {
          container: { backgroundColor: colors.warningLight },
          text: { color: colors.warning },
        };
      case 'danger':
        return {
          container: { backgroundColor: colors.dangerLight },
          text: { color: colors.danger },
        };
      case 'info':
        return {
          container: { backgroundColor: colors.infoLight },
          text: { color: colors.info },
        };
      default:
        return {
          container: { backgroundColor: colors.surface },
          text: { color: colors.textSecondary },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
          text: typography.labelSmall,
        };
      case 'md':
        return {
          container: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
          text: typography.bodySmall,
        };
      case 'lg':
        return {
          container: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
          text: typography.bodySmall,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.base, sizeStyles.container, variantStyles.container, style]}>
      {icon}
      <Text style={[sizeStyles.text, variantStyles.text, icon ? styles.withIcon : null]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.full,
  },
  withIcon: {
    marginLeft: spacing.xs,
  },
});
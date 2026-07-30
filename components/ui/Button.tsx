/**
 * Button — универсальная кнопка с разными вариантами.
 * Поддерживает primary, secondary, ghost, danger стили.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { hapticLight } from '../../lib/haptics';
import { radii, shadows, spacing, typography } from '../../lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: Props) {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.primary,
            ...shadows.md,
          },
          text: { color: colors.primaryText },
          iconColor: colors.primaryText,
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          },
          text: { color: colors.text },
          iconColor: colors.text,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: { color: colors.primary },
          iconColor: colors.primary,
        };
      case 'danger':
        return {
          container: {
            backgroundColor: colors.danger,
          },
          text: { color: '#FFFFFF' },
          iconColor: '#FFFFFF',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
          text: typography.bodySmall,
          iconSize: 16,
        };
      case 'md':
        return {
          container: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
          text: typography.bodyMedium,
          iconSize: 18,
        };
      case 'lg':
        return {
          container: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl },
          text: typography.body,
          iconSize: 20,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={() => {
        hapticLight();
        onPress();
      }}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        sizeStyles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.iconColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={[sizeStyles.text, variantStyles.text]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.iconColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});
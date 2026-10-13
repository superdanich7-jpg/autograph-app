/**
 * Sheet 2.0 — bottom-sheet архитектура (тренд 2026).
 * 3 высоты: peek / half / full. Свайп-вниз закрыть, scrim, haptic.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { hapticLight, hapticMedium } from '../../lib/haptics';
import { radii, spacing, typography } from '../../lib/theme';

type SheetSize = 'peek' | 'half' | 'full';

const SHEET_RATIOS: Record<SheetSize, number> = {
  peek: 0.35,
  half: 0.62,
  full: 0.92,
};

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: SheetSize;
  children: React.ReactNode;
};

export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  size = 'half',
  children,
}: SheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const sheetHeight = screenHeight * SHEET_RATIOS[size];
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(sheetHeight);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, sheetHeight, translateY, backdropOpacity]);

  const close = () => {
    hapticLight();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120 || gesture.vy > 0.7) {
          hapticMedium();
          close();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={close}>
      <View style={styles.root}>
        <TouchableWithoutFeedback onPress={close} accessibilityRole="button" accessibilityLabel="Закрыть">
          <Animated.View style={[styles.backdrop, { backgroundColor: colors.overlay, opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
              backgroundColor: colors.card,
              transform: [{ translateY }],
            },
          ]}
        >
          <View {...panResponder.panHandlers} style={styles.handleZone} accessibilityRole="button" accessibilityLabel="Потяните вниз чтобы закрыть">
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>
          {title ? (
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={[typography.h3, { color: colors.text }]}>{title}</Text>
                {subtitle ? (
                  <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{subtitle}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={close}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Закрыть"
                style={[styles.closeBtn, { backgroundColor: colors.surface }]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.lg,
  },
  handleZone: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  content: {
    flex: 1,
  },
});

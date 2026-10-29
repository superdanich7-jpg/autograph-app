/**
 * Onboarding Screen — первый запуск приложения.
 * Объясняет основные функции и помогает начать использовать приложение.
 */

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { hapticLight } from '../lib/haptics';
import { motion, radii, shadows, spacing, typography } from '../lib/theme';

export const ONBOARDING_KEY = 'autograph.onboarding.v2';

type Props = {
  onComplete?: () => void;
};

export default function OnboardingScreen({ onComplete }: Props) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const iconAnim = useRef(new Animated.Value(0)).current;

  // Слайды внутри компонента: тексты зависят от выбранного языка.
  const slides = [
    {
      icon: 'camera-outline',
      title: t('onbPhotoTitle'),
      description: t('onbPhotoDesc'),
    },
    {
      icon: 'shield-checkmark-outline',
      title: t('onb2Title'),
      description: t('onb2Text'),
    },
    {
      icon: 'trophy-outline',
      title: t('onbShareTitle'),
      description: t('onb3Text'),
    },
  ];

  useEffect(() => {
    iconAnim.setValue(0);
    Animated.spring(iconAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, iconAnim]);

  const isLast = currentIndex === slides.length - 1;

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'completed');
    } catch (e) {
      console.warn('Failed to save onboarding state:', e);
    }
    // D2: последний слайд ведёт сразу к ценному действию (value-first).
    if (onComplete) {
      onComplete();
    } else {
      router.replace('/(tabs)/upload');
    }
  };

  const handleNext = () => {
    hapticLight();
    if (isLast) {
      handleComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    hapticLight();
    handleComplete();
  };

  const iconScale = iconAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={handleSkip} accessibilityRole="button" accessibilityLabel={t('onbSkip')}>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>{t('onbSkip')}</Text>
        </TouchableOpacity>
        <Text style={[typography.label, { color: colors.textTertiary }]}>
          {currentIndex + 1} / {slides.length}
        </Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.accent, width: `${((currentIndex + 1) / slides.length) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.slideContainer}>
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.accentLight, transform: [{ scale: iconScale }] },
          ]}
        >
          <Ionicons
            name={slides[currentIndex].icon as keyof typeof Ionicons.glyphMap}
            size={68}
            color={colors.accent}
          />
        </Animated.View>

        <Text style={[styles.title, { color: colors.text }]}>{slides[currentIndex].title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {slides[currentIndex].description}
        </Text>
      </View>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? colors.accent : colors.border,
                width: index === currentIndex ? 32 : 10,
              },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isLast ? colors.accent : colors.primary }, shadows.lg]}
        onPress={handleNext}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={isLast ? t('onbCta') : t('onbA11yNext')}
      >
        <Text style={[styles.buttonText, { color: colors.primaryText }]}>
          {isLast ? t('onbCta') : t('onbNext')}
        </Text>
        <Ionicons name={isLast ? 'camera' : 'arrow-forward'} size={20} color={colors.primaryText} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  iconContainer: {
    width: 148,
    height: 148,
    borderRadius: 74,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  button: {
    minHeight: 56,
    borderRadius: radii.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  buttonText: {
    ...typography.bodyMedium,
    fontSize: 17,
    fontWeight: '700',
  },
});
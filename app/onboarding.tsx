/**
 * Onboarding Screen — первый запуск приложения.
 * Объясняет основные функции и помогает начать использовать приложение.
 */

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { radii, shadows, spacing } from '../lib/theme';

const { width } = Dimensions.get('window');

const ONBOARDING_KEY = 'autograph.onboarding.v1';

const slides = [
  {
    icon: 'camera-outline',
    title: 'Фотографируйте автографы',
    description: 'Сделайте фото подписи — наш AI поможет определить, чей это автограф.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Подтверждайте подлинность',
    description: 'Сообщество голосует за подлинность. Чем больше голосов — тем выше доверие.',
  },
  {
    icon: 'trophy-outline',
    title: 'Собирайте достижения',
    description: 'Получайте бейджи за активность, коллекции и редкие находки.',
  },
  {
    icon: 'people-outline',
    title: 'Делитесь с друзьями',
    description: 'Экспортируйте коллекцию, шарьте посты и обменивайтесь автографами.',
  },
];

type Props = {
  onComplete?: () => void;
};

export default function OnboardingScreen({ onComplete }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'completed');
    } catch (e) {
      console.warn('Failed to save onboarding state:', e);
    }
    onComplete?.();
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip} accessibilityRole="button" accessibilityLabel="Пропустить обучение">
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Пропустить</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.slideContainer}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Ionicons
            name={slides[currentIndex].icon as keyof typeof Ionicons.glyphMap}
            size={64}
            color={colors.primary}
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {slides[currentIndex].title}
        </Text>
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
                backgroundColor: index === currentIndex ? colors.primary : colors.surface,
                width: index === currentIndex ? 32 : 10,
              },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleNext}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={currentIndex === slides.length - 1 ? 'Начать пользоваться приложением' : 'Следующий шаг обучения'}
      >
        <Text style={[styles.buttonText, { color: colors.primaryText }]}>
          {currentIndex === slides.length - 1 ? 'Начать' : 'Далее'}
        </Text>
        <Ionicons
          name={currentIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
          size={20}
          color={colors.primaryText}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingTop: spacing.lg,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
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
    ...shadows.md,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
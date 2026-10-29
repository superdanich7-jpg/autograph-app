import 'react-native-gesture-handler';

import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ErrorBoundary from '../components/ErrorBoundary';
import { LanguageProvider } from '../context/LanguageContext';
import { PostsProvider } from '../context/PostsContext';
import { ThemeProvider } from '../context/ThemeContext';
import AppBackground from '../components/ui/AppBackground';
import { configureNotifications } from '../lib/notifications';
import Toast from '../components/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_KEY } from './onboarding';

SplashScreen.preventAutoHideAsync().catch(() => { /* уже скрыт — не критично */ });

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        const inOnboarding = segments[0] === 'onboarding';
        if (done !== 'completed' && !inOnboarding) {
          router.replace('/onboarding');
        }
      } catch (e) {
        console.warn('Onboarding check failed:', e);
      } finally {
        setChecked(true);
      }
    })();
  }, [router, segments]);

  if (!checked) {
    return <View style={styles.root} />;
  }
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => { /* не критично */ });
    }
  }, [fontsLoaded]);

  useEffect(() => {
    try {
      configureNotifications();
    } catch (e) {
      // Notifications not supported in Expo Go
      console.warn('Notifications not available:', e);
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.root} pointerEvents="box-none">
        {/* Liquid-glass фон: градиент + золотые свечения под всеми экранами */}
        <AppBackground />
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <PostsProvider>
                <OnboardingGate>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="onboarding" />
                    <Stack.Screen name="chat" options={{ presentation: 'card' }} />
                    <Stack.Screen name="auth" />
                  </Stack>
                </OnboardingGate>
              </PostsProvider>
            </LanguageProvider>
            {/* Toast вызывает useTheme — обязан быть внутри ThemeProvider
                (вне провайдера на web падал весь монтаж: белый экран). */}
            <Toast />
          </ThemeProvider>
        </ErrorBoundary>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

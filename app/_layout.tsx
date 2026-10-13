import 'react-native-gesture-handler';

import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ErrorBoundary from '../components/ErrorBoundary';
import { PostsProvider } from '../context/PostsContext';
import { ThemeProvider } from '../context/ThemeContext';
import { configureNotifications } from '../lib/notifications';
import Toast from '../components/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_KEY } from './onboarding';

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
  useEffect(() => {
    try {
      configureNotifications();
    } catch (e) {
      // Notifications not supported in Expo Go
      console.warn('Notifications not available:', e);
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.root} pointerEvents="box-none">
        <ErrorBoundary>
          <ThemeProvider>
            <PostsProvider>
              <OnboardingGate>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="chat" options={{ presentation: 'card' }} />
                  <Stack.Screen name="auth" />
                  <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                </Stack>
              </OnboardingGate>
            </PostsProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <Toast />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

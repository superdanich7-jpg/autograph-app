import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ErrorBoundary from '../components/ErrorBoundary';
import { PostsProvider } from '../context/PostsContext';
import { ThemeProvider } from '../context/ThemeContext';
import { configureNotifications } from '../lib/notifications';
import Toast from '../components/Toast';

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
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
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

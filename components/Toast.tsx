import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

let toastId = 0;
const listeners = new Set<(toast: ToastItem) => void>();

export function showToast(message: string, type: ToastType = 'info') {
  const toast: ToastItem = { id: ++toastId, message, type };
  listeners.forEach((l) => l(toast));
}

export default function Toast() {
  const { colors } = useTheme();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const [next, setNext] = useState<ToastItem[]>([]);
  const visible = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const handler = (toast: ToastItem) => {
      setNext((prev) => [...prev, toast]);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  useEffect(() => {
    if (!current && next.length > 0) {
      const [first, ...rest] = next;
      setCurrent(first);
      setNext(rest);
      Animated.sequence([
        Animated.timing(visible, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(visible, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        setCurrent(null);
      });
    }
  }, [current, next, visible]);

  if (!current) return null;

  const bg = current.type === 'success' ? colors.success : current.type === 'error' ? colors.danger : colors.primary;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.toast, { backgroundColor: bg, opacity: visible }]}>
        <Text style={[styles.text, { color: '#ffffff' }]}>{current.message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 24, alignItems: 'center', zIndex: 999 },
  toast: { minWidth: 260, maxWidth: 520, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  text: { fontSize: 14, fontWeight: '600' },
});
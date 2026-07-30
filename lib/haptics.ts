/**
 * Haptics Service — тактильная обратная связь.
 * Использует expo-haptics для улучшения UX.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function isSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

// ─── Light feedback ────────────────────────────

export async function hapticLight() {
  if (!isSupported()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (e) {
    // Silent fail on unsupported devices
  }
}

// ─── Medium feedback ───────────────────────────

export async function hapticMedium() {
  if (!isSupported()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (e) {
    // Silent fail
  }
}

// ─── Heavy feedback ────────────────────────────

export async function hapticHeavy() {
  if (!isSupported()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (e) {
    // Silent fail
  }
}

// ─── Success notification ──────────────────────

export async function hapticSuccess() {
  if (!isSupported()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (e) {
    // Silent fail
  }
}

// ─── Warning notification ──────────────────────

export async function hapticWarning() {
  if (!isSupported()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (e) {
    // Silent fail
  }
}

// ─── Error notification ────────────────────────

export async function hapticError() {
  if (!isSupported()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (e) {
    // Silent fail
  }
}

// ─── Selection changed ─────────────────────────

export async function hapticSelection() {
  if (!isSupported()) return;
  try {
    await Haptics.selectionAsync();
  } catch (e) {
    // Silent fail
  }
}
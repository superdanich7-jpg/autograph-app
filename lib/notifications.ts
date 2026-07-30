/**
 * Notifications Service — работа с push-уведомлениями.
 * Использует expo-notifications для отправки и получения уведомлений.
 */

import * as Notifications from 'expo-notifications';

// ─── Configure notification behavior ───────────

export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// ─── Request permission ────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// ─── Get push token ────────────────────────────

export async function getPushToken(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return null;

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (error) {
    console.warn('[Notifications] Failed to get push token:', error);
    return null;
  }
}

// ─── Schedule local notification ───────────────

export async function scheduleLocalNotification({
  title,
  body,
  data,
  trigger,
}: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  trigger?: Notifications.NotificationTriggerInput;
}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: trigger || null,
    });
  } catch (error) {
    console.warn('[Notifications] Failed to schedule notification:', error);
  }
}

// ─── Send immediate notification ───────────────

export async function sendImmediateNotification({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  await scheduleLocalNotification({ title, body, data });
}

// ─── Add notification listener ─────────────────

export function addNotificationListener(
  handler: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(handler);
}

// ─── Add response listener ─────────────────────

export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

// ─── Clear badge ───────────────────────────────

export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}

// ─── Cancel all ────────────────────────────────

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
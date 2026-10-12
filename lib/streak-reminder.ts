/**
 * Streak Reminder — напоминание не потерять серию дней (streak).
 *
 * CEO-идея #9 (Фаза 2). Рисерч: Duolingo/BeReal — push-напоминание при угрозе
 * потери серии значительно повышает D30 retention.
 *
 * Логика решения — ЧИСТАЯ функция (тестируемая). Фактическая отправка —
 * тонкая обёртка поверх expo-notifications (см. scheduleStreakReminder).
 */

/** Решение: нужно ли напомнить о серии сегодня. */
export interface StreakReminderDecision {
  /** Нужно ли запланировать напоминание. */
  shouldRemind: boolean;
  /** Текущая серия (дней). */
  streak: number;
  /** Пояснение решения (для логов/тестов). */
  reason: string;
}

export interface StreakReminderInput {
  /** ISO-timestamp'ы постов пользователя. */
  timestamps: string[];
  /** Включены ли уведомления в профиле. */
  notificationsEnabled: boolean;
  /** Разрешение на уведомления уже получено. */
  hasPermission: boolean;
  /** Сегодняшняя дата (для тестируемости). */
  today?: Date;
}

function toDayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Считает текущую серию дней с активностью (дублирует getDayStreak, но автономно). */
export function computeStreak(timestamps: string[], today: Date = new Date()): number {
  if (timestamps.length === 0) return 0;
  const dayKeys = new Set(timestamps.map((t) => toDayKey(new Date(t))));
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  if (!dayKeys.has(toDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dayKeys.has(toDayKey(cursor))) return 0;
  }
  let streak = 0;
  while (dayKeys.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Решает, напоминать ли о серии. Напоминаем ТОЛЬКО если:
 *  - уведомления включены и разрешены,
 *  - есть что терять (streak >= 2),
 *  - сегодня ещё НЕ было активности (иначе серия уже продлена).
 */
export function shouldRemindStreak(input: StreakReminderInput): StreakReminderDecision {
  const today = input.today ?? new Date();
  const streak = computeStreak(input.timestamps, today);

  if (!input.notificationsEnabled) {
    return { shouldRemind: false, streak, reason: 'Уведомления отключены в профиле' };
  }
  if (!input.hasPermission) {
    return { shouldRemind: false, streak, reason: 'Нет разрешения на уведомления' };
  }
  if (streak < 2) {
    return { shouldRemind: false, streak, reason: 'Серия слишком мала, терять нечего' };
  }

  const dayKeys = new Set(input.timestamps.map((t) => toDayKey(new Date(t))));
  const activeToday = dayKeys.has(toDayKey(today));
  if (activeToday) {
    return { shouldRemind: false, streak, reason: 'Сегодня уже была активность — серия продлена' };
  }

  return { shouldRemind: true, streak, reason: `Серия ${streak} дн. под угрозой — напоминаем` };
}

/** Текст напоминания с учётом длины серии. */
export function buildStreakReminderText(streak: number): { title: string; body: string } {
  return {
    title: `🔥 Не потеряйте серию ${streak} дн.!`,
    body: 'Добавьте автограф сегодня, чтобы продолжить серию и приблизиться к новой награде.',
  };
}

/**
 * Планировщик: если нужно напомнить — ставит локальное уведомление на 20:00.
 * Тонкая обёртка над expo-notifications (lib/notifications.ts). Нативная часть
 * изолирована, чтобы логика выше оставалась чисто тестируемой.
 */
export async function scheduleStreakReminderIfNeeded(
  input: StreakReminderInput
): Promise<StreakReminderDecision> {
  const decision = shouldRemindStreak(input);
  if (!decision.shouldRemind) return decision;

  try {
    // Ленивый импорт, чтобы чистые тесты не тянули нативный модуль.
    const { scheduleLocalNotification } = await import('./notifications');
    const { title, body } = buildStreakReminderText(decision.streak);

    // Целевое время — сегодня в 20:00 (или завтра, если уже прошло).
    const target = new Date(input.today ?? new Date());
    target.setHours(20, 0, 0, 0);
    if (target.getTime() < Date.now()) {
      target.setDate(target.getDate() + 1);
    }

    await scheduleLocalNotification({
      title,
      body,
      data: { type: 'streak_reminder', streak: decision.streak },
      trigger: { hour: target.getHours(), minute: target.getMinutes(), repeats: false } as any,
    });
  } catch (error) {
    console.warn('[StreakReminder] Failed to schedule:', error);
  }
  return decision;
}


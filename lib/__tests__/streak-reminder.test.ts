/**
 * Unit Tests — lib/streak-reminder.ts
 * Логика напоминания о серии дней (CEO-идея #9).
 */

import {
  buildStreakReminderText,
  computeStreak,
  shouldRemindStreak,
} from '../streak-reminder';

const today = new Date('2026-10-12T12:00:00');

function daysAgoIso(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

describe('computeStreak', () => {
  test('пусто → 0', () => {
    expect(computeStreak([], today)).toBe(0);
  });

  test('серия подряд идущих дней', () => {
    expect(computeStreak([daysAgoIso(0), daysAgoIso(1), daysAgoIso(2)], today)).toBe(3);
  });

  test('разрыв обрывает серию', () => {
    expect(computeStreak([daysAgoIso(0), daysAgoIso(2)], today)).toBe(1);
  });

  test('если сегодня нет активности, считает от вчера', () => {
    expect(computeStreak([daysAgoIso(1), daysAgoIso(2)], today)).toBe(2);
  });
});

describe('shouldRemindStreak', () => {
  const base = {
    today,
    notificationsEnabled: true,
    hasPermission: true,
  };

  test('не напоминаем, если уведомления отключены', () => {
    const d = shouldRemindStreak({
      ...base,
      notificationsEnabled: false,
      timestamps: [daysAgoIso(1), daysAgoIso(2)],
    });
    expect(d.shouldRemind).toBe(false);
  });

  test('не напоминаем без разрешения', () => {
    const d = shouldRemindStreak({
      ...base,
      hasPermission: false,
      timestamps: [daysAgoIso(1), daysAgoIso(2)],
    });
    expect(d.shouldRemind).toBe(false);
  });

  test('не напоминаем, если серия < 2', () => {
    const d = shouldRemindStreak({ ...base, timestamps: [daysAgoIso(1)] });
    expect(d.shouldRemind).toBe(false);
    expect(d.streak).toBe(1);
  });

  test('не напоминаем, если сегодня уже была активность', () => {
    const d = shouldRemindStreak({
      ...base,
      timestamps: [daysAgoIso(0), daysAgoIso(1), daysAgoIso(2)],
    });
    expect(d.shouldRemind).toBe(false);
    expect(d.streak).toBe(3);
  });

  test('напоминаем при серии >= 2 и отсутствии активности сегодня', () => {
    const d = shouldRemindStreak({
      ...base,
      timestamps: [daysAgoIso(1), daysAgoIso(2), daysAgoIso(3)],
    });
    expect(d.shouldRemind).toBe(true);
    expect(d.streak).toBe(3);
    expect(d.reason).toContain('под угрозой');
  });
});

describe('buildStreakReminderText', () => {
  test('содержит длину серии в заголовке', () => {
    const { title, body } = buildStreakReminderText(5);
    expect(title).toContain('5');
    expect(body.length).toBeGreaterThan(0);
  });
});

## LOOP-CEO-13 — Push-напоминание о серии (streak) (2026-10)

CEO-идея #9 (Фаза 2). Рисерч: Duolingo/BeReal — push при угрозе потери серии
значительно повышает D30 retention.

### Что сделано
- [x] `lib/streak-reminder.ts` — чистая логика решения (тестируемо):
  - `computeStreak` — серия дней с активностью
  - `shouldRemindStreak` — напоминаем только если: уведомления вкл + разрешены,
    серия >= 2, сегодня ещё НЕ было активности
  - `buildStreakReminderText` — текст «🔥 Не потеряйте серию N дн.!»
  - `scheduleStreakReminderIfNeeded` — тонкая обёртка над expo-notifications
    (ленивый импорт, локальное уведомление на 20:00)
- [x] `profile.tsx` — useEffect планирует напоминание при открытии профиля
  (уважает `profile.notificationsEnabled`, запрашивает разрешение, тихий фолбэк)
- [x] 10 unit-тестов (`lib/__tests__/streak-reminder.test.ts`)

### Валидация
- typecheck PASS, encoding ALL CLEAN, jest 149/149 PASS.

### Что осталось (Фаза 3)
- [ ] Синхронизация серии с облаком `user_stats.streak_days`
- [ ] Серверный push (Expo Push API) вместо локального — когда появится бэкенд

# LOOP-CEO-06 — Виральная карточка «Моя статистика» (Spotify-Wrapped)

> CEO-идея #11. Дата: 2026-10. Рисерч: Spotify Wrapped / BeReal — шаринг личных
> «достижений» даёт бесплатный органический охват. Каждый шейр = реклама приложения.

## Что сделано
- `lib/stats-share.ts` (чистые функции, без нативных зависимостей):
  - `getCollectorTitle(stats)` — «титул» по статистике (Легендарный охотник /
    Заядлый / Растущий / Доверенный хранитель / Начинающий).
  - `buildCollectorStatsSummary(stats)` — заголовок + строки + готовый текст шейра
    (число автографов, уникальные имена, подтверждения, легендарные, любимая
    категория с эмодзи, репутация, deep-link на профиль).
- `components/ShareStatsCard.tsx`:
  - Карточка в профиле с трофеем, заголовком-титулом и кнопкой-шерингом.
  - `Sharing.shareAsync` (expo-sharing) → системный share-шторка; fallback — Alert.
  - Haptic (`hapticMedium`/`hapticSuccess`) + Toast.
  - Пустая коллекция → подсказка добавить первый автограф.
- `app/(tabs)/profile.tsx`: карточка добавлена рядом с `ExportCollection`.
- `lib/__tests__/stats-share.test.ts` — 8 unit-тестов (титулы, состав строк, deep-link,
  нулевые значения не создают пустых строк).

## Примечание
- `expo-clipboard` НЕ используется (нет в package.json) — только подтверждённые
  библиотеки (expo-sharing, expo-linking, expo-haptics).

## Валидация
- typecheck PASS, jest **89/89** PASS (+8), encoding ALL CLEAN.

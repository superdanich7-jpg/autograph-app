# Autograph App — Senior DevOps Audit (2026-10-05)

> Статус: Шаг 1 — Ревью проекта. Следующий шаг: MVP-план.
> Основа: main @ a5e8410, typecheck PASS, рабочая копия грязная (6M + 3??).

## 1. Резюме для Founder
Проект — Expo 54 + React Native + expo-router + Supabase. MVP-функционал есть
(лента, загрузка, профиль, community, onboarding, achievements, notifications),
но к релизу/инвесторам не готов: UI перегружен, доставка через Expo Go + QR,
БД не доказана end-to-end, git грязный, есть RLS/UX/tech риски.

## 2. Что проверено
- `package.json`, `app.json`, `eas.json`, `tsconfig.json`, `.github/workflows/build.yml`
- `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `index.tsx`, `onboarding.tsx`, `TabBar.tsx`
- `context/PostsContext.tsx`, `hooks/useCloudSync.ts`, `lib/api.ts`, `lib/supabase.ts`, `lib/env.ts`, `lib/theme.ts`
- `supabase/migrations/001-005`, `docs/supabase-setup.md`, `tasks/*`
- `git status`, `git log`, `git ls-files`, `npm run typecheck` (PASS)

## 3. Ключевые выводы (кратко)
1. UI: перегружен, 4 гигантских экрана (17-39KB), нет дизайн-системы в использовании, `constants/Colors.ts` — legacy.
2. Доставка: только Expo Go + QR. Нет dev-client/APK для инвестора, нет OTA-каналов кроме production URL.
3. БД: схема есть (5 миграций), но cloud-sync опционален, offline-first скрывает ошибки. Нет доказанного WRITE->READ.
4. Баги: ~миллиард подтверждается частично — onboarding FlatList-баг, RLS-дыры, unmounted setState, local URI без Storage.
5. Git: 6 изменённых + 3 новых файла не закоммичены, битый gitlink `.claude/worktrees/...`, нет README, нет тегов релиза.

Детали: см. `tasks/AUDIT-UI.md`, `AUDIT-DB.md`, `AUDIT-EXPO.md`, `DEFECTS.md`, `AUDIT-GIT.md`.

# AUDIT-DB — База данных: запись и чтение

## Факты
- 5 миграций: profiles, posts, celebrity_signatures, achievements, notifications.
- Клиент: `lib/supabase.ts` + `lib/api.ts` + `hooks/useCloudSync.ts` + `context/PostsContext.tsx`.
- Синхронизация опциональна (`isSupabaseConfigured`), offline-first через AsyncStorage.
- `.env` существует локально, `.env.example` — заглушка.

## Проверено
- WRITE: `upsertPosts`, `upsertProfile` — есть, но батч без retry/conflict resolution.
- READ: `fetchPosts`, `fetchProfile` — есть, но `refreshCloudData` возвращает данные, которые никто не кладёт в state в `useCloudSync`.
- RLS 001: строгая (только владелец). 002: `Anyone can read`, `authenticated can update чужие посты` — дыра.
- 004: `user_achievements_insert WITH CHECK (true)` — любой может писать.
- 005: notifications SELECT/INSERT/UPDATE `USING (true)` — любой читает/пишет чужие уведомления.
- Storage: изображения хранятся как локальные URI (`post.uri`), в Storage не загружаются → на другом устройстве битые картинки.

## Вердикт
БД «работает» только при настроенном .env + login. Без E2E-теста WRITE->READ в Table Editor
утверждать нельзя. Требуется `docs/DB-PROOF.md` с чек-листом проверки.

## Недостатки
- DB-01 Нет доказательства сквозной записи/чтения.
- DB-02 RLS-дыры в 002/004/005.
- DB-03 Нет Supabase Storage для фото.
- DB-04 Нет сида celebrity_signatures в облаке (только `supabase/seed.ts` локально).
- DB-05 Нет миграционного раннера в CI.

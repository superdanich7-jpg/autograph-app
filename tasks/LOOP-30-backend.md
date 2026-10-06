# LOOP-30/31/32/33 — БД и бэкенд ✅ CODE DONE

- LOOP-30: `supabase/migrations/006_rls_hardening.sql` — update posts только владелец, achievements/stats/notifications только свои строки (B-02/B-03 closed)
- LOOP-31: `lib/storage.ts` — `uploadAutographPhoto()` в бакет `autographs/`, вшит в `handlePublish` в `upload.tsx` (B-05 closed в коде)
- LOOP-32: сид уже есть — `supabase/seed.ts` (облако, service_role) + `lib/celebrity-database.ts` (50+ записей) + тесты; запуск: `npm run seed:celebrities`
- LOOP-33: CI без `passWithNoTests`-заглушки (`npm test -- --passWithNoTests=false`), добавлен `jest.config.js` (preset jest-expo), скрипты `test`, `seed:*` в package.json

## Осталось руками (нужен Supabase доступ)
- [ ] Применить 001–006 в SQL Editor
- [ ] Создать бакет `autographs` (SQL в `lib/storage.ts`)
- [ ] `npm run seed:celebrities` с `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Скрин Table Editor → `docs/db-proof/`

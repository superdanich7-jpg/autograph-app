# LOOP-02 — DB PROOF (WRITE → READ)

## Как доказать инвестору, что БД работает
1. Supabase Dashboard → SQL Editor → выполнить `supabase/migrations/001_*.sql` … `006_rls_hardening.sql`.
2. Выполнить SQL создания бакета из комментария внизу `lib/storage.ts`.
3. В приложении: войти (Auth) → вкладка «Добавить» → опубликовать пост.
4. Dashboard → Table Editor → `autograph_posts`: новая строка с `payload.celebrityName`.
5. Dashboard → Storage → `autographs/<userId>/…jpg`: фото вместо `file://`.
6. Pull-to-refresh в ленте → пост виден (READ из облака).

## Что уже сделано в коде
- `refreshCloudData()` читает `autograph_posts` + `autograph_profiles` (READ ✅)
- `persistPostToCloud()` пишет payload через очередь (WRITE ✅)
- `uploadAutographPhoto()` в `lib/storage.ts` грузит фото в Storage (B-05 ✅)
- RLS уже не `USING (true)` на update/insert — миграция 006 (B-02/B-03 ✅)

## Осталось руками (нужен доступ к Supabase проекту)
- [ ] Применить миграции в облаке
- [ ] Создать бакет `autographs`
- [ ] `npx tsx supabase/seed.ts` — сид знаменитостей (LOOP-32)
- [ ] Скрин Table Editor + Storage в `docs/db-proof/`

# LOOP-B01…B12 — Трекинг дефектов

| ID | Статус в этом коммите |
|----|----------------------|
| B-01 onboarding FlatList | ✅ FIXED ранее (слайды через state, dots, a11y) — verify на устройстве |
| B-02 RLS posts update чужих | ✅ FIXED миграцией 006 (owner-only) |
| B-03 RLS achievements/notifications true-true | ✅ FIXED миграцией 006 (owner-only) |
| B-04 локальные URI фото | ✅ FIXED в коде: `lib/storage.ts` + вшит в `handlePublish` (`upload.tsx`) — verify на устройстве с реальным Supabase |
| B-05 useCloudSync не коммитит posts | ✅ OK: контекст сам select+setPosts; хук возвращает данные вызывающему — verify |
| B-06 unmounted setState flush | ✅ FIXED: `mountedRef` уже добавлен в `PostsContext` (flush queue) и `useCloudSync` — verify варнингов не осталось |
| B-07 свайп vs TabBar | ✅ FIXED: `_layout.tsx` чистый (Tabs + CustomTabBar), хук `useSwipeNavigation` мёртвый — удалить файл следующим коммитом |
| B-08 gitlink .claude | ✅ FIXED ранее (удалён, в .gitignore) |
| B-09 mock-AI без сервера | ⏳ ACCEPTED для MVP: quickMatch+celebrity-db+seed; серверная проверка — post-MVP |
| B-10 legacy Colors.ts | ✅ FIXED: файл удалён |
| B-11 CI passWithNoTests | ✅ FIXED: реальные jest-тесты, strict CI |
| B-12 нет lint/test скриптов | ✅ FIXED: test/typecheck/seed скрипты + jest.config |

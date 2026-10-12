## LOOP-CEO-14 — Приватные сообщества коллекционеров (2026-10)

CEO-идея #5 (Фаза 2). Рисерч: закрытые клубы по интересам (Discord/Reddit) —
сильный драйвер удержания и UGC.

### Что сделано
- [x] `lib/communities.ts` — чистая модель + логика членства (17 тестов):
  - Тип `Community`, нормализация/валидация ввода
  - `createCommunity` (владелец = участник), `getMembership`
  - `requestJoin` (публичное → сразу участник; приватное → pending)
  - `approveMember`/`rejectMember`/`leaveCommunity`, `sortCommunitiesForUser`
- [x] `supabase/migrations/007_communities.sql` — облачный слой:
  - Таблицы `communities`, `community_members`, `community_requests`
  - Полный RLS (приватные видны только участникам/владельцу)
  - Триггер `member_count`
- [x] `context/PostsContext.tsx` — offline-first состояние (persist в AsyncStorage,
  как Collection): `communities`, `createCommunity`, `requestJoinCommunity`,
  `approveCommunityJoin`, `rejectCommunityJoin`, `leaveCommunity`
- [x] `components/CommunitiesList.tsx` — UI: список, создание (категории + Switch
  «Приватное»), вступление/выход, одобрение заявок владельцем
- [x] `profile.tsx` — кнопка «Сообщества» + модалка

### Ограничение (честно)
Клиентская модель offline-first (без реального multi-user). Синхронизация
участников и чат внутри сообщества требуют Supabase realtime → Фаза 3
(миграция 007 уже готова, ждёт подключения бэкенда).

### Валидация
- typecheck PASS, encoding ALL CLEAN, jest 166/166 PASS.

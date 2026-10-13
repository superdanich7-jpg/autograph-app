# BACKEND-NEEDED — минимум, где нужна помощь founder'а

Всё ниже — только то, что агент НЕ может сделать сам (нет секретов/доступа).
UI-прорыв идёт полностью без этих пунктов.

## 1. Supabase (5 минут, Supabase Dashboard → SQL Editor)
- [ ] Применить `supabase/migrations/007_communities.sql` (клубы) — кнопка Run.
- [ ] Проверить Storage bucket `autographs` (public read, auth write) — `lib/storage.ts` уже готов.
- [ ] Взять `SUPABASE_SERVICE_ROLE_KEY` → `.env` → `npm run seed:celebrities` (50+ знаменитостей).

## 2. Сборка без QR (10 минут, терминал)
- [ ] `eas build --platform android --profile preview --non-interactive` → ссылка-инсталлер для инвесторов.
- [ ] `npx expo start --web` → web-стенд для демо с ноутбука.

## 3. Push-сервер (позже, Фаза 3)
- [ ] `projectId` в `app.json` (expo-notifications) + Expo Push API ключ — тогда `lib/streak-reminder.ts` станет серверным.
- [ ] Без этого streak-напоминания работают локально — для MVP достаточно.

## 4. Платные/внешние API (Фаза 3, опционально)
- [ ] История цен (PWCC/Beckett/eBay) — ключ API → `lib/valuation.ts` из эвристики станет live.
- [ ] Passkeys (смерть паролей, тренд 2026) — замена email-auth, когда будет backend-время.

Итого: прорыв UI — 0 пунктов бэка. Выше — только для live-синхронизации и витрины инвестору.

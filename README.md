# Autograph — коллекционируй. Проверяй. Делись.

Мобильное приложение для коллекционеров автографов: фото → AI-предпроверка → голосование сообщества → витрина коллекции.

## Питч-сценарий (3 клика, 60 секунд)
1. **Добавить** — вкладка «Добавить», фото автографа, имя звезды → «Опубликовано».
2. **AI-проверка** — карточка показывает «Возможное совпадение: … (N% совпадения)».
3. **Шаринг** — кнопка «поделиться» в карточке → QR + deep-link `autograph://post/<id>`.

## Статус MVP
- ✅ `npm run typecheck` — PASS
- ✅ `npm test` — Jest (celebrity-database, utils)
- ✅ RLS hardening — миграция `006_rls_hardening.sql` (B-02, B-03)
- ✅ Фото — Supabase Storage `autographs/` (`lib/storage.ts`, B-05)
- ✅ Онбординг починен (B-01), свайп-конфликт убран (UI-03)
- ⏳ Preview APK — `eas build --platform android --profile preview`
- ⏳ Web-стенд — `npx expo export --platform web` → EAS Hosting / Vercel
- ⏳ Сид знаменитостей — `npx tsx supabase/seed.ts` (нужен `SUPABASE_SERVICE_ROLE_KEY`)

## Быстрый старт (без QR)
```bash
npm install
cp .env.example .env   # заполнить EXPO_PUBLIC_SUPABASE_URL / ANON_KEY
npm run typecheck
npm test
npx expo start --web   # демо с ноутбука для инвестора
```

## БД: доказательство WRITE → READ (LOOP-02)
1. Применить миграции 001–006 в Supabase Dashboard → SQL Editor.
2. Создать бакет `autographs` (SQL — внизу `lib/storage.ts`).
3. Залогиниться в приложении → добавить пост → проверить строку в Table Editor `autograph_posts`.
4. Проверить `storage.objects` — файл `autographs/<userId>/<id>.jpg`.

## Структура для agentic loops
- `tasks/AUDIT-*.md` — аудит (Senior DevOps)
- `tasks/DEFECTS.md` — баги B-01…B-12
- `tasks/MVP-PLAN.md` — план релиза
- `tasks/LOOP-*.md` — по одному файлу на loop = один коммит

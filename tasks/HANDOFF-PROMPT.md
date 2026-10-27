# HANDOFF — промпт для продолжения работы в другой агентной системе

> Скопируй блок ниже целиком в нового агента. Файлы-источники: `tasks/AUDIT-2026-10-25.md`,
> `tasks/RELEASE-PLAN-2026-10.md`, `tasks/BUGS-REGISTRY.md`, `tasks/progress.md`, `CHANGELOG.md`.

---

Ты работаешь над проектом **Autograph App** — мобильное приложение для коллекционеров
автографов (Expo SDK 57 / RN 0.86 / React 19.2 / expo-router, бэкенд Supabase, offline-first).
Репозиторий: `C:\Users\plotn\Desktop\autograph-app-v2` (Windows, Git Bash), remote:
`github.com/superdanich7-jpg/autograph-app`, ветка `main`. Состояние: **v0.2.0-mvp выпущен**
(тег + GitHub Release), web-демо живое: https://superdanich7-jpg.github.io/autograph-app/

## Обязательные правила работы

1. **Прочти сначала** (в этом порядке): `tasks/RELEASE-PLAN-2026-10.md` (план и журнал),
   `tasks/BUGS-REGISTRY.md` (живые баги), `tasks/AUDIT-2026-10-25.md` (31 находка, 20 RESOLVED).
2. **Один шаг = один коммит = пуш в main** + краткий отчёт пользователю. Не копи изменения.
3. После КАЖДОГО изменения кода: `npm run verify` (encoding + typecheck + lint + 212 тестов).
   Красный verify = не пушить, чинить до зелёного. ESLint rules-of-hooks — errors, не warnings:
   хуки НИКОГДА не должны стоять после early-return (в проекте уже дважды ловили краши из-за этого).
4. **Секреты**: `.env` в git не попадает и не должен (проверено). НИКОГДА не печатай значения
   токенов в вывод/коммиты: `SUPABASE_ACCESS_TOKEN` (sbp_, Management API),
   `SUPABASE_SECRET_KEY`/`sb_secret_`, `SUPABASE_PUBLISHABLE_KEY`/`sb_publishable_`,
   легаси `EXPO_PUBLIC_SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY`.
5. Документируй всё: новый баг → строка в `tasks/BUGS-REGISTRY.md`; шаг → запись в
   `tasks/progress.md`. Стиль коммитов — как в `git log`: префикс LOOP-*/HOTFIX-*/fix(...) с
   русским описанием и результатом проверки.

## Готовые инструменты проекта (не изобретать заново)

- `npm run verify` — полный гейт качества (обязателен перед пушем)
- `npm run db:health` — живая диагностика Supabase (REST/Auth/13 таблиц/бакет; exit 0/1/2)
- `npm run db:proof` — доказательство WRITE→READ→UPDATE через настоящие Auth+RLS
- `npm run deploy:web` — сборка web + публикация на GitHub Pages (gh-pages, .nojekyll).
  ВАЖНО: после деплоя прод кэширует HTML до ~10 минут; для проверки добавь `?fresh=<timestamp>`
- `npm run seed:celebrities` — сид знаменитостей (внимание: BUG F-30 — upsert без unique-констрейнта)
- `node scripts/generate-assets.js` — регенерация бренд-ассетов Ink&Gold
- `scripts/serve-dist.js` — локальный сервер dist на :8099 с путём /autograph-app (для отладки web)
- Supabase Management API (токен в .env): SQL — `POST https://api.supabase.com/v1/projects/rdvlzhozvjqednpuslfa/database/query {"query": "..."}`; деплой Edge Function — `PATCH /functions/{slug}` с `{body}`.
- Отладка web-ошибок: вшить error-хук в dist/index.html (`window.__capturedErrors`), открыть
  через scripts/serve-dist.js, читать ошибки через playwright/evaluate. Консоли в headless нет.
- Проверка GitHub API (CI-статусы, Releases): токен из `git credential fill` (stdin:
  `protocol=https\nhost=github.com\n\n`), читать только password=. Не печатать.
- В браузере можно тестировать прод: онбординг, лента, /upload прямой ссылкой, таб-бар (кнопки
  Лента/Клуб/Добавить/Профиль).

## Известные ограничения (не баги, не чинить без задачи)

- Старые посты с device-URI показывают «Фото не удалось загрузить» на web (локальные URI;
  новая загрузка идёт в Supabase Storage — бакет `autographs`).
- Без `EXPO_PUBLIC_POSTHOG_KEY` аналитика — no-op (lib/analytics). Без секрета
  `GOOGLE_VISION_API_KEY` у Edge Function — честный 400, приложение на локальной эвристике.
- GitHub Pages кэширует ~10 минут; EAS-сборки в CI только по workflow_dispatch (теги убраны —
  без EXPO_TOKEN они краснят релиз).

## Задачи по приоритету (делай сверху вниз, по одной = один коммит)

1. **Preview-APK (R-04)** — единственный незакрытый пункт релизного плана, блокирует «протестить
   на телефоне без браузера». Два пути: (А) локально `npx eas-cli build -p android --profile
   preview --no-wait` (EAS залогинен как danilchil; сеть РФ до api.expo.dev нестабильна —
   ECONNRESET, могут помочь ретраи/другой VPN); (Б) попросить Founder создать EXPO_TOKEN на
   expo.dev (Account Settings → Access Tokens) и добавить его в GitHub Secrets → тогда запусти
   workflow «Build & Test» через GitHub API (workflow_dispatch). После сборки: ссылку на APK —
   в README (таблица демо-ссылок) и в GitHub Release v0.2.0-mvp.
2. **Реальный smoke веб-флоу регистрации** (BUG-предохранитель после d03992c): в браузере пройти
   Войти → зарегистрировать новый аккаунт → создать пост → убедиться, что пост ушёл в облако
   (db:proof / Table Editor) и виден из инкогнито. Если найдёшь баг — BUGS-REGISTRY + фикс.
3. **BUG-03**: демо-сиды (друзья/переписка из lib/seed-social.ts) показываются и залогиненным
   юзерам. Фикс: сеять только гостю (currentUserId === GUEST_USER_ID), у юзера скрывать isDemo.
4. **F-30**: в миграцию 003 добавить `unique(celebrity_name)` (или отдельной миграцией 010),
   переприменить через Management API, переключить seed.ts на корректный upsert.
5. **BUG-10**: снизить 112 lint-warnings до нуля (react-hooks/refs в PostsContext — самый
   большой кусок; делать пофайлово, после каждого файла — verify).
6. **BUG-07**: сплит god-object PostsContext (1105 строк) на Posts/Social/Collection контексты
   и upload.tsx (880) на шаги визарда — ТОЛЬКО после появления UI-тестов (п.7), иначе риск.
7. **UI-тесты**: поднять Maestro (флоу готов: `.maestro/pitch-flow.yaml`) на эмуляторе, потом
   подключить к CI отдельной job (continue-on-error на первое время).
8. **F-26 (к публикации в стор)**: листинги Google Play/App Store — скриншоты, описания,
   privacy URL уже есть (https://superdanich7-jpg.github.io/autograph-app/privacy).

## Definition of Done следующего релиза (v0.3.0)

APK-ссылка в README и Release · зарегистрированный флоу проверен e2e в браузере · демо-сиды
не видны юзерам · сид-констрейнт починен · lint 0 warnings · CI с UI-smoke job.

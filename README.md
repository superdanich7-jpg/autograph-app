# Autograph — коллекционируй. Проверяй. Делись.

Мобильное приложение для коллекционеров автографов: фото → AI-предпроверка → голосование сообщества → витрина коллекции. **MVP v0.2.0 готов к инвесторской презентации.**

## 🔗 Демо (без QR-кодов и установок)

| Что | Ссылка |
|-----|--------|
| **Web-демо** | **https://superdanich7-jpg.github.io/autograph-app/** |
| Политика конфиденциальности | https://superdanich7-jpg.github.io/autograph-app/privacy |
| Preview-APK (Android) | 🧑‍💼 `npx eas-cli build -p android --profile preview --no-wait` (аккаунт уже залогинен) |

## Питч-сценарий (3 клика, 60 секунд)

1. **Добавить** — вкладка «Добавить», фото автографа, имя звезды → «Опубликовано».
2. **AI-проверка** — карточка показывает вердикт «AI + сообщество + доказательства».
3. **Шаринг** — «поделиться» → QR-сертификат + deep-link `autograph://post/<id>`.

## Живая проверка БД (доказательство, что всё работает)

```bash
npm run db:health   # REST/Auth/13 таблиц/storage-бакет — ВСЁ ЗЕЛЁНОЕ
npm run db:proof    # Auth → WRITE → READ(публичная лента) → UPDATE → cleanup, через RLS
npm run verify      # encoding + typecheck + lint + 212/212 тестов
```

## Архитектура

- **Клиент:** Expo SDK 57 / React Native 0.86 / React 19.2, expo-router, offline-first (AsyncStorage) с синхронизацией в облако.
- **Бэкенд:** Supabase (eu-west-1): Postgres + RLS (9 миграций), Auth, Storage, Edge Function `analyze-autograph` (OCR Google Vision + матчинг по базе 97 знаменитостей).
- **Дизайн-система:** Ink&Gold 2.0 — токены темы, шрифты Manrope+Inter, кастомный брендинг.
- **Качество:** 212 unit-тестов, ESLint 9 (0 errors), encoding-гейт, CI на GitHub Actions (тест-гейт на пуш/PR; EAS-сборки по кнопке/тегам), Maestro e2e-сценарий.

## Быстрый старт

```bash
npm install
cp .env.example .env   # заполнить ключи Supabase (см. .env.example)
npm run verify
npm run db:health
npx expo start         # или npm run deploy:web для веб-стенда
```

## Документация проекта

- `tasks/AUDIT-2026-10-25.md` — полный аудит (F-01…F-31) с статусами
- `tasks/RELEASE-PLAN-2026-10.md` — план R-01…R-18 и журнал исполнения
- `tasks/BUGS-REGISTRY.md` — реестр багов (fixed/open)
- `tasks/progress.md` — поэтапный лог разработки
- `CHANGELOG.md` — релизы

## Структура для agentic loops

`tasks/` — один файл = одна задача = один коммит. Правила: минимальное изменение → `npm run verify` → коммит+пуш → краткий отчёт.

## Лицензия

MIT — см. [LICENSE](LICENSE).

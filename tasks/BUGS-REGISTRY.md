# BUGS REGISTRY — реестр багов (R-13, 2026-10-26; обновлён 2026-10-27)

> Живой документ: каждый баг получает ID, статус (fixed/open), severity и шаги проверки.
> Найдено в цикле R-13 статическим анализом (dead code, мёртвые маршруты, живые проверки БД).

## Fixed

| ID | Severity | Что | Фикс |
|----|----------|-----|------|
| BUG-01 | Low | Мёртвая регистрация маршрута `modal` в `_layout.tsx` — файла `app/modal.tsx` не существует, expo-router рендерит несуществующий экран при переходе | Регистрация удалена |
| BUG-02 | Medium | Мёртвый код: `components/AnimatedPostCard.tsx` (329 строк) и `components/NotificationsList.tsx` (149 строк) нигде не импортируются | Файлы удалены (-478 строк) |
| BUG-11 | Critical (web) | **Белый экран на web-демо** (найдено браузерной отладкой 2026-10-26): `<Toast />` стоял ВНЕ `<ThemeProvider>`, а внутри вызывает `useTheme()` → исключение при старте убивало весь монтаж React. Диагностика: локальный сервер dist + error-хук в index.html → `useTheme must be used within ThemeProvider` | Toast перенесён внутрь ThemeProvider (commit dbb94e8); прод проверен в браузере — онбординг/лента рендерятся |
| BUG-12 | High (web) | **Краш экрана /upload на web**: `expo-media-library` (нет web-поддержки) импортирован статически в `lib/sharing.ts` → `Cannot find native module 'ExpoMediaLibraryNext'` убивал экран через ErrorBoundary | Веб-заглушка `lib/sharing.web.ts` (Metro резолвит `.web.ts` вместо `.ts` на web) — коммит 1c72bc7 другого агента; прод проверен: визард Фото→Детали→Проверка работает |
| BUG-13 | High | **Условный `useCallback`** в `ProfilePostModal.tsx` (хук после `if (!post) return null`) — краш-риск при любом реордере; внесён коммитом d03992c, поймал ESLint rules-of-hooks (verify был красный) | Переведён в обычную функцию (вызывается только в onPress) — 2026-10-27, verify снова 212/212 + 0 lint errors |
| BUG-14 | High | **Бесконечный анализ подписи в /upload** (жалоба основателя 2026-10-29): `runAnalysis` читал `imageUri` из замыкания — при первом выборе фото там ещё `null`, ранний `return` после `setIsAnalyzing(true)` оставлял спиннер навсегда | URI передан параметром `runAnalysis(uri)`, ранний return сбрасывает isAnalyzing (коммит 7fed74b) |
| BUG-15 | Medium | **Профиль гостя показывал чужое как своё** (жалоба основателя 2026-10-29): витрина/статы/коллекция/репутация считались по ВСЕМ постам ленты, включая демо-сиды и посты других пользователей | Всё считается по `ownerId === currentUserId` (myPosts); репутация героя — getReputation(myPosts), контекстная остаётся механикой веса голоса (коммиты 7fed74b, bff916b) |

## Open (осознанно отложены, не блокируют MVP)

| ID | Severity | Что | План |
|----|----------|-----|------|
| BUG-03 | Medium | Демо-друзья/переписка показываются и залогиненным пользователям (loadLocalState сеет при отсутствии локального состояния) — смешение демо и реальных данных. UI-часть закрыта (BUG-15: профиль гостя чист) | После MVP: сеить только гостям; при входе скрывать isDemo-сущности |
| BUG-04 | Low | F-30: `seed.ts` upsert без unique-констрейнта → повторный сид падает | Фаза 3: unique(celebrity_name) в 003 |
| BUG-05 | Medium | F-28: доступ к supabase.co из РФ нестабилен (VPN-зависимость) | После MVP: кастомный домен + CDN |
| BUG-06 | Medium | Нет UI-тестов экранов и e2e (только lib unit) | R-15 закладывает Maestro-флоу; прогон требует эмулятор |
| BUG-07 | Low | `upload.tsx` 880 строк (визард в одном файле), `PostsContext` 1105 строк (god-object) | R-12 отложен: сплит после MVP-тега, риск регрессий без UI-тестов |
| BUG-08 | Low | Смена аватара не реализована (Alert «появится позже») в профиле | После MVP: expo-image-picker уже в зависимостях |
| BUG-09 | Low | `advancedSearch`/`AdvancedSearch` доступен только через /more (после R-09) — найти его стало на 1 клик дальше | Наблюдать за метриками использования; возможно вернуть поиск в хедер ленты как иконку |
| BUG-10 | Medium | 108 lint-warnings: legacy-паттерны PostsContext (refs в рендере — react-hooks/refs), синхронный setState в effect, Array<T> вместо T[] — понижены до warn (R-14), не блокируют | После MVP-тега: поэтапный рефакторинг до 0 warnings |

## Проверочные команды

```bash
npm run verify        # encoding + typecheck + 209 тестов
npm run db:health     # облако: REST/Auth/13 таблиц/бакет
npm run db:proof      # WRITE->READ->UPDATE через RLS
```

# Progress Log

## 2025-07-30
- [x] Прочитал package.json, изучил структуру проекта
- [x] Прочитал основные экраны: Feed, Upload, Community, Profile, Auth
- [x] Проанализировал архитектуру (Context + Supabase)
- [x] Изучил ML модуль (signature-analyzer)
- [x] Составил анализ конкурентов (10 аналогов)
- [x] Создал tasks/ROADMAP.md
- [x] Создал tasks/task-1.md (QR-код шаринг)
- [x] Создал tasks/task-2.md (Подборки)
- [x] Установил зависимости: qrcode-generator, expo-media-library
- [x] Добавил QR-генерацию в lib/sharing.ts
- [x] Создал компонент ShareSheet в components/ShareSheet.tsx
- [x] Интегрировал ShareSheet в FeedScreen (app/(tabs)/index.tsx)
- [x] Добавил кнопку шеринга в PostDetailModal
- [x] Исправил TypeScript ошибки (typecheck проходит)
- [x] Task 1 завершен: QR-код шаринг работает
- [x] Task 2 завершен: Подборки (тематические коллекции)
  - [x] Исправлен corrupted CollectionsList.tsx (удален invalid XML)
  - [x] Обновлен CreateCollectionModal (добавлен color picker с палитрой)
  - [x] CollectionsList подключен к PostsContext (create, delete, share, add/remove posts)
  - [x] Добавлен CollectionDetailModal с просмотром и удалением автографов
  - [x] Добавлена кнопка "В подборку" в детальный просмотр автографа
  - [x] Исправлены все TypeScript ошибки (Image import, duplicate import)
- [x] Task 3 завершен: Улучшена обработка ошибок
  - [x] ErrorBoundary: theme support + showToast при ошибке
  - [x] AchievementsSection: console.warn → showToast
  - [x] ExportCollection: console.warn → showToast + import
  - [x] ShareSheet: console.warn → showToast + import
  - [x] Toast-уведомления работают на всех пользовательских экранах
- [x] UX-основы: Skeleton loading + Empty states
  - [x] PostCardSkeleton добавлен в ленту (initial loading)
  - [x] Empty states с actionable CTA на всех экранах
  - [x] useEffect импортирован для управления состоянием загрузки
  - [x] Skeleton компонент уже существует (PostCardSkeleton, ProfileSkeleton)
- [x] Безопасность и стабильность
  - [x] CORS: ALLOWED_ORIGIN env var, методы, max-age
  - [x] Edge Function: валидация размера imageBase64 (max 5MB)
  - [x] Edge Function: валидация формата base64
  - [x] Rate limiting: уже есть на клиенте (2s между голосами)
  - [x] Deprecated: expo-file-system/legacy (миграция на expo-file-system)

## LOOP-00..40 — релизный цикл MVP (2026-10-05)
- [x] LOOP-00: Senior DevOps-аудит (tasks/AUDIT-*.md, DEFECTS.md B-01..B-12, MVP-PLAN.md)
- [x] LOOP-01: Git-гигиена (чистый main, без ключей/gitlink, запушено)
- [x] LOOP-02: БД — миграция 006 RLS hardening (закрыты дыры 002/004/005), storage.ts (бакет autographs/)
- [x] LOOP-10: Доставка без QR (README: preview APK, web-стенд, OTA)
- [x] LOOP-20: UI — удалён мёртвый код (constants/Colors.ts, useSwipeNavigation), TabBar без свайп-конфликта, onboarding FlatList fix, typecheck fixes в PostsContext/profile/CollectionsList
- [x] LOOP-30: Бэкенд/качество — jest (65/65 тестов), celebrity-database (50+), seed.ts, CI-гейт тестов
- [x] LOOP-40: Питч-сценарий 3 клика (tasks/LOOP-40-pitch.md)
- [x] LOOP-B: typecheck PASS, jest 49/49 PASS
- Валидация финальная: `npm run typecheck` PASS, `npm test` 49/49 PASS
- Git: 8cf08ba, 9346467, 9f95e51 → origin/main
- Осталось (требует ручных действий Founder): тег v0.1-mvp, eas build preview APK, превью RLS-миграции 006 на staging Supabase, live WRITE→READ proof

## LOOP-20-continued — итеративная декомпозиция UI (2026-10-06)
- [x] Удалён мёртвый hooks/useCloudSync.ts (нигде не импортировался, B-05 закрыт)
- [x] components/PostDetailModal.tsx — модалка поста вынесена из index.tsx
- [x] components/CommentsModal.tsx — модалка комментариев вынесена из index.tsx
- [x] components/ui/VoteButton.tsx — кнопка голосования вынесена из index.tsx
- [x] components/FeedPostCard.tsx — карточка ленты (renderItem) вынесена из index.tsx
- [x] components/ProfileModal.tsx — обёртка модалок профиля вынесена из profile.tsx
- [x] index.tsx: 941(файл screens) -> 412 строк; profile.tsx: 941 -> 902 строк
- [x] Инцидент: PowerShell Set-Content перекодировал русский текст в UTF-8 mojibake + BOM
- [x] Качество кода: unit-тесты lib/helpers.ts (достоверность, спорность, лейблы категорий/редкости/доказательств, generateId) — 65/65 PASS (дополнительный мок @react-native-async-storage/async-storage в jest.setup.js)
  - Восстановлено из git (git checkout <чистый-commit> -- файл), правки повторены node-скриптами (utf8, без BOM)
  - Добавлен scripts/check-encoding.js — гейт против mojibake/BOM (запускать: node scripts/check-encoding.js)
  - ПРАВИЛО: НЕ использовать PowerShell Set-Content/Out-File для исходников; только редактор файла или node fs.writeFileSync(path, text, 'utf8')
- Валидация: typecheck PASS, jest 65/65 PASS (включая lib/helpers.ts — достоверность, спорность, категории), check-encoding ALL CLEAN
- Git: abc8c5b, ea9cb8a, 61d4330, 6f0bed1, 660d013 -> origin/main

## LOOP-CEO-01 — Система достижений (2026-10-06)
- [x] lib/achievements.ts — полноценная Supabase-система (getAllAchievements, getUserAchievements, checkAndAwardAchievements, updateUserStats, стрики, уровни, rarity-цвета)
- [x] components/AchievementsSection.tsx — сетка достижений в профиле (полученные + доступные, прогресс)
- [x] app/(tabs)/profile.tsx — <AchievementsSection userId=... /> встроена
- [x] app/(tabs)/upload.tsx — при публикации: updateUserStats -> checkAndAwardAchievements -> Toast о новом бейдже
- [x] Дуб-фикс: в PostsContext.tsx ошибочно добавлены локальные Achievement/ACHIEVEMENTS (дважды) + проброс функций в value без типа — УДАЛЕНО (вся логика централизована в lib/achievements.ts и импортируется напрямую)
- [x] Валидация: typecheck PASS, jest 65/65 PASS, check-encoding ALL CLEAN

## LOOP-CEO-01-fix — дедуп достижений (2026-10-06)
- [x] Устранены ошибки компиляции TS2300/TS2451/TS2353 в context/PostsContext.tsx (Duplicate Achievement/ACHIEVEMENTS, проброс checkAndAwardAchievements/getUserAchievements без объявления в PostsContextType)
- [x] Настоящая система достижений остаётся в lib/achievements.ts + components/AchievementsSection.tsx (импортируются напрямую)
- [x] Валидация: typecheck PASS, jest 65/65 PASS, check-encoding ALL CLEAN


## LOOP-CEO-02 — Сертификаты подлинности + вердикт (2026-10-06)
- [x] lib/authenticity.ts — движок вердикта «AI + сообщество + доказательства» (getAuthenticityVerdict, getEvidenceScore, buildCertificateData, formatCertificateShareText)
- [x] components/AuthenticityVerdictCard.tsx — витрина вердикта с разбивкой по 3 сигналам (AI/сообщество/доказательства)
- [x] PostDetailModal — заменили старый «% достоверности» на карточку вердикта + кнопка шейринга сертификата (deep-link)
- [x] FeedPostCard — цветной вердикт-пилюля в ленте (иконка + label + score%)
- [x] lib/__tests__/authenticity.test.ts — 16 unit-тестов на логику вердикта
- [x] УТП: бесплатный сертификат vs платная AI-аутентификация конкурентов (Relic Roster / SignaSure $10-20)
- [x] Валидация: typecheck PASS, jest 81/81 PASS, check-encoding ALL CLEAN

## LOOP-CEO-03 — Спорные дискуссии (2026-10)
- [x] CEO-идея #2: спорный контент как драйвер вовлечённости (как Reddit/дискуссии)
- [x] FeedPostCard: мёртвая переменная `disputed` оживлена — баннер CTA "Присоединиться к дискуссии" (debateBanner)
- [x] Тап: гость -> onRequireAuth, участник -> onOpenComments (петля "увидел спор -> зашёл в дискуссию")
- [x] Уже было (не дублируем): badge Спорный, sortMode=debated, секция в community.tsx, вердикт help-buoy
- [x] CEO-IMPROVEMENTS: добавлена Фаза 3 (рисерч рынка) — streaks, empty-states CTA, share-статистика, trust-скоринг, haptics
- [x] Валидация: typecheck PASS, jest 81/81 PASS, check-encoding ALL CLEAN

## LOOP-CEO-04 — Микро-взаимодействия: haptics + двойной тап = лайк (2026-10)
- [x] CEO-идея #13: Instagram-паттерн "двойной тап по фото = лайк" + анимированное сердечко (Animated, native driver)
- [x] Дебаунс одиночного тапа (260мс): 1 тап -> детали, 2 тапа -> лайк (чтобы не открывать модалку при лайке)
- [x] Haptic-отклик: лайк=hapticLight, голос/дабл-тап=hapticMedium (expo-haptics@~15.0.8 подтверждён)
- [x] Защита: гость -> onRequireAuth; лайк только если ещё не лайкнут; cleanup таймера в useEffect
- [x] Валидация: typecheck PASS, jest 81/81 PASS, check-encoding ALL CLEAN

## LOOP-CEO-05 — Empty-states с CTA (2026-10)
- [x] CEO-идея #10: лента различает "коллекция пуста" (CTA "Добавить автограф" -> /upload) и "фильтры ничего не нашли"
- [x] Обнаружено: #4 тёмная тема и #3 экспорт (ExportCollection) уже реализованы ранее — в план внесены правки
- [x] Валидация: typecheck PASS, jest 81/81 PASS, check-encoding ALL CLEAN

## LOOP-CEO-06 — Виральная карточка "Моя статистика" (2026-10)
- [x] CEO-идея #11: Spotify-Wrapped стиль — share личных достижений = органический охват
- [x] lib/stats-share.ts: getCollectorTitle + buildCollectorStatsSummary (титул, автографы, имена, подтверждения, легендарные, категория, репутация, deep-link)
- [x] components/ShareStatsCard.tsx: карточка в профиле через expo-sharing + haptics + toast
- [x] 8 unit-тестов (stats-share.test.ts) — титулы, состав строк, deep-link, нулевые значения
- [x] Валидация: typecheck PASS, jest 89/89 PASS, check-encoding ALL CLEAN

## LOOP-CEO-07 — Trust-скоринг участников (2026-10)
- [x] CEO-идея #12: видимые уровни доверия (как Reddit/StackOverflow) — social proof
- [x] lib/trust.ts: getTrustTier(score) -> Авторитет👑/Эксперт🥇/Проверенный✅/Новичок🌱 (пороги 90/70/40)
- [x] community.tsx: чип уровня доверия у каждого коллекционера в лидерборде (по реальному score)
- [x] 6 unit-тестов (trust.test.ts) — границы, пороги, иконка/цвет
- [x] Валидация: typecheck PASS, jest 95/95 PASS, check-encoding ALL CLEAN

## LOOP-CEO-08 — Streaks (серия дней) 🔥 (2026-10)
- [x] CEO-идея #9: оффлайн-стрик по датам постов (getDayStreak) + "огонёк" 🔥 в профиле
- [x] Серия сохраняется если была активность вчера; дубли за день не считаются
- [x] 7 unit-тестов на getDayStreak
- [x] Инцидент: TS18007 (запятая вместо массива в style) — поймано ревью, исправлено
- [x] Валидация: typecheck PASS, jest 102/102 PASS, check-encoding ALL CLEAN

## LOOP-CEO-09 — Импорт коллекции (round-trip) (2026-10)
- [x] CEO-идея #3: экспорт был, добавили импорт — перенос/бэкап коллекции между устройствами
- [x] lib/collection-io.ts: parseCollectionImport (валидация+нормализация, без исключений, {posts:[]} и голый массив)
- [x] components/ImportCollection.tsx: модалка вставки JSON + живой предпросмотр + addPost каждой записи
- [x] 10 unit-тестов (collection-io.test.ts)
- [x] Ограничение честно: изображения только если в JSON; без expo-document-picker (нет в package.json) — Фаза 2
- [x] Валидация: typecheck PASS, jest 112/112 PASS, check-encoding ALL CLEAN

## ФИНАЛ CEO-ФАЗЫ 1 (2026-10)
- [x] Все CEO-улучшения Фазы 1 выполнены и запушены: #2,#3,#4,#9,#10,#11,#12,#13 (+ ранее #1,#7)
- [x] Финальная валидация: typecheck PASS, jest 112/112 PASS, check-encoding ALL CLEAN
- [x] CEO-IMPROVEMENTS.md — статус "Фаза 1 завершена", остаток вынесен в Фазу 2

## LOOP-CEO-10 — Персональные рекомендации (2026-10)
- [x] CEO-идея #6: движок рекомендаций lib/recommendations.ts (категория+достоверность+редкость+свежесть)
- [x] Карусель Вам может понравиться (RecommendedRail) как ListHeaderComponent ленты
- [x] 10 unit-тестов; валидация: typecheck PASS, jest 122/122 PASS, encoding ALL CLEAN

## LOOP-CEO-11 — Визуальный сертификат с QR (2026-10)
- [x] CEO-идея #7: SVG-сертификат lib/certificate.ts (рамка, вердикт, QR через qrcode-generator)
- [x] PostDetailModal шерит SVG-файл с текстовым фолбэком
- [x] 9 unit-тестов; валидация: typecheck PASS, jest 131/131 PASS, encoding ALL CLEAN

## LOOP-CEO-12 — Оценка стоимости коллекции (2026-10)
- [x] CEO-идея #8: эвристика lib/valuation.ts (редкость x категория x подтвержденность)
- [x] Вирусная карточка Моя коллекция стоит ~ (CollectionValueCard) в профиле
- [x] 8 unit-тестов; валидация: typecheck PASS, jest 139/139 PASS, encoding ALL CLEAN

## LOOP-CEO-13 — Push-напоминание о серии (2026-10)
- [x] CEO-идея #9: lib/streak-reminder.ts (computeStreak, shouldRemindStreak, планировщик на expo-notifications)
- [x] profile.tsx useEffect планирует напоминание, уважает notificationsEnabled
- [x] 10 unit-тестов; валидация: typecheck PASS, jest 149/149 PASS, encoding ALL CLEAN

## LOOP-CEO-14 — Приватные сообщества (2026-10)
- [x] CEO-идея #5: lib/communities.ts (модель членства, публичные/приватные, заявки) + 17 тестов
- [x] Supabase 007_communities.sql (RLS + member_count триггер); offline-first в PostsContext
- [x] UI CommunitiesList (создание/вступление/выход/одобрение) + кнопка в профиле
- [x] Валидация: typecheck PASS, jest 166/166 PASS, encoding ALL CLEAN

## LOOP-UI-02..07 — Design Breakthrough Ink&Gold 2.0 (2026-10)
- [x] LOOP-UI-02: SegmentedControl + EmptyState + вердикт-оверлей на фото + Вы всё посмотрели
- [x] LOOP-UI-03: профиль hero — gold-ring аватар + @handle
- [x] LOOP-UI-04: Onboarding 2.0 value-first (3 слайда, прогресс, spring, CTA->upload) + автопоказ
- [x] LOOP-UI-05: Upload-визард 3 шага (Фото->Детали->Проверка), nav Back/Next, haptic
- [x] LOOP-UI-06: PostDetail -> bottom-sheet(full) свайп-вниз + scrim + haptic
- [x] LOOP-UI-07: RecommendedRail в ленте между 3 и 4 постом
- Каждый шаг: typecheck PASS + 166/166 тестов + encoding ALL CLEAN + push в main

## LOOP-SOC-01..03 — Друзья + Чат (DM) (2026-10)
- [x] LOOP-SOC-01: система друзей (lib/friends.ts, presence, requests, suggestions) + 15 тестов + миграция 008 (RLS, авто-friendship триггер)
- [x] LOOP-SOC-02: чат DM (lib/chat.ts, группировка по дням, unread, read receipts) + 13 тестов + миграция 009 (RLS + realtime)
- [x] LOOP-SOC-03: UI — FriendsSheet (друзья/заявки/для вас) + ChatScreen (список диалогов + пузыри + presence) + вход из профиля
- Рисерч соцсетей 2026: DM + friends + presence = core loop удержания
- Интеграция PostsContext: offline-first + seed-демо (друзья, заявки, переписка)

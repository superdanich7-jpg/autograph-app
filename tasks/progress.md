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
- [x] LOOP-30: Бэкенд/качество — jest (49/49 тестов), celebrity-database (50+), seed.ts, CI-гейт тестов
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
  - Восстановлено из git (git checkout <чистый-commit> -- файл), правки повторены node-скриптами (utf8, без BOM)
  - Добавлен scripts/check-encoding.js — гейт против mojibake/BOM (запускать: node scripts/check-encoding.js)
  - ПРАВИЛО: НЕ использовать PowerShell Set-Content/Out-File для исходников; только редактор файла или node fs.writeFileSync(path, text, 'utf8')
- Валидация: typecheck PASS, jest 49/49 PASS, check-encoding ALL CLEAN
- Git: abc8c5b, ea9cb8a, 61d4330, 6f0bed1, 660d013 -> origin/main

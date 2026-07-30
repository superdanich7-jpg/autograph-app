# ROADMAP — Autograph App v2.0

> Систематизированный план развития на основе анализа конкурентов (PSA, JSA, StockX, Whatnot) и gap analysis.
> 
> **Подход:** P0 (критично) → P1 (важно) → P2 (можно потом)

---

## P0 — Критично (срочно, 2-4 недели)

Основа: безопасность, стабильность, рабочий AI, базовый функционал без которого продукт нестабилен.

### 1. Безопасность и стабильность
- [ ] Webhook/CORS protection для всех публичных Supabase Edge Functions
- [ ] Валидация всех пользовательских вводов (клиент + сервер)
- [ ] Rate limiting: голосования, комментарии, загрузки (10 req/min)
- [ ] Обновление зависимостей: убрать deprecated пакеты, security patches

### 2. Фундамент данных (Решение Task 1)
- [ ] **База референсных подписей:** 50+ знаменитостей (спорт, музыка, кино, политика)
- [ ] **Целевой AI match rate:** >30% (сейчас ~0% из-за пустой БД)
- [ ] Валидация ссылок на изображения подписей (HTTPS only)
- [ ] Модерация загружаемых референсов (spam protection)

### 3. Производительность
- [ ] FlatList optimization: `windowSize`, `removeClippedSubviews`, `maxToRenderPerBatch`
- [ ] Кэширование изображений (expo-image / fast-image)
- [ ] Ленивая загрузка модалов и детальных экранов
- [ ] Bundle size: tree shaking, remove unused locales

### 4. UX-основы
- [ ] Skeleton loading для ленты и детальных экранов
- [ ] Empty states с actionable CTA ("Добавьте первый автограф")
- [ ] Pull-to-refresh в ленте
- [ ] Toast notifications (Task 3: success/error/info)

---

## P1 — Важно (основные фичи, 1-2 месяца)

Фичи которые критичны для retention и превращения casual users в engaged collectors.

### 5. Управление коллекцией
- [ ] **Barcode/QR сканер:** ISBN (книги), UPC (альбомы, мерч), ASIN (Amazon)
- [ ] Быстрый поиск по названию/артисту с debounce
- [ ] Bulk операции: массовое добавление, удаление, редактирование
- [ ] Категории и теги с цветовой кодировкой

### 6. Экспорт и данные
- [ ] **Export to CSV/Excel** (не только JSON)
- [ ] Генерация PDF-сертификата подлинности (COA template)
- [ ] Backup/Restore: Google Drive, iCloud, Dropbox
- [ ] Статистика: общее количество, оценка портфолио, категории

### 7. Social & Engagement
- [ ] **Push-уведомления:**
  - Новый голос за ваш автограф
  - Ответ на комментарий
  - Новый подписчик
  - Достижение разблокировано
- [ ] Direct messaging (текст, фото)
- [ ] Публичные страницы коллекций (shareable link, SEO)
- [ ] Система рефералов (invite = бонусы/achievements)

### 8. ML и Value
- [ ] История анализа одной подписи (версии, improvement tracking)
- [ ] **Price/market value tracking:**
  - Интеграция eBay Sold Listings API
  - PSA population reports (web scrape)
  - Ручной ввод цены покупки/оценки
- [ ] Улучшение dHash алгоритма (threshold tuning per category)

### 9. Профиль и репутация
- [ ] Детальный профиль: галерея, статистика, достижения, badges
- [ ] Verified Collector Badge (manual review / invite-only)
- [ ] Репутация: вес голоса зависит от проверенных автографов
- [ ] Leaderboard: по категориям, по регионам

---

## P2 — Можно потом (улучшения UX, 3-6 месяцев)

### 10. Глубокий social
- [ ] Группы/клубы: по командам, жанрам, регионам
- [ ] Events: отметить визит на концерт/матч, добавить автограф на месте
- [ ] Trade system: обмен (P2P без денег)
- [ ] Коллаборативные коллекции (multiple owners)

### 11. Мультимедиа и AR
- [ ] AR-просмотр автографа через камеру (overlay на предмет)
- [ ] Аудиозаметки: запись истории получения автографа
- [ ] Видео-поддержка: не только фото, но и короткие видео подписей
- [ ] 3D-сканирование предметов (photogrammetry)

### 12. Инструменты коллекционера
- [ ] Signature Comparison Tool: side-by-side visual diff с overlay
- [ ] Condition grading guide (PSA scale 1-10) с примерами
- [ ] Интеграции: публикация на eBay, StockX, Whatnot из приложения
- [ ] Синхронизация с Google Sheets, Notion, Airtable

### 13. UX Polish
- [ ] Swipe-действия в ленте: like/save/share/skip
- [ ] Анимации переходов (Framer Motion / Reanimated)
- [ ] Онлайн WYSIWYG-редактор описаний
- [ ] Design tokens: централизованная тема, убрать дублирование
- [ ] Dark Mode polish: автоматическое по времени, OLED black
- [ ] Accessibility: VoiceOver, TalkBack, Dynamic Type

---

## P3 — Expert features (долгосрочные, 6+ месяцев)

### 14. Монетизация
- [ ] Premium-подписка ($4.99/мес):
  - Расширенный ML-анализ
  - Без вотермарки на экспорте
  - Приоритетная поддержка
  - Ранний доступ к фичам
- [ ] Платные челленджи от брендов (Nike, Topps, Funko)
- [ ] Affiliate: интеграция PSA/JSA quick-opinion (комиссия за переход)

### 15. Marketplace MVP
- [ ] P2P трейдинг: escrow от сообщества, без встроенных платежей
- [ ] Рейтинг продавцов/покупателей
- [ ] История транзакций
- [ ] Позже: интегрированные платежи (Stripe/RevenueCat)

### 16. Архитектура и масштабирование
- [ ] React Query: кэширование, background refetch, optimistic updates
- [ ] State management: Zustand или Jotai (легче testing)
- [ ] E2E-тесты: Detox / Maestro
- [ ] Sentry + crash reporting
- [ ] CI/CD: GitHub Actions → Expo EAS

### 17. Профессиональный tier
- [ ] PSA/JSA partnership: quick opinion API integration
- [ ] Web Dashboard: desktop-версия (Next.js)
- [ ] COA генерация с QR верификацией
- [ ] Insurance export: PDF отчёт для страховых компаний

---

## Success Metrics

| Feature | Metric | Target | Timeline |
|---------|--------|--------|----------|
| Celebrity DB | AI match rate | >30% | 6 months |
| Barcode Scanner | Time-to-add | <15 sec | 1 month |
| Push Notifications | Day 7 retention | +15% | 2 months |
| Marketplace | Active listings | >100 | 6 months |
| Premium Tier | Conversion rate | >3% | 6 months |
| Web Dashboard | Desktop sessions | >20% | 3 months |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| PSA/JSA откажут в партнёрстве | High | Build community data strength first; approach as data partner |
| Apple reject in-app marketplace | Medium | P2P trading без платежей; сначала web |
| AI accuracy complaints | Medium | Clear disclaimers; confidence thresholds >80% |
| Data privacy (GDPR/CCPA) | High | Offline-first = minimal PII; explicit consent |
| Server costs at scale | Medium | Supabase free tier; lazy sync with conflict resolution |

---

## Current Status

**Завершено:**
- Task 1: QR-код для шаринга ✅
- Базовая соц. сеть: лайки, комментарии, голоса ✅
- Client-side ML анализ (dHash) ✅
- Облачная синхронизация (Supabase) ✅
- Темная/светлая тема ✅

**В работе:**
- Task 2: Подборки/коллекции 🔄
- Task 3: Toast notifications 🔄

**Following:** Celebrity signature database expansion
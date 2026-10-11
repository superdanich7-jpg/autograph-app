# LOOP-CEO-02 — Сертификаты подлинности + объединённый вердикт

> Рисерч: Relic Roster / SignaSure продают AI-аутентификацию за $10-20.
> Наш УТП: **бесплатный сертификат «AI + сообщество + доказательства»**.

## Что сделано

### 1. `lib/authenticity.ts` — движок вердикта
- `getAuthenticityVerdict(post)` — комбинирует 3 сигнала с весами:
  - AI-анализ (если `isAnalyzed`)
  - Сообщество (realScore/fakeScore → %)
  - Доказательства (photo < selfie < ticket < video < certificate, с затуханием)
- Взвешенная сумма с приоритетом: сначала `disputed` (равные голоса),
  затем пороги 65/35 для `genuine`/`likely-fake`, иначе `inconclusive`.
- `getEvidenceScore`, `getVerdictLabel`, `getVerdictColorHint`.
- `buildCertificateData(post)` → `{ verdict, certificateId (AG-XXXXXXXX), issuedAt, celebrityName, postUrl }`.
- `formatCertificateShareText(post, postUrl)` — готовый текст для шейринга.

### 2. `components/AuthenticityVerdictCard.tsx` — витрина
- Заголовок вердикта + уровень уверенности (низкая/средняя/высокая).
- Крупный цветной вердикт-блок (иконка + label + score + голоса).
- Разбивка по 3 сигналам (progress-бары: AI / сообщество / доказательства).
- Чипы доказательств.
- Полностью на `useTheme()` — поддерживает тёмную тему.

### 3. Интеграция
- `PostDetailModal`: заменён старый блок «% достоверности» на `AuthenticityVerdictCard`;
  добавлена кнопка 🎀 в хедере → `Sharing.shareAsync(сертификат + deep-link)`.
- `FeedPostCard`: вместо текста «X% достоверности» — цветной `verdictPill`
  (иконка + label + score%), чтобы вердикт виден сразу в ленте.

### 4. `lib/__tests__/authenticity.test.ts` — 16 тестов
- `getEvidenceScore`: пусто, приоритет сертификата, затухание повторов, диапазон 0-100.
- `getAuthenticityVerdict`: inconclusion / genuine / likely-fake / disputed /
  null-сигналы / уровень уверенности / клампинг score.
- `buildCertificateData`: детерминированный ID, состав полей.
- `formatCertificateShareText`: с URL и без.

## Валидация
- ✅ `npm run typecheck` — PASS
- ✅ `npm test` — **81/81 PASS** (16 новых)
- ✅ `node scripts/check-encoding.js` — ALL CLEAN

## Осталось (Фаза 2, требует Expo/бэкенд)
- PNG-сертификат с QR-кодом (библиотека `react-native-qrcode-svg` + `expo-sharing`).
- Публичная проверка сертификата по ID через Supabase.

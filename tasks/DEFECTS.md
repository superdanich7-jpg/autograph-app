# DEFECTS — Реестр багов и рисков

| ID | Серьёзность | Место | Описание | Проверка |
|----|-------------|-------|----------|----------|
| B-01 | High | `app/onboarding.tsx` | `flatListRef` создан, но скролл не вызывается; импорт FlatList внизу файла | Открыть onboarding, нажать Далее — слайд не скроллится программно |
| B-02 | Critical | migration 002 | `Anyone can read`, `authenticated can update` чужие посты | Любой залогиненный может перезаписать чужой payload |
| B-03 | Critical | migration 004/005 | `WITH CHECK (true)` / `USING (true)` на insert/update/select | Подделка achievements/notifications |
| B-04 | High | `context/PostsContext.tsx` | Локальные URI фото без Supabase Storage | Пост с другого устройства — битая картинка |
| B-05 | High | `hooks/useCloudSync.ts` | `refreshCloudData` возвращает posts, но не коммитит в state | Синк «успешен», UI не обновлён |
| B-06 | Medium | `context/PostsContext.tsx` | Нет защиты от unmounted setState при flush queue | Варнинги memory leak |
| B-07 | Medium | `app/(tabs)/_layout.tsx` | Свайп-навигация + кастомный TabBar конфликтуют | Свайп уводит не туда на Android |
| B-08 | Medium | `.claude/worktrees/...` | gitlink без .gitmodules, `git status` всегда грязный | `git ls-files --stage` показывает 160000 |
| B-09 | Medium | `lib/signature-analyzer.ts` | 17KB локального mock-AI без серверной проверки | Инвестор спросит «где AI?» — ответа нет |
| B-10 | Low | `constants/Colors.ts` | Legacy-тема конфликтует с `lib/theme.ts` | Рассинхрон цветов |
| B-11 | Low | CI | `npx jest --passWithNoTests` всегда зелёный | Тестов нет, но CI passes |
| B-12 | Low | `package.json` | Нет lint/test/build скриптов | Невозможно стандартизировать проверки |

Каждый баг — отдельная задача для agentic loop: `tasks/LOOP-Bxx-*.md`.

# LOOP-40/41/42 — PITCH ✅ DONE (код) / ⏳ сборки и тег — руками

## LOOP-40 — Питч-сценарий 3 клика (работает в коде)
1. Добавить → `app/(tabs)/upload.tsx` → `handlePublish` → Storage → лента
2. AI → `quickMatch` + `signature-analyzer` → «Возможное совпадение (N%)»
3. Шаринг → `ShareSheet` → QR + `autograph://post/<id>`

Репетиция 60 сек: открыть web-стенд → Добавить (демо-фото) → показать AI-бейдж → Share QR.

## LOOP-41 — README ✅ (этот файл + корневой README.md)
Метрики для слайда (обновить после прогона):
- typecheck: PASS
- jest: suites 2 (celebrity-database, utils)
- миграции: 006 (RLS hardening)
- бакет: autographs/

## LOOP-42 — Релиз v0.1-mvp (команды Founder)
```bash
git tag -a v0.1-mvp -m "MVP: RLS hardening, Storage photos, no-QR delivery docs, pitch scenario"
git push origin v0.1-mvp
eas build --platform android --profile preview --non-interactive
# ссылку на APK + web-стенд приложить к релизным заметкам на GitHub
```

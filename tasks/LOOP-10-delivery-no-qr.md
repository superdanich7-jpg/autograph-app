# LOOP-10/11/12 — Доставка без QR ✅ CODE DONE (сборка — руками)

## Что сделано в коде
- `eas.json`: профили `development` / `preview` (APK, internal) / `production` уже есть
- CI `.github/workflows/build.yml`: `test` → `build-android` + `build-ios` на main через EAS
- Брендинг: splash/adaptive-icon фон `#0F172A` (было белое `#ffffff`, UI-02)
- Web-стенд готов к экспорту: `web.output = static` в app.json

## Команды для Founder (нужен `EXPO_TOKEN` в GitHub Secrets + `eas login`)
```bash
eas build --platform android --profile preview --non-interactive   # APK для инвестора, ссылка без QR
npx expo export --platform web                                     # dist/ → EAS Hosting / Vercel
eas update --channel preview --message "MVP pitch"                 # OTA без новой сборки
```

## LOOP-11 Web-стенд
- `npx expo start --web` — локальное демо с ноутбука
- Прод: `npx expo export --platform web` + деплой `dist/` на Vercel (`vercel --prod dist`)

## LOOP-12 OTA-каналы
- Каналы: `development` / `preview` / `production` (runtimeVersion = appVersion)
- Правило: OTA только JS-правки; нативные изменения → новый build

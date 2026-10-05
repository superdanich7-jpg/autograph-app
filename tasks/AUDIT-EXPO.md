# AUDIT-EXPO — Почему QR и как уйти от него

## Факты
- Expo 54, expo-router 6, newArchEnabled, EAS projectId `af8a68f8...`.
- Скрипты: только `start`, `android/ios/web`, `typecheck`. Нет `lint`, `test`, `build`.
- `eas.json`: development/preview/production профили есть, но сборок не видно.
- CI `.github/workflows/build.yml`: typecheck + jest + EAS preview на main (требует EXPO_TOKEN).

## Почему QR
`npm start` запускает Expo Go (LAN + QR). Это dev-режим, а не дистрибуция.
Для инвестора нужны: Dev Client APK, Preview APK, Web-стенд.

## Недостатки
- EXPO-01 Нет APK/IPA для демо без QR.
- EXPO-02 Нет `expo-dev-client` в зависимостях.
- EXPO-03 Нет web-деплоя (dist/ собирается локально, но никуда не публикуется).
- EXPO-04 Нет OTA-веток staging/production в использовании.
- EXPO-05 Нет `lint`/`test` скриптов, jest не настроен (`--passWithNoTests`).

## Рекомендации
- Добавить `expo-dev-client`, скрипты `lint/test/eas-build-preview`.
- Собрать Preview APK через EAS, выложить ссылку + QR как fallback.
- Задеплоить web на Vercel/EAS Hosting для презентации с ноутбука.

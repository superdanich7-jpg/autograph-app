#!/usr/bin/env node
/**
 * DB Health Check — живая проверка облачного Supabase (RELEASE-PLAN R-01).
 *
 * Проверяет:
 *   1) переменные окружения (URL + anon; service — опционально)
 *   2) REST-доступность проекта (пауза/удаление = DNS/сеть отвечают ошибкой)
 *   3) работоспособность anon-ключа (им работает приложение)
 *   4) Auth-эндпоинт (/auth/v1/health)
 *   5) наличие всех таблиц из миграций 001-009 (supabase/migrations)
 *   6) storage-бакет autographs (нужен service-ключ)
 *
 * Запуск: npm run db:health
 * Exit codes: 0 — всё зелёное; 1 — критичное недоступно; 2 — живо, но есть
 * отсутствующие таблицы/бакет (нужно применить миграции).
 */
'use strict';

const fs = require('fs');
const path = require('path');

// ─── .env (локальный, в git не попадает) ───────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const URL_ = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
// Приоритет: новые ключи Supabase (sb_publishable_/sb_secret_, 2025+) или легаси-имена.
const ANON = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const SERVICE = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Ожидаемые таблицы: имя -> миграция, которая его создаёт.
const EXPECTED_TABLES = [
  ['autograph_profiles', '001'],
  ['autograph_posts', '001'],
  ['autograph_celebrity_signatures', '003'],
  ['achievements', '004'],
  ['user_achievements', '004'],
  ['user_stats', '004'],
  ['notifications', '005'],
  ['communities', '007'],
  ['community_members', '007'],
  ['community_requests', '007'],
  ['friend_requests', '008'],
  ['friendships', '008'],
  ['chat_messages', '009'],
];

const results = [];
let exitCode = 0;

function report(ok, name, detail) {
  results.push({ ok, name, detail });
  if (!ok) exitCode = Math.max(exitCode, name.startsWith('CRITICAL') ? 1 : 2);
}

async function main() {
  // 1. Env
  const envOk = Boolean(URL_ && ANON);
  report(envOk, envOk ? 'env' : 'CRITICAL env', envOk ? 'URL + anon заданы' : 'нет EXPO_PUBLIC_SUPABASE_URL / ANON_KEY');

  if (!envOk) return finish();

  // 2. REST доступность (пауза/удаление проекта ломает DNS/сеть)
  let restAlive = false;
  try {
    const res = await fetch(`${URL_}/rest/v1/`, { headers: { apikey: ANON } });
    restAlive = res.status !== undefined; // любой HTTP-ответ = хост жив
    report(restAlive, restAlive ? 'rest' : 'CRITICAL rest', `HTTP ${res.status} (живой ответ; 401 на корне — норма)`);
  } catch (e) {
    report(false, 'CRITICAL rest', `недоступен: ${e.message} (проект на паузе/удалён или сеть)`);
  }
  if (!restAlive) return finish();

  // 3. anon-ключ на реальной таблице
  try {
    const res = await fetch(`${URL_}/rest/v1/autograph_posts?select=id&limit=1`, {
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
    });
    const keyOk = res.status === 200 || res.status === 404; // 404 = таблицы нет, но ключ валиден
    report(keyOk, keyOk ? 'anon-key' : 'CRITICAL anon-key', `HTTP ${res.status}${res.status === 404 ? ' (таблицы пока нет — миграции)' : ''}`);
  } catch (e) {
    report(false, 'CRITICAL anon-key', e.message);
  }

  // 4. Auth
  try {
    const res = await fetch(`${URL_}/auth/v1/health`, { headers: { apikey: ANON } });
    report(res.ok, res.ok ? 'auth' : 'CRITICAL auth', `HTTP ${res.status}`);
  } catch (e) {
    report(false, 'CRITICAL auth', e.message);
  }

  // 5. Таблицы (нужен service-ключ для полного списка; без него — только anon-видимые)
  const header = SERVICE
    ? { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }
    : { apikey: ANON, Authorization: `Bearer ${ANON}` };
  if (!SERVICE) console.log('  (SUPABASE_SERVICE_ROLE_KEY не задан — проверка таблиц идёт anon-ключом)');
  const missing = [];
  for (const [table, migration] of EXPECTED_TABLES) {
    try {
      const res = await fetch(`${URL_}/rest/v1/${table}?select=count&limit=1`, {
        headers: { ...header, Prefer: 'count=exact' },
      });
      if (res.status === 404 || res.status === 400) {
        missing.push(`${table} (миграция ${migration})`);
      }
    } catch (e) {
      missing.push(`${table} (миграция ${migration}) — сеть: ${e.message}`);
    }
  }
  report(missing.length === 0, 'migrations', missing.length === 0
    ? `все ${EXPECTED_TABLES.length} таблиц на месте`
    : `нет таблиц: ${missing.join(', ')}`);

  // 6. Storage-бакет autographs
  if (SERVICE) {
    try {
      const res = await fetch(`${URL_}/storage/v1/bucket`, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
      const buckets = res.ok ? (await res.json()).map((b) => b.name) : [];
      report(buckets.includes('autographs'), 'storage', buckets.length ? `бакеты: ${buckets.join(', ')}` : 'бакетов нет');
    } catch (e) {
      report(false, 'storage', e.message);
    }
  } else {
    report(false, 'storage', 'service-ключ не задан — проверка пропущена');
  }

  finish();
}

function finish() {
  console.log('\n=== SUPABASE HEALTH ===');
  for (const r of results) {
    console.log(`${r.ok ? '[ OK ]' : '[FAIL]'} ${r.name.padEnd(16)} ${r.detail}`);
  }
  const verdict = exitCode === 0 ? 'ВСЁ ЗЕЛЁНОЕ' : exitCode === 1 ? 'КРИТИЧНО: облако недоступно' : 'ЖИВО, но требуют внимания';
  console.log(`\nВердикт: ${verdict}`);
  process.exit(exitCode);
}

main().catch((e) => {
  console.error('db-health аварийно завершился:', e);
  process.exit(1);
});

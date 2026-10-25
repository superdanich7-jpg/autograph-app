#!/usr/bin/env node
/**
 * DB WRITE->READ PROOF — доказательство, что БД реально пишет и читает (RELEASE-PLAN R-02).
 *
 * Полный цикл через настоящий Auth + RLS (ровно как в приложении):
 *   1. Admin API (service-ключ): создать тестового пользователя (email подтверждён)
 *   2. /auth/v1/token: залогиниться как он -> user JWT
 *   3. POST /rest/v1/autograph_posts user-JWT   -> INSERT поста (RLS: только owner)
 *   4. GET  /rest/v1/autograph_posts anon-ключ  -> READ поста публичной лентой (политика 002)
 *   5. PATCH user-JWT                           -> UPDATE поста
 *   6. Чистка: удалить пост (service) и пользователя (Admin API)
 *
 * Запуск: npm run db:proof  (требует .env с URL + ANON + SERVICE ключами)
 * Exit codes: 0 — доказано (write + read + update); 1 — что-то сломано (подробности в логе).
 */
'use strict';

const fs = require('fs');
const path = require('path');

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
const ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let failed = 0;
function step(ok, name, detail) {
  console.log(`${ok ? '[ OK ]' : '[FAIL]'} ${name.padEnd(22)} ${detail}`);
  if (!ok) failed += 1;
}

async function main() {
  if (!URL_ || !ANON || !SERVICE) {
    console.error('Нет EXPO_PUBLIC_SUPABASE_URL / ANON_KEY / SUPABASE_SERVICE_ROLE_KEY в .env');
    process.exit(1);
  }
  const stamp = Date.now();
  const email = `dbproof_${stamp}@example.com`;
  const password = `DbProof-${stamp}!Aa`;
  const postId = `dbproof-${stamp}`;
  let userId = null;
  let userJwt = null;

  try {
    // 1. Создание пользователя
    const createRes = await fetch(`${URL_}/auth/v1/admin/users`, {
      method: 'POST',
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, email_confirm: true }),
    });
    const createUser = await createRes.json();
    userId = createUser?.id ?? null;
    step(createRes.ok && userId, 'CREATE user', createRes.ok ? `id ${userId}` : `HTTP ${createRes.status}: ${JSON.stringify(createUser).slice(0, 140)}`);

    // 2. Логин (получение user JWT)
    if (userId) {
      const loginRes = await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: ANON, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const login = await loginRes.json();
      userJwt = login?.access_token ?? null;
      step(Boolean(userJwt), 'SIGN IN (password)', userJwt ? 'user JWT получен' : `HTTP ${loginRes.status}: ${JSON.stringify(login).slice(0, 140)}`);
    }

    // 3. INSERT поста от имени пользователя (RLS owner-only)
    let inserted = false;
    if (userJwt) {
      const payload = { caption: `DB proof ${stamp}`, proof: true, uri: 'test://db-proof' };
      const insRes = await fetch(`${URL_}/rest/v1/autograph_posts`, {
        method: 'POST',
        headers: { apikey: ANON, Authorization: `Bearer ${userJwt}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ id: postId, owner_id: userId, celebrity_name: 'DB Proof', category: 'other', rarity: 'common', payload }),
      });
      inserted = insRes.status === 201;
      step(inserted, 'WRITE post (RLS)', `HTTP ${insRes.status}${inserted ? '' : ': ' + (await insRes.text()).slice(0, 140)}`);
    }

    // 4. READ поста из публичной ленты (anon, политика миграции 002)
    if (inserted) {
      const readRes = await fetch(`${URL_}/rest/v1/autograph_posts?id=eq.${postId}&select=id,celebrity_name,payload`, {
        headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
      });
      const rows = await readRes.json();
      const found = Array.isArray(rows) && rows.some((r) => r.id === postId && r.payload?.proof === true);
      step(found, 'READ post (public feed)', found ? `прочитан id=${postId}, payload живой` : `HTTP ${readRes.status}: ${JSON.stringify(rows).slice(0, 140)}`);
    }

    // 5. UPDATE поста владельцем
    if (inserted && userJwt) {
      const updRes = await fetch(`${URL_}/rest/v1/autograph_posts?id=eq.${postId}`, {
        method: 'PATCH',
        headers: { apikey: ANON, Authorization: `Bearer ${userJwt}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ payload: { proof: true, updated: true } }),
      });
      step(updRes.status === 204, 'UPDATE post (owner)', `HTTP ${updRes.status}`);
    }
  } finally {
    // 6. Чистка (service-ключ обходит RLS)
    if (postId) {
      const delRes = await fetch(`${URL_}/rest/v1/autograph_posts?id=eq.${postId}`, {
        method: 'DELETE',
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: 'return=minimal' },
      });
      step(delRes.status === 204, 'CLEANUP post', `HTTP ${delRes.status}`);
    }
    if (userId) {
      const delUser = await fetch(`${URL_}/auth/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
      });
      step(delUser.status === 200 || delUser.status === 204, 'CLEANUP user', `HTTP ${delUser.status}`);
    }
  }

  console.log(`\nВердикт: ${failed === 0 ? 'ДОКАЗАНО: WRITE -> READ -> UPDATE работают через Auth+RLS' : 'ЕСТЬ ПРОБЛЕМЫ (см. [FAIL] выше)'}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('db-proof аварийно завершился:', e);
  process.exit(1);
});

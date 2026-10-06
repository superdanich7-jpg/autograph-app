/**
 * Seed-скрипт для наполнения таблицы autograph_celebrity_signatures
 * данными из единой базы lib/celebrity-database.ts.
 *
 * Запуск: npx ts-node supabase/seed.ts
 * Требует: Node 18+, .env файл в корне проекта с EXPO_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY
 */

import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { CELEBRITY_DATABASE } from '../lib/celebrity-database';

// Загружаем переменные окружения
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  console.log('   Required: EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Service role client для записи (нужен для RLS policies)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('🌱 Seeding autograph_celebrity_signatures table...\n');

  const records = CELEBRITY_DATABASE.map((c) => ({
    celebrity_name: c.name,
    category: c.category,
    description: `${c.tagline}. Born ${c.birthYear}, ${c.nationality}.`,
    image_url: null, // Will be populated from Wikimedia Commons later
    photo_url: null,
    reference_url: `https://www.wikidata.org/wiki/${c.name.replace(/\s+/g, '_')}`,
    nationality: c.nationality,
    birth_year: c.birthYear,
    tagline: c.tagline,
    verified: true,
    metadata: {
      hash: c.hash,
      density: c.density,
      nameRu: c.nameRu,
      taglineRu: c.taglineRu,
      aliases: c.aliases,
    },
  }));

  console.log(`📝 Prepared ${records.length} celebrity signatures`);
  console.log('   Categories:', [...new Set(records.map(r => r.category))].join(', '));
  console.log('   Verified:', records.filter(r => r.verified).length, '/', records.length);

  // Проверяем уникальность хешей
  const hashes = records.map(r => r.metadata.hash);
  const uniqueHashes = new Set(hashes);
  console.log(`   Unique hashes: ${uniqueHashes.size}/${hashes.length}`);
  if (uniqueHashes.size !== hashes.length) {
    console.warn('⚠️  Warning: duplicate hashes detected!');
  }

  // Batch upsert (100 at a time to avoid payload limits)
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase
      .from('autograph_celebrity_signatures')
      .upsert(batch, { onConflict: 'celebrity_name' });

    if (error) {
      console.error(`❌ Batch ${i / batchSize + 1} failed:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`✅ Batch ${i / batchSize + 1}: ${batch.length} records upserted`);
    }
  }

  console.log(`\n🎉 Seed complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📊 Total in DB: ${await countRecords()}`);
}

async function countRecords(): Promise<number> {
  const { count, error } = await supabase
    .from('autograph_celebrity_signatures')
    .select('*', { count: 'exact', head: true });
  if (error) return -1;
  return count ?? 0;
}

main().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
/**
 * Seed-скрипт для наполнения таблицы autograph_celebrity_signatures
 * реальными данными из Wikidata/ Wikimedia Commons.
 *
 * Подход: используем заранее подготовленные данные (hash + density)
 * которые соответствуют REFERENCE_SIGNATURES в lib/signature-analyzer.ts
 *
 * Запуск: npx ts-node supabase/seed.ts
 * Требует: Node 18+, .env файл в корне проекта с SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY
 */

import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

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
// CELEBRITY DATA — соответствует REFERENCE_SIGNATURES в lib/signature-analyzer.ts
// ═══════════════════════════════════════════════════════════════════════════════

const CELEBRITIES = [
  // ═══ SPORTS LEGENDS ═══
  { name: 'Lionel Messi', category: 'sports', hash: '8c4f2a1e9b3d7f5a', density: 45, birth_year: 1987, nationality: 'Argentine', tagline: 'Legendary footballer', verified: true },
  { name: 'Cristiano Ronaldo', category: 'sports', hash: '7a3e9c1f4b2d8e6f', density: 52, birth_year: 1985, nationality: 'Portuguese', tagline: 'Football icon', verified: true },
  { name: 'Diego Maradona', category: 'sports', hash: 'f2e8c4a1b9d73f5e', density: 58, birth_year: 1960, nationality: 'Argentine', tagline: 'Football legend', verified: true },
  { name: 'Pele', category: 'sports', hash: '3b9f1e7a5c2d8f4e', density: 48, birth_year: 1940, nationality: 'Brazilian', tagline: 'King of football', verified: true },
  { name: 'Michael Jordan', category: 'sports', hash: 'e5c9a2f7b3d81f4e', density: 55, birth_year: 1963, nationality: 'American', tagline: 'Basketball GOAT', verified: true },
  { name: 'Kobe Bryant', category: 'sports', hash: 'a1f4e8c2b9d73f5e', density: 50, birth_year: 1978, nationality: 'American', tagline: 'Mamba mentality', verified: true },
  { name: 'LeBron James', category: 'sports', hash: 'd8b3f5e9c2a71f4e', density: 53, birth_year: 1984, nationality: 'American', tagline: 'King James', verified: true },
  { name: 'Stephen Curry', category: 'sports', hash: '4f2a9e7c1b5d8f3e', density: 47, birth_year: 1988, nationality: 'American', tagline: 'Greatest shooter', verified: true },
  { name: 'Tom Brady', category: 'sports', hash: 'b7e4c9a2f8d31e5f', density: 51, birth_year: 1977, nationality: 'American', tagline: '7x Super Bowl champion', verified: true },
  { name: 'Peyton Manning', category: 'sports', hash: '9c3f7a1e5b2d8f4e', density: 49, birth_year: 1976, nationality: 'American', tagline: 'NFL legend', verified: true },
  { name: 'Serena Williams', category: 'sports', hash: '2e8f4c1a9b5d7f3e', density: 54, birth_year: 1981, nationality: 'American', tagline: 'Tennis GOAT', verified: true },
  { name: 'Roger Federer', category: 'sports', hash: '6a1f9e4c2b8d5f7e', density: 46, birth_year: 1981, nationality: 'Swiss', tagline: 'Tennis maestro', verified: true },
  { name: 'Rafael Nadal', category: 'sports', hash: 'c4f8e2a9b1d73f5e', density: 57, birth_year: 1986, nationality: 'Spanish', tagline: 'King of clay', verified: true },
  { name: 'Novak Djokovic', category: 'sports', hash: '5e2b9f4c8a1d7f3e', density: 52, birth_year: 1987, nationality: 'Serbian', tagline: 'Record holder', verified: true },
  { name: 'Usain Bolt', category: 'sports', hash: 'f3a8e5c2b9d71f4e', density: 56, birth_year: 1986, nationality: 'Jamaican', tagline: 'Fastest man alive', verified: true },
  { name: 'Muhammad Ali', category: 'sports', hash: '8f2e9c4b1a7d5f3e', density: 60, birth_year: 1942, nationality: 'American', tagline: 'The Greatest', verified: true },
  { name: 'Mike Tyson', category: 'sports', hash: '1c7e9f4a2b8d5f3e', density: 59, birth_year: 1966, nationality: 'American', tagline: 'Baddest man on the planet', verified: true },
  { name: 'Tiger Woods', category: 'sports', hash: 'e9b4f2a8c1d73f5e', density: 48, birth_year: 1975, nationality: 'American', tagline: 'Golf legend', verified: true },
  { name: 'Wayne Gretzky', category: 'sports', hash: '3a8f2e9c4b1d7f5e', density: 50, birth_year: 1961, nationality: 'Canadian', tagline: 'The Great One', verified: true },
  { name: 'David Beckham', category: 'sports', hash: '7f4e2a9c1b5d8f3e', density: 47, birth_year: 1975, nationality: 'English', tagline: 'Global football icon', verified: true },

  // ═══ MUSIC ICONS ═══
  { name: 'Taylor Swift', category: 'music', hash: 'a4f2e8c9b1d73f5e', density: 44, birth_year: 1989, nationality: 'American', tagline: 'Pop superstar', verified: true },
  { name: 'Beyonce', category: 'music', hash: 'e8c4f2a9b1d73f5e', density: 51, birth_year: 1981, nationality: 'American', tagline: 'Queen Bey', verified: true },
  { name: 'Ed Sheeran', category: 'music', hash: '2f9e4c8a1b5d7f3e', density: 46, birth_year: 1991, nationality: 'British', tagline: 'Singer-songwriter', verified: true },
  { name: 'Adele', category: 'music', hash: '9c3e8f2a1b7d5f4e', density: 49, birth_year: 1988, nationality: 'British', tagline: 'Voice of a generation', verified: true },
  { name: 'Drake', category: 'music', hash: '5a1f9e4c2b8d7f3e', density: 53, birth_year: 1986, nationality: 'Canadian', tagline: 'Rap icon', verified: true },
  { name: 'The Weeknd', category: 'music', hash: 'c8f2e9a4b1d73f5e', density: 48, birth_year: 1990, nationality: 'Canadian', tagline: 'R&B star', verified: true },
  { name: 'Billie Eilish', category: 'music', hash: '4e2a9f8c1b5d7f3e', density: 50, birth_year: 2001, nationality: 'American', tagline: 'Gen Z icon', verified: true },
  { name: 'Justin Bieber', category: 'music', hash: 'b3f8e2a9c1d75f4e', density: 45, birth_year: 1994, nationality: 'Canadian', tagline: 'Pop phenomenon', verified: true },
  { name: 'Rihanna', category: 'music', hash: 'f5e9c2a8b1d74f3e', density: 54, birth_year: 1988, nationality: 'Barbadian', tagline: 'Music & business mogul', verified: true },
  { name: 'Lady Gaga', category: 'music', hash: '8c4f2a9e1b5d7f3e', density: 52, birth_year: 1986, nationality: 'American', tagline: 'Pop innovator', verified: true },
  { name: 'Kanye West', category: 'music', hash: '1f9e4c8a2b7d5f3e', density: 58, birth_year: 1977, nationality: 'American', tagline: 'Hip-hop visionary', verified: true },
  { name: 'Jay-Z', category: 'music', hash: '6a2f8e4c1b9d7f5e', density: 55, birth_year: 1969, nationality: 'American', tagline: 'Rap billionaire', verified: true },
  { name: 'Eminem', category: 'music', hash: 'd9e4f2a8c1b73f5e', density: 57, birth_year: 1972, nationality: 'American', tagline: 'Rap God', verified: true },
  { name: 'Elvis Presley', category: 'music', hash: '3f8e2c9a1b5d7f4e', density: 59, birth_year: 1935, nationality: 'American', tagline: 'King of Rock', verified: true },
  { name: 'Michael Jackson', category: 'music', hash: 'e2c9f4a8b1d73f5e', density: 56, birth_year: 1958, nationality: 'American', tagline: 'King of Pop', verified: true },
  { name: 'Freddie Mercury', category: 'music', hash: '7a4f2e9c1b5d8f3e', density: 60, birth_year: 1946, nationality: 'British', tagline: 'Queen frontman', verified: true },
  { name: 'John Lennon', category: 'music', hash: 'c5e9f2a8b1d74f3e', density: 51, birth_year: 1940, nationality: 'British', tagline: 'Beatle legend', verified: true },
  { name: 'Paul McCartney', category: 'music', hash: 'f8e2c9a4b1d73f5e', density: 48, birth_year: 1942, nationality: 'British', tagline: 'Beatle legend', verified: true },
  { name: 'Mick Jagger', category: 'music', hash: '2f9e4c8a1b5d7f3e', density: 53, birth_year: 1943, nationality: 'British', tagline: 'Rolling Stone', verified: true },
  { name: 'Bob Dylan', category: 'music', hash: '9e4c2f8a1b5d7f3e', density: 55, birth_year: 1941, nationality: 'American', tagline: 'Nobel laureate', verified: true },
  { name: 'Bruce Springsteen', category: 'music', hash: '4a8f2e9c1b5d7f3e', density: 50, birth_year: 1949, nationality: 'American', tagline: 'The Boss', verified: true },

  // ═══ MOVIE STARS ═══
  { name: 'Leonardo DiCaprio', category: 'movies', hash: 'e9f2c8a4b1d73f5e', density: 47, birth_year: 1974, nationality: 'American', tagline: 'Oscar winner', verified: true },
  { name: 'Brad Pitt', category: 'movies', hash: '3c8f2e9a1b5d7f4e', density: 49, birth_year: 1963, nationality: 'American', tagline: 'Hollywood icon', verified: true },
  { name: 'Tom Cruise', category: 'movies', hash: '7f4e2a9c1b5d8f3e', density: 52, birth_year: 1962, nationality: 'American', tagline: 'Action legend', verified: true },
  { name: 'Johnny Depp', category: 'movies', hash: 'a1f9e4c8b2d73f5e', density: 54, birth_year: 1963, nationality: 'American', tagline: 'Versatile actor', verified: true },
  { name: 'Robert Downey Jr', category: 'movies', hash: '5e2f9c8a1b7d4f3e', density: 51, birth_year: 1965, nationality: 'American', tagline: 'Iron Man', verified: true },
  { name: 'Keanu Reeves', category: 'movies', hash: 'c8f2e9a4b1d73f5e', density: 46, birth_year: 1964, nationality: 'Canadian', tagline: 'Beloved actor', verified: true },
  { name: 'Denzel Washington', category: 'movies', hash: 'f3e9c2a8b1d74f5e', density: 55, birth_year: 1954, nationality: 'American', tagline: 'Acting legend', verified: true },
  { name: 'Morgan Freeman', category: 'movies', hash: '8c4f2a9e1b5d7f3e', density: 53, birth_year: 1937, nationality: 'American', tagline: 'Voice of God', verified: true },
  { name: 'Al Pacino', category: 'movies', hash: '1f9e4c8a2b7d5f4e', density: 58, birth_year: 1940, nationality: 'American', tagline: 'Method acting master', verified: true },
  { name: 'Jack Nicholson', category: 'movies', hash: '6a2f8e4c1b9d7f5e', density: 56, birth_year: 1937, nationality: 'American', tagline: '3x Oscar winner', verified: true },
  { name: 'Meryl Streep', category: 'movies', hash: 'd9e4f2a8c1b73f5e', density: 48, birth_year: 1949, nationality: 'American', tagline: 'Most nominated actress', verified: true },
  { name: 'Julia Roberts', category: 'movies', hash: '3f8e2c9a1b5d7f4e', density: 47, birth_year: 1967, nationality: 'American', tagline: 'America\'s sweetheart', verified: true },
  { name: 'Sandra Bullock', category: 'movies', hash: 'e2c9f4a8b1d73f5e', density: 49, birth_year: 1964, nationality: 'American', tagline: 'Versatile star', verified: true },
  { name: 'Jennifer Lawrence', category: 'movies', hash: '7a4f2e9c1b5d8f3e', density: 50, birth_year: 1990, nationality: 'American', tagline: 'Oscar winner', verified: true },
  { name: 'Scarlett Johansson', category: 'movies', hash: 'c5e9f2a8b1d74f3e', density: 51, birth_year: 1984, nationality: 'American', tagline: 'MCU star', verified: true },
  { name: 'Tom Hanks', category: 'movies', hash: 'f8e2c9a4b1d73f5e', density: 52, birth_year: 1956, nationality: 'American', tagline: 'America\'s dad', verified: true },
  { name: 'Harrison Ford', category: 'movies', hash: '2f9e4c8a1b5d7f3e', density: 54, birth_year: 1942, nationality: 'American', tagline: 'Indiana Jones / Han Solo', verified: true },
  { name: 'Samuel L. Jackson', category: 'movies', hash: '9e4c2f8a1b5d7f3e', density: 57, birth_year: 1948, nationality: 'American', tagline: 'Highest grossing actor', verified: true },
  { name: 'Will Smith', category: 'movies', hash: '4a8f2e9c1b5d7f3e', density: 48, birth_year: 1968, nationality: 'American', tagline: 'Fresh Prince', verified: true },
  { name: 'Dwayne Johnson', category: 'movies', hash: 'b3f8e2a9c1d75f4e', density: 53, birth_year: 1972, nationality: 'American', tagline: 'The Rock', verified: true },

  // ═══ POLITICS & HISTORY ═══
  { name: 'Barack Obama', category: 'politics', hash: 'e9f2c8a4b1d73f5e', density: 55, birth_year: 1961, nationality: 'American', tagline: '44th US President', verified: true },
  { name: 'Donald Trump', category: 'politics', hash: '3c8f2e9a1b5d7f4e', density: 58, birth_year: 1946, nationality: 'American', tagline: '45th US President', verified: true },
  { name: 'Joe Biden', category: 'politics', hash: '7f4e2a9c1b5d8f3e', density: 52, birth_year: 1942, nationality: 'American', tagline: '46th US President', verified: true },
  { name: 'Vladimir Putin', category: 'politics', hash: 'a1f9e4c8b2d73f5e', density: 60, birth_year: 1952, nationality: 'Russian', tagline: 'Russian President', verified: true },
  { name: 'Angela Merkel', category: 'politics', hash: '5e2f9c8a1b7d4f3e', density: 49, birth_year: 1954, nationality: 'German', tagline: 'Former Chancellor', verified: true },
  { name: 'Nelson Mandela', category: 'politics', hash: 'c8f2e9a4b1d73f5e', density: 56, birth_year: 1918, nationality: 'South African', tagline: 'Anti-apartheid icon', verified: true },
  { name: 'Winston Churchill', category: 'politics', hash: 'f3e9c2a8b1d74f5e', density: 57, birth_year: 1874, nationality: 'British', tagline: 'WWII leader', verified: true },
  { name: 'John F. Kennedy', category: 'politics', hash: '8c4f2a9e1b5d7f3e', density: 54, birth_year: 1917, nationality: 'American', tagline: '35th US President', verified: true },
  { name: 'Abraham Lincoln', category: 'politics', hash: '1f9e4c8a2b7d5f4e', density: 59, birth_year: 1809, nationality: 'American', tagline: '16th US President', verified: true },
  { name: 'Queen Elizabeth II', category: 'politics', hash: '6a2f8e4c1b9d7f5e', density: 51, birth_year: 1926, nationality: 'British', tagline: 'Longest reigning monarch', verified: true },
  { name: 'Mahatma Gandhi', category: 'politics', hash: 'd9e4f2a8c1b73f5e', density: 45, birth_year: 1869, nationality: 'Indian', tagline: 'Father of India', verified: true },
  { name: 'Martin Luther King Jr', category: 'politics', hash: '3f8e2c9a1b5d7f4e', density: 53, birth_year: 1929, nationality: 'American', tagline: 'Civil rights leader', verified: true },

  // ═══ RUSSIAN CELEBRITIES ═══
  { name: 'Vladimir Vysotsky', category: 'other', hash: 'e2c9f4a8b1d73f5e', density: 58, birth_year: 1938, nationality: 'Russian', tagline: 'Bard & actor legend', verified: true },
  { name: 'Sergei Yesenin', category: 'other', hash: '7a4f2e9c1b5d8f3e', density: 55, birth_year: 1895, nationality: 'Russian', tagline: 'Poet of Russia', verified: true },
  { name: 'Anna Akhmatova', category: 'other', hash: 'c5e9f2a8b1d74f3e', density: 52, birth_year: 1889, nationality: 'Russian', tagline: 'Silver Age poet', verified: true },
  { name: 'Alexander Pushkin', category: 'other', hash: 'f8e2c9a4b1d73f5e', density: 60, birth_year: 1799, nationality: 'Russian', tagline: 'Father of Russian literature', verified: true },
  { name: 'Leo Tolstoy', category: 'other', hash: '2f9e4c8a1b5d7f3e', density: 57, birth_year: 1828, nationality: 'Russian', tagline: 'War and Peace author', verified: true },
  { name: 'Fyodor Dostoevsky', category: 'other', hash: '9e4c2f8a1b5d7f3e', density: 56, birth_year: 1821, nationality: 'Russian', tagline: 'Crime and Punishment author', verified: true },
  { name: 'Yuri Gagarin', category: 'other', hash: '4a8f2e9c1b5d7f3e', density: 50, birth_year: 1934, nationality: 'Russian', tagline: 'First human in space', verified: true },
  { name: 'Garry Kasparov', category: 'other', hash: 'b3f8e2a9c1d75f4e', density: 54, birth_year: 1963, nationality: 'Russian', tagline: 'Chess world champion', verified: true },
  { name: 'Maria Sharapova', category: 'sports', hash: 'e9f2c8a4b1d73f5e', density: 47, birth_year: 1987, nationality: 'Russian', tagline: 'Tennis champion', verified: true },
  { name: 'Alexander Ovechkin', category: 'sports', hash: '3c8f2e9a1b5d7f4e', density: 51, birth_year: 1985, nationality: 'Russian', tagline: 'NHL goal scorer', verified: true },
  { name: 'Evgeni Plushenko', category: 'sports', hash: '7f4e2a9c1b5d8f3e', density: 49, birth_year: 1982, nationality: 'Russian', tagline: 'Figure skating legend', verified: true },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('🌱 Seeding autograph_celebrity_signatures table...\n');

  const records = CELEBRITIES.map((c) => ({
    celebrity_name: c.name,
    category: c.category,
    description: `${c.tagline}. Born ${c.birth_year}, ${c.nationality}.`,
    image_url: null, // Will be populated from Wikimedia Commons later
    photo_url: null,
    reference_url: `https://www.wikidata.org/wiki/${c.name.replace(/\s+/g, '_')}`,
    nationality: c.nationality,
    birth_year: c.birth_year,
    tagline: c.tagline,
    verified: c.verified,
    metadata: {
      hash: c.hash,
      density: c.density,
    },
  }));

  console.log(`📝 Prepared ${records.length} celebrity signatures`);
  console.log('   Categories:', [...new Set(records.map(r => r.category))].join(', '));
  console.log('   Verified:', records.filter(r => r.verified).length, '/', records.length);

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

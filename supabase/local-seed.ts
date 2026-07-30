/**
 * Local Seed Script — генерация мок-данных для тестирования.
 * Не требует Supabase подключения, создаёт данные локально.
 *
 * Запуск: npx ts-node supabase/local-seed.ts
 */

import { resolve } from 'path';

const CELEBRITIES = [
  { name: 'Лионель Месси', category: 'sports', city: 'Буэнос-Айрес' },
  { name: 'Киану Ривз', category: 'movies', city: 'Бейрут' },
  { name: 'Тейлор Свифт', category: 'music', city: 'Рединг' },
  { name: 'Криштиану Роналду', category: 'sports', city: 'Фуншал' },
  { name: 'Брэд Питт', category: 'movies', city: 'Шоуни' },
  { name: 'Бейонсе', category: 'music', city: 'Хьюстон' },
  { name: 'Леброн Джеймс', category: 'sports', city: 'Акрон' },
  { name: 'Скарлетт Йоханссон', category: 'movies', city: 'Нью-Йорк' },
  { name: 'Эд Ширан', category: 'music', city: 'Галифакс' },
  { name: 'Новак Джокович', category: 'sports', city: 'Белград' },
  { name: 'Марк Закерберг', category: 'other', city: 'Уайт-Плейнс' },
  { name: 'Илон Маск', category: 'other', city: 'Претория' },
  { name: 'Билл Гейтс', category: 'other', city: 'Сиэтл' },
  { name: 'Опра Уинфри', category: 'other', city: 'Космаскоги' },
  { name: 'Стин', category: 'music', city: 'Стокгольм' },
  { name: 'Роберт Дауни мл.', category: 'movies', city: 'Манхэттен' },
  { name: 'Том Хэнкс', category: 'movies', city: 'Конкорд' },
  { name: 'Дженнифер Лоуренс', category: 'movies', city: 'Луисвилл' },
  { name: 'Неймар', category: 'sports', city: 'Можи-дас-Крузис' },
  { name: 'Рафаэль Надаль', category: 'sports', city: 'Манакор' },
  { name: 'Ариана Гранде', category: 'music', city: 'Бока-Ратон' },
  { name: 'Бруно Марс', category: 'music', city: 'Гонолулу' },
  { name: 'Дуэйн Джонсон', category: 'movies', city: 'Хейвуд' },
  { name: 'Вилл Смит', category: 'movies', city: 'Уэст-Филadelphia' },
  { name: 'Джастин Тимберлейк', category: 'music', city: 'Мемфис' },
  { name: 'Серена Уильямс', category: 'sports', city: 'Сагино' },
  { name: 'Кевин Харт', category: 'movies', city: 'Филадельфия' },
  { name: 'Рианна', category: 'music', city: 'Сент-Майкл' },
  { name: 'Люк Брайан', category: 'music', city: 'Линнвилл' },
  { name: 'Дwayne Johnson', category: 'sports', city: 'Хейвуд' },
];

const RARITIES: Array<'common' | 'rare' | 'legendary'> = ['common', 'rare', 'legendary'];
const EVIDENCE_TYPES = ['photo', 'selfie', 'ticket', 'video', 'certificate'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(): string {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toLocaleDateString('ru-RU');
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function generatePosts(count: number): Array<Record<string, unknown>> {
  const posts: Array<Record<string, unknown>> = [];

  for (let i = 0; i < count; i++) {
    const celeb = CELEBRITIES[i % CELEBRITIES.length];
    const rarity = RARITIES[randomInt(0, 2)];
    const evidenceCount = randomInt(1, 3);
    const evidence: string[] = [];

    for (let j = 0; j < evidenceCount; j++) {
      const type = EVIDENCE_TYPES[randomInt(0, EVIDENCE_TYPES.length - 1)];
      if (!evidence.includes(type)) {
        evidence.push(type);
      }
    }

    posts.push({
      id: generateId(),
      owner_id: `user-${randomInt(1, 5)}`,
      celebrity_name: celeb.name,
      category: celeb.category,
      rarity,
      payload: {
        id: generateId(),
        ownerId: `user-${randomInt(1, 5)}`,
        ownerName: `Collector ${randomInt(1, 10)}`,
        uri: `https://picsum.photos/seed/${i}/400/400`,
        caption: `Подпись ${celeb.name} получена в ${celeb.city}`,
        timestamp: new Date().toISOString(),
        likes: randomInt(0, 50),
        liked: false,
        saved: false,
        comments: [],
        celebrityName: celeb.name,
        location: celeb.city,
        dateReceived: randomDate(),
        category: celeb.category,
        rarity,
        evidence,
        isAnalyzed: Math.random() > 0.3,
        realVotes: randomInt(0, 20),
        fakeVotes: randomInt(0, 5),
        realScore: randomInt(0, 30),
        fakeScore: randomInt(0, 10),
        votesByUser: {},
        voteWeightsByUser: {},
      },
      updated_at: new Date().toISOString(),
    });
  }

  return posts;
}

// ─── Main ──────────────────────────────────────

async function main() {
  console.log('🌱 Generating local seed data...');

  const posts = generatePosts(50);

  console.log(`✅ Generated ${posts.length} posts`);

  // Save to file
  const outputPath = resolve(__dirname, '..', 'seeds_output.json');
  const { writeFileSync } = await import('fs');
  writeFileSync(outputPath, JSON.stringify(posts, null, 2));

  console.log(`📁 Saved to ${outputPath}`);
  console.log('🚀 Run with: npx ts-node supabase/local-seed.ts');
}

main().catch(console.error);
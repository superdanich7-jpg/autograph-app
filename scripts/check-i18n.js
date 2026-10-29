/**
 * Шаг 5 PLAN-100: CI-гейт i18n — в UI-файлах не должно появляться новых
 * русских литералов мимо словаря (lib/i18n.ts).
 *
 * Правила:
 *  - сканируем app/, components/, context/ (UI-слой);
 *  - файлы из ALLOWLIST ждут перевода — они не валят сборку, но их нельзя
 *    увеличивать (число вхождений зафиксировано в BASELINE);
 *  - новый файл с RU-литералами или рост счётчика в allowlist = ошибка.
 *
 * Запуск: node scripts/check-i18n.js (входит в npm run verify)
 */

const fs = require('fs');
const path = require('path');

const ROOTS = ['app', 'components', 'context'];
const ALLOWLIST = {
    // файл: зафиксированное число строк с RU-литералами (перевод в бэклоге)
    // ErrorBoundary — class вне провайдеров, строки двуязычные по дизайну
    'components/ErrorBoundary.tsx': 3,
    'components/ExportCollection.tsx': 6,
    'components/ImportCollection.tsx': 6,
    'components/CollectionValueCard.tsx': 2,
    'components/PostDetailModal.tsx': 1,
    'lib/certificate.ts': 5,
    'lib/streak-reminder.ts': 5,
    'lib/recommendations.ts': 6,
    'lib/authenticity.ts': 5,
    'lib/stats-share.ts': 5,
    'lib/collection-io.ts': 5,
    'lib/friends.ts': 7,
    'lib/seed-social.ts': 7,
    'lib/chat.ts': 4,
    'lib/communities.ts': 2,
    'lib/trust.ts': 4,
    'lib/constants.ts': 4,
    'lib/async.ts': 1,
    'lib/utils.ts': 1,
    'lib/signature-analyzer.ts': 2,
    'context/PostsContext.tsx': 51,
    'app/auth.tsx': 1,
};

const RU = /[А-Яа-яЁё]/;
const LITERAL = /'[^'\n]*[А-Яа-яЁё][^'\n]*'|"[^"\n]*[А-Яа-яЁё][^"\n]*"/;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.expo', '__tests__']);

let failures = [];
let scanned = 0;

function countCyrillicLines(source) {
    let n = 0;
    for (const raw of source.split('\n')) {
        const line = raw.trim();
        if (line.startsWith('//') || line.startsWith('*') || line.startsWith('/*')) continue;
        if (RU.test(line) && LITERAL.test(line)) n += 1;
    }
    return n;
}

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (SKIP_DIRS.has(entry.name)) continue;
            walk(full);
            continue;
        }
        if (!entry.name.endsWith('.tsx') && !entry.name.endsWith('.ts')) continue;
        if (entry.name.endsWith('.test.ts')) continue;
        const rel = full.split(path.sep).join('/');
        const source = fs.readFileSync(full, 'utf8');
        if (rel === 'lib/i18n.ts') continue;
        const count = countCyrillicLines(source);
        if (count === 0) continue;
        scanned += 1;
        if (!(rel in ALLOWLIST)) {
            failures.push(`${rel}: файл с RU-литералами вне словаря (${count} строк) — переведи через lib/i18n.ts или добавь в ALLOWLIST scripts/check-i18n.js`);
        } else if (count > ALLOWLIST[rel]) {
            failures.push(`${rel}: RU-строк стало ${count}, было ${ALLOWLIST[rel]} — новый текст добавляй в словарь (lib/i18n.ts), а не в код`);
        }
    }
}

ROOTS.forEach((dir) => {
    if (fs.existsSync(dir)) walk(dir);
});

if (failures.length > 0) {
    console.error('i18n gate FAILED:');
    for (const f of failures) console.error('  ✖ ' + f);
    process.exit(1);
}

console.log(`i18n gate OK: ${scanned} файлов с legacy-переводом в пределах базовой линии`);

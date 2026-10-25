#!/usr/bin/env node
/**
 * Публикация web-демо на GitHub Pages (R-05).
 *
 * Что делает:
 *   1. Берёт свежий dist/ (предварительно: npm run build:web)
 *   2. Добавляет .nojekyll (иначе GitHub Pages/Jekyll выкидывает каталог _expo)
 *   3. Публикует содержимое в ветку gh-pages (force push — ветка полностью сборная)
 *
 * Использование: npm run deploy:web
 * URL после включения Pages: https://superdanich7-jpg.github.io/autograph-app/
 */
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const TMP = path.join(require('os').tmpdir(), `autograph-gh-pages-${Date.now()}`);
const REMOTE = 'https://github.com/superdanich7-jpg/autograph-app.git';

function run(cmd, cwd) {
  execSync(cmd, { cwd: cwd || ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
}

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/index.html не найден. Сначала: npm run build:web');
  process.exit(1);
}

fs.mkdirSync(TMP, { recursive: true });
fs.cpSync(DIST, TMP, { recursive: true });
fs.writeFileSync(path.join(TMP, '.nojekyll'), '');

const gitInTmp = (cmd) => run(cmd, TMP);
gitInTmp('git init -b gh-pages');
gitInTmp('git config user.name "deploy-web"');
gitInTmp('git config user.email "deploy@local"');
gitInTmp('git add -A');
gitInTmp('git commit -m "web demo deploy"');
gitInTmp(`git push --force ${REMOTE} gh-pages`);

fs.rmSync(TMP, { recursive: true, force: true });
console.log('OK: ветка gh-pages обновлена.');
console.log('Сайт: https://superdanich7-jpg.github.io/autograph-app/');

// Локальный сервер dist с учётом baseUrl /autograph-app (для отладки веб-сборки).
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const DIST = path.join(__dirname, '..', 'dist');
const PREFIX = '/autograph-app';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.png': 'image/png', '.ico': 'image/x-icon', '.map': 'application/json', '.json': 'application/json' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith(PREFIX)) p = p.slice(PREFIX.length) || '/';
  if (p === '/' || p === '') p = '/index.html';
  const file = path.join(DIST, path.normalize(p).replace(/^([.][.][/\\])+/, ''));
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('not found: ' + p); return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(8099, () => console.log('serve-dist: http://localhost:8099/autograph-app/'));

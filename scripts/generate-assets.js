#!/usr/bin/env node
/**
 * Генератор бренд-ассетов Ink&Gold (R-07, F-13).
 *
 * Заменяет дефолтные Expo-шаблонные иконки на кастомный бренд:
 * чернильный фон (#0B1220) + золотая градиентная монограмма «A»
 * с росчерком подписи. PNG пишется напрямую (zlib + CRC32), без зависимостей.
 *
 * Выход:
 *   assets/images/icon.png         1024x1024 (полная, фон чернильный)
 *   assets/images/adaptive-icon.png 1024x1024 (прозрачная, глиф в safe-zone)
 *   assets/images/splash-icon.png   512x512  (прозрачная, глиф)
 *   assets/images/favicon.png       48x48    (упрощённый глиф)
 *
 * Запуск: node scripts/generate-assets.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ─── Палитра Ink&Gold (lib/theme.ts) ──────────────────────────
const INK = [11, 18, 32]; // #0B1220
const GOLD_300 = [231, 200, 115]; // #E7C873
const GOLD_500 = [201, 162, 39]; // #C9A227
const GOLD_700 = [138, 109, 21]; // #8A6D15

// ─── PNG writer (RGBA, 8-bit) ─────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Canvas (одноканальная маска + supersampling 4x) ──────────
class MaskCanvas {
  constructor(size) {
    this.size = size;
    this.data = new Float32Array(size * size); // покрытие 0..1 (alpha-накопитель)
  }
  blend(x, y, coverage, channel) {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return;
    this.data[y * this.size + x] = Math.min(1, this.data[y * this.size + x] + coverage);
  }
  /** Заливка эллипса (cx, cy, rx, ry) с мягкой границей. */
  fillEllipse(cx, cy, rx, ry, soft = 1.5) {
    const x0 = Math.max(0, Math.floor(cx - rx - 2));
    const x1 = Math.min(this.size - 1, Math.ceil(cx + rx + 2));
    const y0 = Math.max(0, Math.floor(cy - ry - 2));
    const y1 = Math.min(this.size - 1, Math.ceil(cy + ry + 2));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        const d = Math.sqrt(dx * dx + dy * dy);
        // d<=1-soft внутри; линейное затухание на границе
        const cov = d <= 1 - soft ? 1 : d >= 1 + soft ? 0 : (1 + soft - d) / (2 * soft);
        if (cov > 0) this.blend(x, y, cov);
      }
    }
  }
  /** Отрезок с круглыми торцами (перья «A»). */
  strokeLine(x1, y1, x2, y2, width) {
    const r = width / 2;
    const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / (r * 0.4)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.fillEllipse(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, r, r, 0.8);
    }
  }
  /** Квадратичная безье как серия отрезков (росчерк подписи). */
  strokeQuad(x1, y1, cx, cy, x2, y2, w1, w2) {
    const steps = 90;
    let px = x1, py = y1;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const x = mt * mt * x1 + 2 * mt * t * cx + t * t * x2;
      const y = mt * mt * y1 + 2 * mt * t * cy + t * t * y2;
      this.strokeLine(px, py, x, y, w1 + (w2 - w1) * t);
      px = x; py = y;
    }
  }
  /** Кольцо (для иконки): радиальный штрих. */
  strokeRing(cx, cy, radius, width) {
    const r0 = radius - width / 2;
    const r1 = radius + width / 2;
    const x0 = Math.max(0, Math.floor(cx - r1 - 2));
    const x1 = Math.min(this.size - 1, Math.ceil(cx + r1 + 2));
    const y0 = Math.max(0, Math.floor(cy - r1 - 2));
    const y1 = Math.min(this.size - 1, Math.ceil(cy + r1 + 2));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x - cx, y - cy);
        const cov = d <= r0 ? 0 : d >= r1 ? 0 : (d - r0) / (r1 - r0) > 0.5 ? 1 - ((d - r0) / (r1 - r0) - 0.5) * 2 : ((d - r0) / (r1 - r0)) * 2;
        // мягкие края кольца
        const edgeIn = Math.min(1, Math.max(0, (d - r0 + 1.5) / 3));
        const edgeOut = Math.min(1, Math.max(0, (r1 + 0 - d + 1.5) / 3));
        const c = edgeIn * edgeOut;
        if (c > 0) this.blend(x, y, c * 0.85);
      }
    }
  }
  downsample(target) {
    const factor = this.size / target;
    const out = new Float32Array(target * target);
    for (let y = 0; y < target; y++) {
      for (let x = 0; x < target; x++) {
        let sum = 0, n = 0;
        for (let sy = Math.floor(y * factor); sy < Math.floor((y + 1) * factor); sy++) {
          for (let sx = Math.floor(x * factor); sx < Math.floor((x + 1) * factor); sx++) {
            sum += this.data[sy * this.size + sx] || 0;
            n++;
          }
        }
        out[y * target + x] = n ? sum / n : 0;
      }
    }
    return out;
  }
}

/** Вертикальный золотой градиент (gold300 вверху -> gold700 внизу). */
function goldAt(t) {
  const lerp = (a, b) => Math.round(a + (b - a) * t);
  const [r1, g1, b1] = GOLD_300;
  const [r2, g2, b2] = GOLD_700;
  return [lerp(r1, r2), lerp(g1, g2), lerp(b1, b2)];
}

/** Композит: маска-глиф поверх фона (или прозрачного). */
function compose(size, glyph, { background }) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const a = Math.min(1, glyph[y * size + x]);
      const [gr, gg, gb] = goldAt(y / size);
      const i = (y * size + x) * 4;
      if (background) {
        rgba[i] = Math.round(background[0] * (1 - a) + gr * a);
        rgba[i + 1] = Math.round(background[1] * (1 - a) + gg * a);
        rgba[i + 2] = Math.round(background[2] * (1 - a) + gb * a);
        rgba[i + 3] = 255;
      } else {
        rgba[i] = gr;
        rgba[i + 1] = gg;
        rgba[i + 2] = gb;
        rgba[i + 3] = Math.round(a * 255);
      }
    }
  }
  return rgba;
}

/** Рисует глиф «A» + росчерк на канвасе размера size (в координатах 0..1). */
function drawGlyph(canvas, scale = 1) {
  const s = canvas.size;
  // «A»: вершина 0.5,0.30; ножки 0.30,0.72 и 0.70,0.72; перекладина на 0.555
  const p = (fx, fy) => [fx * s, fy * s];
  const strokeW = 0.075 * s * scale;
  const [ax, ay] = p(0.5, 0.30);
  const [lx, ly] = p(0.295, 0.72);
  const [rx, ry] = p(0.705, 0.72);
  canvas.strokeLine(ax, ay, lx, ly, strokeW * 1.25); // левая ножка (толще — каллиграфия)
  canvas.strokeLine(ax, ay, rx, ry, strokeW * 0.8); // правая ножка (тоньше)
  const cyBar = 0.555 * s;
  canvas.strokeLine(ax - 0.145 * s, cyBar, ax + 0.135 * s, cyBar, strokeW * 0.62); // перекладина
  // Росчерк-подпись: слева направо с изгибом, сходит на нет
  canvas.strokeQuad(0.24 * s, 0.83 * s, 0.5 * s, 0.92 * s, 0.78 * s, 0.80 * s, strokeW * 0.55, strokeW * 0.16);
}

function generateIcon(full) {
  const SS = 2048; // supersample canvas
  const canvas = new MaskCanvas(SS);
  drawGlyph(canvas);
  if (full) canvas.strokeRing(SS / 2, SS / 2, SS * 0.46, SS * 0.012);
  const glyph = canvas.downsample(1024);
  return encodePNG(1024, 1024, compose(1024, glyph, { background: full ? INK : null }));
}

function generateSplash() {
  const SS = 2048;
  const canvas = new MaskCanvas(SS);
  drawGlyph(canvas, 1.0);
  const glyph = canvas.downsample(512);
  return encodePNG(512, 512, compose(512, glyph, { background: null }));
}

function generateFavicon() {
  const SS = 192; // 4x от 48
  const canvas = new MaskCanvas(SS);
  drawGlyph(canvas, 1.1);
  const glyph = canvas.downsample(48);
  const rgba = Buffer.alloc(48 * 48 * 4);
  // фон чернильный для читаемости в 48px
  for (let i = 0; i < 48 * 48; i++) {
    const a = Math.min(1, glyph[i] * 1.15);
    const [gr, gg, gb] = goldAt((i / (48 * 48)) | 0 ? 0.5 : 0.3);
    rgba[i * 4] = Math.round(INK[0] * (1 - a) + gr * a);
    rgba[i * 4 + 1] = Math.round(INK[1] * (1 - a) + gg * a);
    rgba[i * 4 + 2] = Math.round(INK[2] * (1 - a) + gb * a);
    rgba[i * 4 + 3] = 255;
  }
  return encodePNG(48, 48, rgba);
}

const OUT = path.join(__dirname, '..', 'assets', 'images');
fs.writeFileSync(path.join(OUT, 'icon.png'), generateIcon(true));
fs.writeFileSync(path.join(OUT, 'adaptive-icon.png'), generateIcon(false));
fs.writeFileSync(path.join(OUT, 'splash-icon.png'), generateSplash());
fs.writeFileSync(path.join(OUT, 'favicon.png'), generateFavicon());
console.log('OK: assets/images/{icon,adaptive-icon,splash-icon,favicon}.png перегенерированы (Ink&Gold)');

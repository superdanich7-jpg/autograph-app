/**
 * Certificate — генерация шейрабл-сертификата подлинности как SVG-строка.
 *
 * CEO-идея #7 (Фаза 2): визуальный сертификат с QR-кодом (паттерн PSA/Relic).
 * Наш козырь vs платные аналоги: сертификат бесплатный, с QR-ссылкой на пост
 * и объединённым вердиктом «AI + сообщество».
 *
 * Почему SVG, а не PNG: без react-native-view-shot (нет в deps) честный рендер
 * в PNG недоступен. SVG — это чистая строка: тестируемо, шарится файлом,
 * отрисовывается нативно (react-native-svg) и на web. Полноценный PNG —
 * отдельная задача Фазы 3.
 *
 * QR рендерим вручную через qrcode-generator (уже в зависимостях).
 */

import { Post } from '../context/PostsContext';
import { buildCertificateData, getAuthenticityVerdict } from './authenticity';
import { getVerdictLabel } from './authenticity';

const VERDICT_COLOR: Record<string, string> = {
    genuine: '#16a34a',
    'likely-fake': '#dc2626',
    disputed: '#f59e0b',
    inconclusive: '#0ea5e9',
};

/** Экранирует спецсимволы для безопасной вставки в SVG/XML. */
function esc(s: string): string {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Строит матрицу QR из текста. Требует qrcode-generator (CommonJS require). */
function buildQrMatrix(text: string): { size: number; isDark: (y: number, x: number) => boolean } | null {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const QRCode = require('qrcode-generator');
        const qr = QRCode(0, 'M');
        qr.addData(text);
        qr.make();
        const size = qr.getModuleCount();
        return { size, isDark: (y: number, x: number) => qr.isDark(y, x) };
    } catch {
        return null;
    }
}

/** Рендерит QR в SVG-прямоугольники заданного размера, встроенные в offset. */
function renderQrSvg(text: string, offsetX: number, offsetY: number, cell: number): string {
    const matrix = buildQrMatrix(text);
    if (!matrix) return '';
    const rects: string[] = [];
    for (let y = 0; y < matrix.size; y++) {
        for (let x = 0; x < matrix.size; x++) {
            if (matrix.isDark(y, x)) {
                rects.push(
                    `<rect x="${offsetX + x * cell}" y="${offsetY + y * cell}" width="${cell}" height="${cell}" fill="#0b0b0f"/>`
                );
            }
        }
    }
    return rects.join('');
}

export interface CertificateSvgResult {
    svg: string;
    dataUrl: string;
    fileName: string;
}

/**
 * Формирует SVG-сертификат подлинности для поста.
 * postUrl попадает в QR-код — получатель может открыть пост и проверить вердикт.
 */
export function buildCertificateSvg(post: Post, postUrl: string): CertificateSvgResult {
    const data = buildCertificateData(post);
    const verdict = getAuthenticityVerdict(post);
    const accent = VERDICT_COLOR[verdict.verdict] ?? '#0ea5e9';

    const W = 600;
    const H = 420;
    const qrCell = 3;
    const qrSize = 132;
    const qrX = W - qrSize - 40;
    const qrY = H - qrSize - 60;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="24" fill="none" stroke="${accent}" stroke-width="3"/>
  <rect x="16" y="16" width="${W - 32}" height="10" fill="${accent}"/>
  <text x="48" y="76" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="${accent}" letter-spacing="2">AUTOGRAPH · СЕРТИФИКАТ ПОДЛИННОСТИ</text>
  <text x="48" y="128" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="800" fill="#0b0b0f">${esc(data.celebrityName || 'Автограф')}</text>
  <text x="48" y="164" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="700" fill="${accent}">${esc(getVerdictLabel(verdict.verdict))} · ${verdict.score}%</text>
  <text x="48" y="196" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#52525b">Вердикт «AI + сообщество» · ${verdict.totalVotes} голосов · уверенность ${verdict.confidenceLevel === 'high' ? 'высокая' : verdict.confidenceLevel === 'medium' ? 'средняя' : 'низкая'}</text>
  <line x1="48" y1="222" x2="${W - 48}" y2="222" stroke="#e4e4e7" stroke-width="2"/>
  <text x="48" y="256" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#3f3f46">ID сертификата: ${esc(data.certificateId)}</text>
  <text x="48" y="280" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#3f3f46">Выпущен: ${esc(data.issuedAt)}</text>
  <text x="48" y="304" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#3f3f46">Отсканируйте QR, чтобы проверить вердикт в приложении</text>
  <g>${renderQrSvg(postUrl, qrX, qrY, qrCell)}</g>
  <text x="48" y="${H - 44}" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#a1a1aa">Бесплатная проверка подлинности · Autograph</text>
</svg>`;

    const fileName = `autograph-certificate-${data.certificateId}.svg`;
    return { svg, dataUrl: toDataUrl(svg), fileName };
}

/** Base64-кодирует SVG в data-URL (UTF-8 безопасно). */
function toDataUrl(svg: string): string {
    const base64 =
        typeof btoa !== 'undefined'
            ? btoa(unescape(encodeURIComponent(svg)))
            : Buffer.from(svg, 'utf8').toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
}

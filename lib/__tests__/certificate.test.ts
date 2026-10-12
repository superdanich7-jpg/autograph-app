/**
 * Unit Tests — lib/certificate.ts
 * Генерация SVG-сертификата подлинности с QR (CEO-идея #7).
 */

import { Post } from '../../context/PostsContext';
import { buildCertificateSvg } from '../certificate';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'abcd1234-5678-90ab-cdef-000000000000',
    ownerId: null,
    ownerName: 'Tester',
    uri: 'file://test.jpg',
    caption: '',
    timestamp: new Date().toISOString(),
    likes: 0,
    liked: false,
    saved: false,
    comments: [],
    celebrityName: 'Lionel Messi',
    location: 'Москва',
    dateReceived: '01.01.2026',
    category: 'sports',
    rarity: 'legendary',
    evidence: ['photo', 'certificate'],
    isAnalyzed: true,
    aiConfidence: 88,
    aiSuggestion: 'Messi',
    realVotes: 5,
    fakeVotes: 1,
    realScore: 10,
    fakeScore: 2,
    votesByUser: {},
    voteWeightsByUser: {},
    ...overrides,
  };
}

describe('buildCertificateSvg', () => {
  const url = 'autograph://post/abcd1234';

  test('возвращает валидный SVG с объявлением xmlns', () => {
    const { svg } = buildCertificateSvg(makePost(), url);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
  });

  test('содержит имя знаменитости', () => {
    const { svg } = buildCertificateSvg(makePost({ celebrityName: 'Mike Tyson' }), url);
    expect(svg).toContain('Mike Tyson');
  });

  test('содержит ID сертификата вида AG-XXXX', () => {
    const { svg, fileName } = buildCertificateSvg(makePost(), url);
    expect(svg).toMatch(/AG-[A-Z0-9]{4,}/);
    expect(fileName).toMatch(/^autograph-certificate-AG-.*\.svg$/);
  });

  test('экранирует потенциально опасные символы в имени', () => {
    const { svg } = buildCertificateSvg(makePost({ celebrityName: '<script>&"' }), url);
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });

  test('встраивает QR-код (есть чёрные прямоугольники)', () => {
    const { svg } = buildCertificateSvg(makePost(), url);
    expect(svg).toContain('fill="#0b0b0f"');
    // QR даёт много модулей → много <rect>.
    const rectCount = (svg.match(/<rect /g) || []).length;
    expect(rectCount).toBeGreaterThan(20);
  });

  test('dataUrl — корректный base64 data URL', () => {
    const { dataUrl } = buildCertificateSvg(makePost(), url);
    expect(dataUrl.startsWith('data:image/svg+xml;base64,')).toBe(true);
    const base64 = dataUrl.split(',')[1];
    expect(base64.length).toBeGreaterThan(0);
  });

  test('вердикт подлинный окрашивает акцент в зелёный', () => {
    const { svg } = buildCertificateSvg(makePost(), url);
    expect(svg).toContain('#16a34a');
  });

  test('вердикт подделки окрашивает акцент в красный', () => {
    const { svg } = buildCertificateSvg(
      makePost({
        isAnalyzed: false,
        aiConfidence: undefined,
        aiSuggestion: undefined,
        realScore: 0,
        fakeScore: 10,
        realVotes: 0,
        fakeVotes: 8,
        evidence: ['photo'],
      }),
      url
    );
    expect(svg).toContain('#dc2626');
  });

  test('детерминирован для одного и того же входа (кроме даты выпуска)', () => {
    const a = buildCertificateSvg(makePost(), url).svg;
    const b = buildCertificateSvg(makePost(), url).svg;
    // ID и структура идентичны; дата может совпасть в тот же день.
    expect(a).toBe(b);
  });
});

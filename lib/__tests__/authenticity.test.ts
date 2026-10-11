import { Post } from '../../context/PostsContext';
import {
    buildCertificateData,
    formatCertificateShareText,
    getAuthenticityVerdict,
    getEvidenceScore,
    getVerdictLabel,
} from '../authenticity';

function makePost(overrides: Partial<Post> = {}): Post {
    return {
        id: 'test-post-12345678',
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
        rarity: 'common',
        evidence: ['photo'],
        isAnalyzed: false,
        realVotes: 0,
        fakeVotes: 0,
        realScore: 0,
        fakeScore: 0,
        votesByUser: {},
        voteWeightsByUser: {},
        ...overrides,
    };
}

describe('getEvidenceScore', () => {
    it('возвращает 0 без доказательств', () => {
        expect(getEvidenceScore([])).toBe(0);
    });

    it('сертификат даёт больший бонус, чем фото', () => {
        expect(getEvidenceScore(['certificate'])).toBeGreaterThan(getEvidenceScore(['photo']));
    });

    it('оценивает в пределах 0-100', () => {
        const score = getEvidenceScore(['certificate', 'video', 'selfie', 'ticket', 'photo']);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    it('имеет затухание: 5 фото < 5 разных пруфов', () => {
        const manyPhotos = getEvidenceScore(['photo', 'photo', 'photo', 'photo', 'photo']);
        const mixed = getEvidenceScore(['certificate', 'video', 'selfie', 'ticket', 'photo']);
        expect(mixed).toBeGreaterThan(manyPhotos);
    });
});

describe('getAuthenticityVerdict', () => {
    it('без данных → inconclusive со скором ~50', () => {
        const v = getAuthenticityVerdict(makePost({ evidence: [] }));
        expect(v.verdict).toBe('inconclusive');
        expect(v.confidenceLevel).toBe('low');
    });

    it('высокий AI + много реальных голосов → genuine', () => {
        const v = getAuthenticityVerdict(makePost({
            isAnalyzed: true,
            aiConfidence: 90,
            realScore: 12,
            realVotes: 12,
            evidence: ['certificate', 'photo'],
        }));
        expect(v.verdict).toBe('genuine');
        expect(v.score).toBeGreaterThanOrEqual(70);
        expect(v.colorHint).toBe('success');
    });

    it('высокий AI + много фейковых голосов → likely-fake', () => {
        const v = getAuthenticityVerdict(makePost({
            isAnalyzed: true,
            aiConfidence: 20,
            fakeScore: 12,
            fakeVotes: 12,
            evidence: [],
        }));
        expect(v.verdict).toBe('likely-fake');
        expect(v.colorHint).toBe('danger');
    });

    it('равные голоса → disputed (приоритетнее score)', () => {
        const v = getAuthenticityVerdict(makePost({
            isAnalyzed: true,
            aiConfidence: 95,
            realScore: 3,
            fakeScore: 3,
            realVotes: 3,
            fakeVotes: 3,
            evidence: ['certificate'],
        }));
        expect(v.verdict).toBe('disputed');
        expect(v.colorHint).toBe('warning');
    });

    it('communityScore = null когда нет голосов', () => {
        const v = getAuthenticityVerdict(makePost({ evidence: ['photo'] }));
        expect(v.communityScore).toBeNull();
        expect(v.aiScore).toBeNull();
    });

    it('много голосов → высокий уровень уверенности', () => {
        const v = getAuthenticityVerdict(makePost({ realScore: 10, realVotes: 10 }));
        expect(v.confidenceLevel).toBe('high');
    });

    it('score всегда в диапазоне 0-100', () => {
        const v = getAuthenticityVerdict(makePost({
            isAnalyzed: true, aiConfidence: 150, realScore: 99, evidence: ['certificate'],
        }));
        expect(v.score).toBeLessThanOrEqual(100);
        expect(v.score).toBeGreaterThanOrEqual(0);
    });
});

describe('getVerdictLabel', () => {
    it('возвращает русские подписи', () => {
        expect(getVerdictLabel('genuine')).toBe('Вероятно подлинный');
        expect(getVerdictLabel('likely-fake')).toBe('Вероятно подделка');
        expect(getVerdictLabel('disputed')).toBe('Спорный');
        expect(getVerdictLabel('inconclusive')).toBe('Недостаточно данных');
    });
});

describe('buildCertificateData', () => {
    it('генерирует детерминированный ID сертификата', () => {
        const post = makePost({ id: 'abcdef1234567890' });
        const data = buildCertificateData(post);
        expect(data.certificateId).toBe('AG-ABCDEF12');
    });

    it('содержит вердикт и имя знаменитости', () => {
        const data = buildCertificateData(makePost({ celebrityName: 'Michael Jordan' }));
        expect(data.celebrityName).toBe('Michael Jordan');
        expect(data.verdict).toBeDefined();
        expect(data.issuedAt).toBeTruthy();
    });
});

describe('formatCertificateShareText', () => {
    it('включает вердикт, ID и URL', () => {
        const post = makePost();
        const text = formatCertificateShareText(post, 'autograph://post/xyz');
        expect(text).toContain('Сертификат подлинности');
        expect(text).toContain('AG-');
        expect(text).toContain('autograph://post/xyz');
    });

    it('работает без URL', () => {
        const text = formatCertificateShareText(makePost(), '');
        expect(text).toContain('Сертификат подлинности');
        expect(text).not.toContain('Проверить:');
    });
});

/**
 * Authenticity Verdict — ядро нашего УТП.
 *
 * Объединяет три сигнала в единый вердикт подлинности автографа:
 *   1. AI-анализ подписи (lib/signature-analyzer) — совпадение с эталоном
 *   2. Голоса сообщества (real/fake, взвешенные)
 *   3. Доказательства владельца (фото, сертификат, видео...)
 *
 * В отличие от платных сервисов (Signatrue и т.п.), наш вердикт
 * бесплатный и усилен социальным сигналом — «crowd + AI».
 *
 * Логика чистая и детерминированная → покрыта unit-тестами.
 */

import { EvidenceType, Post } from '../context/PostsContext';
import { getAuthenticity, isDisputed } from './helpers';

export type Verdict = 'genuine' | 'likely-fake' | 'disputed' | 'inconclusive';
export type ColorHint = 'success' | 'danger' | 'warning' | 'info';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type AuthenticityVerdict = {
    verdict: Verdict;
    score: number;
    aiScore: number | null;
    communityScore: number | null;
    evidenceScore: number;
    totalVotes: number;
    label: string;
    colorHint: ColorHint;
    confidenceLevel: ConfidenceLevel;
};

/** Бонус за каждое доказательство. Чем «тяжелее» доказательство, тем выше. */
const EVIDENCE_WEIGHTS: Record<EvidenceType, number> = {
    certificate: 30,
    video: 22,
    selfie: 18,
    ticket: 14,
    photo: 10,
};

/**
 * Считает бонус за доказательства (0-100) с затуханием от количества.
 */
export function getEvidenceScore(evidence: EvidenceType[]): number {
    if (!evidence || evidence.length === 0) return 0;
    const total = evidence.reduce((sum, item) => sum + (EVIDENCE_WEIGHTS[item] ?? 0), 0);
    const diminishing = Math.log2(1 + evidence.length);
    const raw = Math.min(total, 100) * Math.min(diminishing, 1.6) / 1.6;
    return Math.round(Math.max(0, Math.min(100, raw)));
}

/**
 * Главная функция: объединяет AI + сообщество + доказательства в вердикт.
 */
export function getAuthenticityVerdict(post: Post): AuthenticityVerdict {
    const authenticity = getAuthenticity(post);
    const evidenceScore = getEvidenceScore(post.evidence);

    const aiScore = post.isAnalyzed && typeof post.aiConfidence === 'number'
        ? Math.max(0, Math.min(100, post.aiConfidence))
        : null;

    const communityScore = authenticity.totalScore > 0 ? authenticity.confidence : null;

    const WEIGHT_AI = 40;
    const WEIGHT_COMMUNITY = 40;
    const WEIGHT_EVIDENCE = 20;

    let weightSum = 0;
    let weightedSum = 0;

    if (aiScore !== null) {
        weightedSum += aiScore * WEIGHT_AI;
        weightSum += WEIGHT_AI;
    }
    if (communityScore !== null) {
        weightedSum += communityScore * WEIGHT_COMMUNITY;
        weightSum += WEIGHT_COMMUNITY;
    }
    if (post.evidence && post.evidence.length > 0) {
        weightedSum += evidenceScore * WEIGHT_EVIDENCE;
        weightSum += WEIGHT_EVIDENCE;
    }

    const score = weightSum === 0 ? 50 : Math.round(weightedSum / weightSum);

    let verdict: Verdict;
    if (isDisputed(post)) {
        verdict = 'disputed';
    } else if (score >= 70) {
        verdict = 'genuine';
    } else if (score <= 35) {
        verdict = 'likely-fake';
    } else {
        verdict = 'inconclusive';
    }

    const dataPoints = (aiScore !== null ? 1 : 0) + (communityScore !== null ? 1 : 0) + (post.evidence?.length ?? 0);
    let confidenceLevel: ConfidenceLevel;
    if (authenticity.totalVotes >= 5 || (aiScore !== null && (post.evidence?.length ?? 0) >= 2)) {
        confidenceLevel = 'high';
    } else if (authenticity.totalVotes >= 2 || dataPoints >= 2) {
        confidenceLevel = 'medium';
    } else {
        confidenceLevel = 'low';
    }

    return {
        verdict,
        score,
        aiScore,
        communityScore,
        evidenceScore,
        totalVotes: authenticity.totalVotes,
        label: getVerdictLabel(verdict),
        colorHint: getVerdictColorHint(verdict),
        confidenceLevel,
    };
}

export function getVerdictLabel(verdict: Verdict): string {
    switch (verdict) {
        case 'genuine': return 'Вероятно подлинный';
        case 'likely-fake': return 'Вероятно подделка';
        case 'disputed': return 'Спорный';
        default: return 'Недостаточно данных';
    }
}

export function getVerdictColorHint(verdict: Verdict): ColorHint {
    switch (verdict) {
        case 'genuine': return 'success';
        case 'likely-fake': return 'danger';
        case 'disputed': return 'warning';
        default: return 'info';
    }
}

/**
 * Данные для шейрабл-сертификата подлинности.
 * Наш козырь vs платные аналоги: сертификат бесплатный, с QR-ссылкой
 * на пост и объединённым вердиктом «AI + сообщество».
 */
export function buildCertificateData(post: Post): {
    verdict: AuthenticityVerdict;
    certificateId: string;
    issuedAt: string;
    celebrityName: string;
    postUrl: string;
} {
    const verdict = getAuthenticityVerdict(post);
    const certificateId = `AG-${post.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || 'XXXX'}`;
    return {
        verdict,
        certificateId,
        issuedAt: new Date().toLocaleDateString('ru-RU'),
        celebrityName: post.celebrityName,
        postUrl: post.id,
    };
}

/** Текст для шейринга сертификата. */
export function formatCertificateShareText(post: Post, postUrl: string): string {
    const data = buildCertificateData(post);
    const { verdict } = data;
    return [
        '🔏 Сертификат подлинности Autograph',
        `${verdict.label} — ${verdict.score}%`,
        `Автограф: ${data.celebrityName}`,
        `ID сертификата: ${data.certificateId}`,
        `Вердикт «AI + сообщество» (${verdict.totalVotes} голосов)`,
        postUrl ? `\nПроверить: ${postUrl}` : '',
    ].filter(Boolean).join('\n');
}


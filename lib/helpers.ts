import { EvidenceType, Post, POST_CATEGORIES, PostCategory } from '../context/PostsContext';

/**
 * Вычисляет процент достоверности автографа на основе голосов сообщества.
 */
export function getAuthenticity(post: Post): { totalVotes: number; totalScore: number; confidence: number } {
    const totalVotes = post.realVotes + post.fakeVotes;
    const totalScore = post.realScore + post.fakeScore;
    return {
        totalVotes,
        totalScore,
        confidence: totalScore === 0 ? 0 : Math.round((post.realScore / totalScore) * 100),
    };
}

/**
 * Возвращает только процент достоверности (упрощенная версия).
 */
export function getAuthenticityPercent(post: Post): number {
    const totalScore = post.realScore + post.fakeScore;
    return totalScore === 0 ? 0 : Math.round((post.realScore / totalScore) * 100);
}

/**
 * Проверяет, является ли автограф спорным (голоса сообщества разделились).
 */
export function isDisputed(post: Post): boolean {
    const totalScore = post.realScore + post.fakeScore;
    return totalScore >= 2 && Math.abs(post.realScore - post.fakeScore) <= 1;
}

/**
 * Возвращает читаемое название категории.
 */
export function getCategoryLabel(category: PostCategory): string {
    return POST_CATEGORIES.find((item) => item.value === category)?.label ?? 'Другое';
}

/**
 * Возвращает читаемое название редкости.
 */
export function getRarityLabel(rarity: Post['rarity']): string {
    if (rarity === 'legendary') return 'Легендарный';
    if (rarity === 'rare') return 'Редкий';
    return 'Обычный';
}

/**
 * Возвращает читаемое название типа доказательства.
 */
export function getEvidenceLabel(value: EvidenceType): string {
    const map: Record<EvidenceType, string> = {
        photo: 'Фото',
        selfie: 'Селфи',
        ticket: 'Билет',
        video: 'Видео',
        certificate: 'Сертификат',
    };
    return map[value];
}

/**
 * Генерирует уникальный ID на основе crypto.randomUUID.
 */
export function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback для окружений без crypto
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
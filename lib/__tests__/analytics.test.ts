/**
 * Тесты lib/analytics.ts (R-17).
 * Ключ НЕ задан -> строгий no-op; ничего не уходит в сеть.
 */
import { _queueForTests, _resetForTests, flush, isAnalyticsConfigured, track } from '../analytics';

describe('analytics (без ключа = no-op)', () => {
    beforeEach(() => {
        _resetForTests();
    });

    it('isAnalyticsConfigured=false пока EXPO_PUBLIC_POSTHOG_KEY не задан', () => {
        expect(isAnalyticsConfigured()).toBe(false);
    });

    it('track не кладёт события в очередь без ключа', () => {
        track('post_created', { category: 'sports' });
        expect(_queueForTests()).toHaveLength(0);
    });

    it('flush без ключа — тихий no-op (не бросает)', async () => {
        await expect(flush()).resolves.toBeUndefined();
    });
});

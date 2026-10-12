/**
 * Unit Tests — lib/trust.ts
 * Уровни доверия коллекционера (видимый статус как в Reddit/StackOverflow).
 */

import { getTrustTier } from '../trust';

describe('getTrustTier', () => {
  test('новичок при низком score', () => {
    expect(getTrustTier(0).tier).toBe('newcomer');
    expect(getTrustTier(39).tier).toBe('newcomer');
  });

  test('проверенный с 40', () => {
    expect(getTrustTier(40).tier).toBe('verified');
    expect(getTrustTier(69).tier).toBe('verified');
  });

  test('эксперт с 70', () => {
    expect(getTrustTier(70).tier).toBe('expert');
    expect(getTrustTier(89).tier).toBe('expert');
  });

  test('авторитет с 90', () => {
    expect(getTrustTier(90).tier).toBe('authority');
    expect(getTrustTier(150).tier).toBe('authority');
  });

  test('границы ровно на пороге', () => {
    expect(getTrustTier(40).label).toBe('Проверенный');
    expect(getTrustTier(70).label).toBe('Эксперт');
    expect(getTrustTier(90).label).toBe('Авторитет');
  });

  test('каждый тир несёт иконку и цвет', () => {
    for (const s of [0, 40, 70, 90]) {
      const t = getTrustTier(s);
      expect(t.icon.length).toBeGreaterThan(0);
      expect(t.label.length).toBeGreaterThan(0);
      expect(['info', 'success', 'warning', 'primary']).toContain(t.colorHint);
    }
  });
});

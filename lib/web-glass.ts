/**
 * Web-only: CSS для liquid glass.
 * 1) RNW вырезает backdropFilter из StyleSheet — blur приносим готовым правилом
 *    по data-testid="glass-card" (его рендерят GlassCard и TabBar).
 * 2) react-navigation красит сцены DefaultTheme'ом (rgb(242,242,242)) — на web
 *    делаем сцены прозрачными, чтобы сквозь них был виден градиентный фон.
 * Идемпотентно: один <style> на документ.
 */

export function ensureWebGlassCss(): void {
    if (typeof document === 'undefined') return;
    const STYLE_ID = 'glass-css';
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.textContent = [
        '[data-testid="glass-card"] {',
        '  backdrop-filter: blur(28px) saturate(170%);',
        '  -webkit-backdrop-filter: blur(28px) saturate(170%);',
        '}',
        'div[style*="rgb(242, 242, 242)"] {',
        '  background-color: transparent !important;',
        '}',
    ].join('\n');
    document.head.appendChild(tag);
}

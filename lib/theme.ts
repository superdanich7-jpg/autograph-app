/**
 * Design System — современная система дизайна.
 * Следует принципам Material Design 3 и Apple HIG:
 * - Единая палитра цветов
 * - Масштабы типографики
 * - Пространственные токены
 * - Тени и радиусы
 */

// ─── Color Palette ─────────────────────────────

const palette = {
  // Blues
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',

  // Grays
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  gray950: '#020617',

  // Greens
  green500: '#22C55E',
  green600: '#16A34A',

  // Reds
  red500: '#EF4444',
  red600: '#DC2626',

  // Ambers
  amber400: '#FBBF24',
  amber500: '#F59E0B',

  // Purples
  purple500: '#A855F7',
  purple600: '#9333EA',
};

// ─── Light Theme ───────────────────────────────

export const lightTheme = {
  // Backgrounds
  background: palette.gray50,
  surface: palette.gray100,
  card: '#FFFFFF',

  // Text
  text: palette.gray900,
  textSecondary: palette.gray500,
  textTertiary: palette.gray400,
  placeholder: palette.gray400,

  // Borders
  border: palette.gray200,
  borderLight: palette.gray100,

  // Primary
  primary: palette.blue600,
  primaryLight: palette.blue100,
  primaryText: '#FFFFFF',

  // Semantic
  success: palette.green500,
  successLight: '#DCFCE7',
  danger: palette.red500,
  dangerLight: '#FEE2E2',
  warning: palette.amber500,
  warningLight: '#FEF3C7',
  info: palette.blue500,
  infoLight: palette.blue50,

  // Shadows (iOS)
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,

  // Elevation (Android)
  elevation: 2,
};

// ─── Dark Theme ────────────────────────────────

export const darkTheme = {
  // Backgrounds
  background: palette.gray950,
  surface: palette.gray900,
  card: palette.gray800,

  // Text
  text: palette.gray50,
  textSecondary: palette.gray400,
  textTertiary: palette.gray500,
  placeholder: palette.gray500,

  // Borders
  border: palette.gray700,
  borderLight: palette.gray800,

  // Primary
  primary: palette.blue500,
  primaryLight: palette.blue700,
  primaryText: '#FFFFFF',

  // Semantic
  success: palette.green500,
  successLight: '#052E16',
  danger: palette.red500,
  dangerLight: '#450A0A',
  warning: palette.amber400,
  warningLight: '#422006',
  info: palette.blue400,
  infoLight: '#172554',

  // Shadows
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,

  elevation: 8,
};

// ─── Typography ────────────────────────────────

export const typography = {
  // Display
  displayLarge: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },

  // Heading
  h1: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  h2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
  },

  // Body
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },

  // Label
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
  },

  // Caption
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
};

// ─── Spacing ───────────────────────────────────

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
} as const;

// ─── Border Radius ─────────────────────────────

export const radii = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
} as const;

// ─── Shadows ───────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
};
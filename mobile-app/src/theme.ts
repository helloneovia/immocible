// Jetons de design de l'app native.
// Fond gris « groupé » façon réglages iOS, surfaces blanches, nuit (marine) pour
// les actions et cartes fortes, or comme unique accent — repris du logo (la cible).
export const palette = {
  navy: '#0B1F38',
  navyDeep: '#071526',
  navySoft: '#1B3150',
  gold: '#E0A93B',
  goldLight: '#F0CF86',
  goldDeep: '#A87A22',
  goldSoft: '#FBF1DC',
  ink: '#101828',
  text2: '#5B6475',
  text3: '#98A1B0',
  bg: '#F2F3F6',
  surface: '#FFFFFF',
  fill: '#E9ECF1',
  separator: '#E1E4EA',
  success: '#1F9D6B',
  successSoft: '#E4F4EC',
  danger: '#D64545',
  dangerSoft: '#FBEAEA',
}

export const colors = {
  ...palette,
  // Alias conservés pour les écrans et composants existants.
  background: palette.bg,
  white: palette.surface,
  slate800: '#1F2937',
  slate700: '#3B4455',
  slate600: '#4E5768',
  slate500: palette.text2,
  slate400: palette.text3,
  slate300: '#C5CBD5',
  slate200: palette.separator,
  slate100: palette.fill,
  slate50: '#F6F7F9',
  amber400: palette.goldLight,
  amber500: palette.gold,
  amber600: palette.goldDeep,
  amber100: '#F6E3BC',
  amber50: palette.goldSoft,
  emerald500: palette.success,
  emerald700: '#15784F',
  emerald50: palette.successSoft,
  red600: '#C23B3B',
  red500: palette.danger,
  red200: '#F2C4C4',
  red50: palette.dangerSoft,
  overlay: 'rgba(7, 21, 38, 0.72)',
}

export const fonts = {
  serif: 'PlayfairDisplay_700Bold',
  serifSemi: 'PlayfairDisplay_600SemiBold',
  light: 'Inter_300Light',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
}

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 999,
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screen: 16,
}

export const shadow = {
  card: {
    shadowColor: '#0B1F38',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  raised: {
    shadowColor: '#0B1F38',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
}

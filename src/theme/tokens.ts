export const colors = {
  bg: "#f4f2ed",
  bgCard: "#eae8e2",
  bgInput: "#ffffff",
  bgDark: "#2a2825",
  text: "#2a2825",
  textMid: "#57534e",
  textMuted: "#7a7670",
  textLight: "#a8a29e",
  accent: "#b5503a",
  accentHover: "#9e4432",
  accentSoft: "rgba(181, 80, 58, 0.07)",
  accentGlow: "rgba(181, 80, 58, 0.15)",
  green: "#5a7a5e",
  greenSoft: "rgba(90, 122, 94, 0.1)",
  amber: "#a68a3e",
  amberSoft: "rgba(166, 138, 62, 0.1)",
  redSoft: "rgba(181, 80, 58, 0.08)",
  border: "#d9d5cd",
  borderLight: "#e8e5de",
  white: "#ffffff",
} as const;

export const fonts = {
  serif: "EBGaramond_400Regular",
  serifMedium: "EBGaramond_500Medium",
  serifSemiBold: "EBGaramond_600SemiBold",
  serifItalic: "EBGaramond_400Regular_Italic",
  sans: "DMSans_400Regular",
  sansLight: "DMSans_300Light",
  sansMedium: "DMSans_500Medium",
  sansSemiBold: "DMSans_600SemiBold",
  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const shadow = {
  sm: {
    shadowColor: "#2a2825",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: "#2a2825",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;

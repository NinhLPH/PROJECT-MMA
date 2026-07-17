export const COLORS = {
  background: "#0B0B0D",
  surface: "#17171B",
  surfaceElevated: "#222228",
  border: "#35353D",
  textPrimary: "#FAFAFA",
  textSecondary: "#B7B7C2",
  textMuted: "#7E7E8B",
  primary: "#E11D48",
  primaryPressed: "#BE123C",
  primarySoft: "#4A1222",
  danger: "#F87171",
  dangerSoft: "#4A191E",
  success: "#4ADE80",
  successSoft: "#123523",
  warning: "#FBBF24",
  warningSoft: "#4A3510",
  info: "#60A5FA",
  infoSoft: "#172A4A",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0, 0, 0, 0.68)",
} as const;

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const FONT_FAMILIES = {
  regular: "Montserrat_400Regular",
  medium: "Montserrat_500Medium",
  semibold: "Montserrat_600SemiBold",
  bold: "Montserrat_700Bold",
  extraBold: "Montserrat_800ExtraBold",
} as const;

export const SHADOWS = {
  card: {
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
} as const;

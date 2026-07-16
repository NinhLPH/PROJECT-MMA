import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_FAMILIES, RADIUS, SPACING } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
};

const variants = {
  primary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, color: COLORS.white },
  secondary: { backgroundColor: COLORS.surfaceElevated, borderColor: COLORS.surfaceElevated, color: COLORS.textPrimary },
  outline: { backgroundColor: "transparent", borderColor: COLORS.border, color: COLORS.textPrimary },
  danger: { backgroundColor: COLORS.dangerSoft, borderColor: COLORS.danger, color: COLORS.danger },
} as const;

const sizes = {
  sm: { minHeight: 44, paddingHorizontal: SPACING.md },
  md: { minHeight: 48, paddingHorizontal: SPACING.lg },
  lg: { minHeight: 54, paddingHorizontal: SPACING.xl },
} as const;

export function AppButton({
  label,
  onPress,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  accessibilityLabel,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const colors = variants[variant];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        sizes[size],
        colors,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.color} />
      ) : (
        <Text style={[styles.label, { color: colors.color }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.45,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  label: {
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});

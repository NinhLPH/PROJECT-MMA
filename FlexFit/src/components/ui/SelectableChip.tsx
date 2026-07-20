import { Platform, Pressable, StyleSheet, Text } from "react-native";

import { COLORS, FONT_FAMILIES, RADIUS, SPACING } from "@/constants/theme";

type SelectableChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function SelectableChip({
  label,
  selected = false,
  disabled = false,
  onPress,
}: SelectableChipProps) {
  return (
    <Pressable
      android_ripple={{ color: "rgba(255, 255, 255, 0.14)" }}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        disabled && styles.disabled,
        pressed && !disabled && Platform.OS !== "android" && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    overflow: "hidden",
    paddingHorizontal: SPACING.md,
  },
  disabled: {
    opacity: 0.35,
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.semibold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.8,
  },
  selected: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  selectedLabel: {
    color: COLORS.white,
  },
});

import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_FAMILIES, SPACING } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

type InfoRowProps = {
  label: string;
  value: string;
  emphasized?: boolean;
};

export function InfoRow({ label, value, emphasized = false }: InfoRowProps) {
  const { isCompact } = useResponsiveLayout();

  return (
    <View style={[styles.row, isCompact && styles.rowCompact]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, emphasized && styles.emphasized]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emphasized: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
  },
  label: {
    color: COLORS.textSecondary,
    flex: 1,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 13,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.md,
    justifyContent: "space-between",
    paddingVertical: SPACING.xs,
  },
  rowCompact: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: SPACING.xxs,
  },
  value: {
    color: COLORS.textPrimary,
    flexShrink: 1,
    fontFamily: FONT_FAMILIES.semibold,
    fontSize: 13,
    textAlign: "right",
  },
});

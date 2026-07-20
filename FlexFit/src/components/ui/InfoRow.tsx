import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_FAMILIES, SPACING } from "@/constants/theme";

type InfoRowProps = {
  label: string;
  value: string;
  emphasized?: boolean;
};

export function InfoRow({ label, value, emphasized = false }: InfoRowProps) {
  return (
    <View style={styles.row}>
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
  value: {
    color: COLORS.textPrimary,
    flexShrink: 1,
    fontFamily: FONT_FAMILIES.semibold,
    fontSize: 13,
    textAlign: "right",
  },
});

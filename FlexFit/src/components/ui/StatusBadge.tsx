import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_FAMILIES, RADIUS, SPACING } from "@/constants/theme";
import type { BookingStatus } from "@/types/domain";

type StatusBadgeProps = {
  status: BookingStatus;
};

const statusDetails: Record<BookingStatus, { color: string; label: string; surface: string }> = {
  pending: { color: COLORS.warning, label: "Chờ xác nhận", surface: COLORS.warningSoft },
  confirmed: { color: COLORS.info, label: "Đã xác nhận", surface: COLORS.infoSoft },
  completed: { color: COLORS.success, label: "Đã hoàn thành", surface: COLORS.successSoft },
  cancelled: { color: COLORS.danger, label: "Đã hủy", surface: COLORS.dangerSoft },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const details = statusDetails[status];

  return (
    <View
      accessibilityLabel={`Trạng thái: ${details.label}`}
      style={[styles.badge, { backgroundColor: details.surface, borderColor: details.color }]}
    >
      <View style={[styles.dot, { backgroundColor: details.color }]} />
      <Text style={[styles.label, { color: details.color }]}>{details.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.xs,
    minHeight: 28,
    paddingHorizontal: SPACING.sm,
  },
  dot: {
    borderRadius: RADIUS.pill,
    height: 6,
    width: 6,
  },
  label: {
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 11,
  },
});

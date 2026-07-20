import { StyleSheet, Text, View } from "react-native";

import { AppAvatar } from "@/components/ui/AppAvatar";
import { InfoRow } from "@/components/ui/InfoRow";
import { COLORS, FONT_FAMILIES, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import type { Trainer } from "@/models/trainer";
import { formatVnd } from "@/utils/formatters";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

type BookingSummaryCardProps = {
  dateLabel: string;
  durationLabel: string;
  timeSlot: string;
  totalPrice: number;
  trainer: Trainer;
};

export function BookingSummaryCard({
  dateLabel,
  durationLabel,
  timeSlot,
  totalPrice,
  trainer,
}: BookingSummaryCardProps) {
  const { isCompact } = useResponsiveLayout();

  return (
    <View style={styles.card}>
      <View style={styles.redRule} />
      <View style={[styles.trainerRow, isCompact && styles.trainerRowCompact]}>
        <AppAvatar
          label={`Image ${trainer.fullName}`}
          size={64}
          source={trainer.avatar}
        />
        <View style={styles.trainerCopy}>
          <Text style={styles.kicker}>HUẤN LUYỆN VIÊN</Text>
          <Text style={styles.trainerName}>{trainer.fullName}</Text>
          <Text style={styles.specialty}>{trainer.specialty}</Text>
        </View>
      </View>

      <View style={styles.divider} />
      <InfoRow label="Ngày tập" value={dateLabel} />
      <InfoRow label="Khung giờ" value={timeSlot} />
      <InfoRow label="Thời lượng" value={durationLabel} />
      <InfoRow label="Đơn giá" value={`${formatVnd(trainer.pricePerHour)} / giờ`} />

      <View style={[styles.totalBand, isCompact && styles.totalBandCompact]}>
        <View>
          <Text style={styles.totalLabel}>TỔNG CHI PHÍ DỰ KIẾN</Text>
        </View>
        <Text style={styles.totalValue}>{formatVnd(totalPrice)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...SHADOWS.card,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: "hidden",
    padding: SPACING.lg,
  },
  redRule: {
    backgroundColor: COLORS.primary,
    height: 4,
    left: SPACING.lg,
    position: "absolute",
    top: 0,
    width: 64,
  },
  trainerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.md,
  },
  trainerRowCompact: {
    alignItems: "flex-start",
    flexDirection: "column",
  },
  trainerCopy: {
    flex: 1,
  },
  kicker: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  trainerName: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 18,
    fontStyle: "italic",
    marginTop: SPACING.xxs,
  },
  specialty: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    marginTop: SPACING.xxs,
  },
  divider: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: SPACING.md,
  },
  totalBand: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    justifyContent: "space-between",
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  totalBandCompact: {
    alignItems: "flex-start",
    flexDirection: "column",
  },
  totalLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  totalHint: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 9,
    marginTop: SPACING.xxs,
  },
  totalValue: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 20,
  },
});

import { StyleSheet, Text, View } from "react-native";

import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppButton } from "@/components/ui/AppButton";
import { InfoRow } from "@/components/ui/InfoRow";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { COLORS, FONT_FAMILIES, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import type { Booking } from "@/types/domain";
import { formatVnd } from "@/utils/formatters";

type BookingCardProps = {
  booking: Booking;
  onCancel?: (bookingId: string) => void;
};

const cancellableStatuses = new Set(["pending", "confirmed"]);

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const canCancel = Boolean(onCancel) && cancellableStatuses.has(booking.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.trainer}>
          <AppAvatar label={booking.trainer.fullName} source={booking.trainer.avatar} size={48} />
          <View style={styles.trainerText}>
            <Text numberOfLines={1} style={styles.trainerName}>
              {booking.trainer.fullName}
            </Text>
            <Text numberOfLines={1} style={styles.specialty}>
              {booking.trainer.specialty}
            </Text>
          </View>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      <View style={styles.details}>
        <InfoRow label="Ngày tập" value={booking.date} />
        <InfoRow label="Khung giờ" value={booking.timeSlot} />
        <InfoRow
          label="Thanh toán"
          value={booking.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
        />
        <InfoRow label="Tổng chi phí" value={formatVnd(booking.totalPrice)} emphasized />
      </View>

      {canCancel ? (
        <View style={styles.action}>
          <AppButton
            fullWidth
            label="Hủy lịch"
            onPress={() => onCancel?.(booking.id)}
            variant="danger"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
  },
  card: {
    ...SHADOWS.card,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
  },
  details: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.sm,
    justifyContent: "space-between",
  },
  specialty: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    marginTop: SPACING.xxs,
  },
  trainer: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: SPACING.sm,
  },
  trainerName: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 15,
  },
  trainerText: {
    flex: 1,
  },
});

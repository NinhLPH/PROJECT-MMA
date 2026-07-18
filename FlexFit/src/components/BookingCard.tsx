import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppButton } from "@/components/ui/AppButton";
import { InfoRow } from "@/components/ui/InfoRow";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { COLORS, FONT_FAMILIES, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import type { Booking } from "@/types/domain";
import { formatDateVi, formatVnd } from "@/utils/formatters";

type BookingCardProps = {
  booking: Booking;
  onCancel?: (booking: Booking) => void;
};

const cancellableStatuses = new Set(["pending", "confirmed"]);

export const BookingCard = memo(function BookingCard({ booking, onCancel }: BookingCardProps) {
  const canCancel = Boolean(onCancel) && cancellableStatuses.has(booking.status);

  return (
    <View style={styles.card}>
      <View style={styles.accentRail} />
      <View style={styles.header}>
        <View>
          <Text style={styles.bookingLabel}>BOOKING</Text>
          <Text style={styles.bookingCode}>#{booking.id.slice(-8).toLocaleUpperCase()}</Text>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      <View style={styles.trainerRow}>
        <View style={styles.trainer}>
          <AppAvatar
            label={`Image ${booking.trainer.fullName}`}
            source={booking.trainer.avatar}
            size={56}
          />
          <View style={styles.trainerText}>
            <Text style={styles.trainerKicker}>HUẤN LUYỆN VIÊN</Text>
            <Text numberOfLines={2} style={styles.trainerName}>
              {booking.trainer.fullName}
            </Text>
            <Text numberOfLines={1} style={styles.specialty}>
              {booking.trainer.specialty}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.scheduleBand}>
        <View style={styles.scheduleItem}>
          <SymbolView
            name={{ android: "calendar_today", ios: "calendar", web: "calendar_today" }}
            size={19}
            tintColor={COLORS.primary}
          />
          <View style={styles.scheduleCopy}>
            <Text style={styles.scheduleLabel}>NGÀY TẬP</Text>
            <Text style={styles.scheduleValue}>{formatDateVi(booking.date)}</Text>
          </View>
        </View>
        <View style={styles.scheduleItem}>
          <SymbolView
            name={{ android: "schedule", ios: "clock", web: "schedule" }}
            size={19}
            tintColor={COLORS.primary}
          />
          <View style={styles.scheduleCopy}>
            <Text style={styles.scheduleLabel}>KHUNG GIỜ</Text>
            <Text style={styles.scheduleValue}>{booking.timeSlot}</Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
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
            label="HỦY LỊCH TẬP"
            onPress={() => onCancel?.(booking)}
            variant="danger"
          />
        </View>
      ) : null}
    </View>
  );
});

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
    overflow: "hidden",
    padding: SPACING.md,
    paddingLeft: SPACING.lg,
  },
  accentRail: {
    backgroundColor: COLORS.primary,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 4,
  },
  bookingLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 8,
    letterSpacing: 1.2,
  },
  bookingCode: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 11,
    marginTop: SPACING.xxs,
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
  trainerRow: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
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
    fontSize: 16,
    marginTop: SPACING.xxs,
  },
  trainerKicker: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 8,
    letterSpacing: 1,
  },
  trainerText: {
    flex: 1,
  },
  scheduleBand: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  scheduleItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: SPACING.sm,
  },
  scheduleCopy: {
    flex: 1,
  },
  scheduleLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 8,
    letterSpacing: 1,
  },
  scheduleValue: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.semibold,
    fontSize: 12,
    lineHeight: 18,
    marginTop: SPACING.xxs,
  },
});

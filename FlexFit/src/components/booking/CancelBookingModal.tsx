import { Modal, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { AppButton } from "@/components/ui/AppButton";
import { COLORS, FONT_FAMILIES, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import type { BookingWithTrainer } from "@/models/booking";
import { formatDateVi } from "@/utils/formatters";

type CancelBookingModalProps = {
  booking: BookingWithTrainer | null;
  error?: string | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function CancelBookingModal({
  booking,
  error,
  loading = false,
  onClose,
  onConfirm,
}: CancelBookingModalProps) {
  return (
    <Modal
      animationType="none"
      onRequestClose={() => {
        if (!loading) onClose();
      }}
      statusBarTranslucent
      transparent
      visible={booking !== null}
    >
      <View style={styles.scrim}>
        <View accessibilityViewIsModal style={styles.dialog}>
          <View style={styles.iconFrame}>
            <SymbolView
              name={{ android: "event_busy", ios: "calendar.badge.minus", web: "event_busy" }}
              size={30}
              tintColor={COLORS.danger}
            />
          </View>
          <Text accessibilityRole="header" style={styles.title}>XÁC NHẬN HỦY LỊCH?</Text>
          <Text style={styles.description}>
            Ca tập sẽ được mở lại cho học viên khác. Thao tác này không thể hoàn tác.
          </Text>

          {booking ? (
            <View style={styles.bookingSummary}>
              <Text style={styles.trainerName}>{booking.trainer.fullName}</Text>
              <Text style={styles.schedule}>{formatDateVi(booking.date)}</Text>
              <Text style={styles.schedule}>{booking.timeSlot}</Text>
            </View>
          ) : null}

          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
          ) : null}

          <View style={styles.actions}>
            <AppButton
              disabled={loading}
              fullWidth
              label="GIỮ LỊCH"
              onPress={onClose}
              variant="outline"
            />
            <AppButton
              fullWidth
              label="XÁC NHẬN HỦY"
              loading={loading}
              onPress={onConfirm}
              variant="danger"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    flex: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  dialog: {
    ...SHADOWS.card,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    maxWidth: 480,
    padding: SPACING.xl,
    width: "100%",
  },
  iconFrame: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: COLORS.dangerSoft,
    borderRadius: RADIUS.pill,
    height: 64,
    justifyContent: "center",
    marginBottom: SPACING.md,
    width: 64,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 19,
    fontStyle: "italic",
    textAlign: "center",
  },
  description: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    lineHeight: 19,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  bookingSummary: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.lg,
    padding: SPACING.md,
  },
  trainerName: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  schedule: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 11,
    lineHeight: 17,
  },
  error: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 11,
    lineHeight: 17,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  actions: {
    gap: SPACING.xs,
    marginTop: SPACING.lg,
  },
});

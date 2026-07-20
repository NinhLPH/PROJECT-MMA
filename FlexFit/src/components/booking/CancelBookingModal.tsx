import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { COLORS, FONT_FAMILIES, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
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
  const { contentPadding, height } = useResponsiveLayout();

  return (
    <Modal
      animationType="fade"
      hardwareAccelerated
      navigationBarTranslucent
      onRequestClose={() => {
        if (!loading) onClose();
      }}
      statusBarTranslucent
      transparent
      visible={booking !== null}
    >
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        style={[styles.scrim, { padding: contentPadding }]}
      >
        <View
          accessibilityViewIsModal
          style={[styles.dialog, { maxHeight: Math.max(240, height - 32) }]}
        >
          <ScrollView
            contentContainerStyle={[styles.dialogContent, { padding: contentPadding }]}
            showsVerticalScrollIndicator={false}
          >
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
          </ScrollView>

          <View style={[styles.actions, { padding: contentPadding, paddingTop: SPACING.sm }]}>
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
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    flex: 1,
    justifyContent: "center",
  },
  dialog: {
    ...SHADOWS.card,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    maxWidth: 480,
    overflow: "hidden",
    width: "100%",
  },
  dialogContent: {
    flexGrow: 1,
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
    fontSize: 14,
    lineHeight: 21,
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
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  actions: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    gap: SPACING.xs,
  },
});

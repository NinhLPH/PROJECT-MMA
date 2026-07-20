import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { InfoRow } from "@/components/ui/InfoRow";
import { COLORS, FONT_FAMILIES, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import type { BookingRecord } from "@/models/booking";
import { formatVnd } from "@/utils/formatters";

type BookingSuccessModalProps = {
  booking: BookingRecord | null;
  methodLabel: string;
  onContinue: () => void;
};

export function BookingSuccessModal({ booking, methodLabel, onContinue }: BookingSuccessModalProps) {
  const { contentPadding, height } = useResponsiveLayout();

  return (
    <Modal
      animationType="fade"
      hardwareAccelerated
      navigationBarTranslucent
      onRequestClose={onContinue}
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
            <View style={styles.successIcon}>
              <SymbolView
                name={{ android: "check_circle", ios: "checkmark.circle.fill", web: "check_circle" }}
                size={38}
                tintColor={COLORS.success}
              />
            </View>
            <Text accessibilityRole="header" style={styles.title}>ĐẶT LỊCH THÀNH CÔNG</Text>
            <Text style={styles.description}>
              Ca tập đã được khóa cho bạn. Thanh toán được ghi nhận hoàn tất.
            </Text>

            {booking ? (
              <View style={styles.receipt}>
                <InfoRow label="Mã booking" value={`#${booking.id.slice(-8).toLocaleUpperCase()}`} />
                <InfoRow label="Phương thức" value={methodLabel} />
                <InfoRow label="Trạng thái" value="Đã thanh toán" />
                <View style={styles.divider} />
                <InfoRow emphasized label="Tổng thanh toán" value={formatVnd(booking.totalPrice)} />
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.action, { padding: contentPadding, paddingTop: SPACING.sm }]}>
            <AppButton
              accessibilityLabel="Đóng thông báo và xem lịch tập"
              fullWidth
              label="XEM LỊCH TẬP"
              onPress={onContinue}
              size="lg"
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
  action: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
  },
  successIcon: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: COLORS.successSoft,
    borderRadius: RADIUS.pill,
    height: 72,
    justifyContent: "center",
    marginBottom: SPACING.md,
    width: 72,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 20,
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
  receipt: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.lg,
    padding: SPACING.md,
  },
  divider: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: SPACING.xs,
  },
});

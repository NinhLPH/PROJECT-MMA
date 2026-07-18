import { Modal, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { AppButton } from "@/components/ui/AppButton";
import { InfoRow } from "@/components/ui/InfoRow";
import { COLORS, FONT_FAMILIES, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import type { BookingRecord } from "@/models/booking";
import { formatVnd } from "@/utils/formatters";

type BookingSuccessModalProps = {
  booking: BookingRecord | null;
  methodLabel: string;
  onContinue: () => void;
};

export function BookingSuccessModal({ booking, methodLabel, onContinue }: BookingSuccessModalProps) {
  return (
    <Modal
      animationType="none"
      onRequestClose={onContinue}
      statusBarTranslucent
      transparent
      visible={booking !== null}
    >
      <View style={styles.scrim}>
        <View accessibilityViewIsModal style={styles.dialog}>
          <View style={styles.successIcon}>
            <SymbolView
              name={{ android: "check_circle", ios: "checkmark.circle.fill", web: "check_circle" }}
              size={38}
              tintColor={COLORS.success}
            />
          </View>
          <Text accessibilityRole="header" style={styles.title}>ĐẶT LỊCH THÀNH CÔNG</Text>
          <Text style={styles.description}>
            Ca tập đã được khóa cho bạn. Thanh toán mô phỏng được ghi nhận hoàn tất.
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

          <AppButton
            accessibilityLabel="Đóng thông báo và xem lịch tập"
            fullWidth
            label="XEM LỊCH TẬP"
            onPress={onContinue}
            size="lg"
          />
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
    fontSize: 12,
    lineHeight: 19,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  receipt: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
  },
  divider: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: SPACING.xs,
  },
});

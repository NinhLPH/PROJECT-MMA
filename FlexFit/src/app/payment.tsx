import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { SafeAreaView } from "react-native-safe-area-context";

import { BookingSuccessModal } from "@/components/payment/BookingSuccessModal";
import { BookingSummaryCard } from "@/components/payment/BookingSummaryCard";
import {
  PaymentMethodCard,
  type PaymentMethod,
} from "@/components/payment/PaymentMethodCard";
import { AppButton } from "@/components/ui/AppButton";
import { ApiError } from "@/api/errors";
import { COLORS, FONT_FAMILIES, RADIUS, SPACING } from "@/constants/theme";
import { ROUTES, ROUTE_BUILDERS } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import type { BookingRecord } from "@/models/booking";
import type { Trainer } from "@/models/trainer";
import { bookingService, trainerService } from "@/services";
import { formatVnd } from "@/utils/formatters";

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "momo",
    description: "Xác nhận thanh toán qua ví điện tử",
    icon: "wallet",
    label: "Ví MoMo",
  },
  {
    id: "vnpay",
    description: "Quét mã thanh toán mô phỏng",
    icon: "qr",
    label: "Cổng VNPAY",
  },
  {
    id: "bank-card",
    description: "Thanh toán bằng thẻ nội địa hoặc quốc tế",
    icon: "card",
    label: "Thẻ ngân hàng",
  },
];

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getDurationHours(timeSlot: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)$/.exec(timeSlot);
  if (!match) return null;
  const startMinutes = Number(match[1]) * 60 + Number(match[2]);
  const endMinutes = Number(match[3]) * 60 + Number(match[4]);
  const duration = (endMinutes - startMinutes) / 60;
  return duration > 0 ? duration : null;
}

function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  return date.getFullYear() === Number(match[1])
    && date.getMonth() === Number(match[2]) - 1
    && date.getDate() === Number(match[3]);
}

function formatBookingDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(
    new Date(year, month - 1, day, 12),
  );
}

function formatDuration(value: number): string {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  if (hours === 0) return `${minutes} phút`;
  return minutes === 0 ? `${hours} giờ` : `${hours} giờ ${minutes} phút`;
}

type SubmitRecovery = "reauth" | "reselect" | "retry";

function getSubmitFailure(error: unknown): { message: string; recovery: SubmitRecovery } {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return {
        message: "Ca tập vừa được người khác đặt. Hãy quay lại chọn một ca khác.",
        recovery: "reselect",
      };
    }
    if (error.status === 404) {
      return {
        message: "Ca tập hoặc hồ sơ PT không còn tồn tại. Hãy quay lại cập nhật lịch.",
        recovery: "reselect",
      };
    }
    if (error.status === 401 || error.status === 403) {
      return {
        message: "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại trước khi thanh toán.",
        recovery: "reauth",
      };
    }
  }

  return {
    message: "Chưa thể hoàn tất booking. Hãy kiểm tra kết nối và thử lại.",
    recovery: "retry",
  };
}

export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    date?: string | string[];
    timeSlot?: string | string[];
    trainerId?: string | string[];
  }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const trainerId = getSingleParam(params.trainerId);
  const date = getSingleParam(params.date);
  const timeSlot = getSingleParam(params.timeSlot);
  const durationHours = timeSlot ? getDurationHours(timeSlot) : null;
  const isRouteValid = Boolean(trainerId && date && timeSlot && durationHours && isValidDate(date));
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [createdBooking, setCreatedBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(isRouteValid);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitRecovery, setSubmitRecovery] = useState<SubmitRecovery>("retry");
  const trainerRequestId = useRef(0);

  const loadTrainer = useCallback(async () => {
    if (!trainerId || !isRouteValid) return;
    const requestId = ++trainerRequestId.current;
    setIsLoading(true);
    setLoadError(null);
    try {
      const nextTrainer = await trainerService.getById(trainerId);
      if (requestId === trainerRequestId.current) {
        setTrainer(nextTrainer);
      }
    } catch {
      if (requestId === trainerRequestId.current) {
        setLoadError("Chưa thể tải thông tin PT cho booking này.");
      }
    } finally {
      if (requestId === trainerRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [isRouteValid, trainerId]);

  useEffect(() => {
    void loadTrainer();
    return () => {
      trainerRequestId.current += 1;
    };
  }, [loadTrainer]);

  const estimatedTotal = useMemo(
    () => trainer && durationHours ? trainer.pricePerHour * durationHours : 0,
    [durationHours, trainer],
  );

  const submitBooking = useCallback(async () => {
    if (!trainerId || !date || !timeSlot || !selectedMethod || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const booking = await bookingService.create({ date, timeSlot, trainerId });
      setCreatedBooking(booking);
    } catch (error) {
      const failure = getSubmitFailure(error);
      setSubmitError(failure.message);
      setSubmitRecovery(failure.recovery);
    } finally {
      setIsSubmitting(false);
    }
  }, [date, isSubmitting, selectedMethod, timeSlot, trainerId]);

  const goToBookings = useCallback(() => {
    router.replace(ROUTES.BOOKINGS);
  }, [router]);

  if (!isRouteValid) {
    return (
      <PaymentState
        actionLabel="QUAY LẠI CHỌN LỊCH"
        description="Thông tin PT, ngày hoặc ca tập đang thiếu. Hãy chọn lại lịch trước khi thanh toán."
        onAction={() => router.replace(ROUTES.HOME)}
        title="BOOKING CHƯA HOÀN CHỈNH"
      />
    );
  }

  if (isLoading && !trainer) {
    return <PaymentSkeleton />;
  }

  if (!trainer) {
    return (
      <PaymentState
        actionLabel="THỬ TẢI LẠI"
        description={loadError ?? "Không tìm thấy thông tin PT cho booking này."}
        onAction={() => void loadTrainer()}
        title="CHƯA THỂ XÁC NHẬN BOOKING"
      />
    );
  }

  const selectedMethodLabel = selectedMethod?.label ?? "Thanh toán mô phỏng";

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Xác nhận booking" }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWidth}>
          <View style={styles.hero}>
            <View style={styles.progressRow}>
              <Text style={styles.progress}>BƯỚC 3 / 3</Text>
              <View style={styles.mockBadge}>
                <SymbolView
                  name={{ android: "verified_user", ios: "shield.checkered", web: "verified_user" }}
                  size={15}
                  tintColor={COLORS.success}
                />
              </View>
            </View>
            <Text style={styles.heroTitle}>
              CHỐT LỊCH.{"\n"}<Text style={styles.heroAccent}>VÀO GUỒNG.</Text>
            </Text>
            <Text style={styles.heroDescription}>
              Kiểm tra lần cuối trước khi hệ thống khóa ca tập cho bạn.
            </Text>
          </View>

          <SectionLabel label="01" title="TÓM TẮT BOOKING" />
          <BookingSummaryCard
            dateLabel={formatBookingDate(date!)}
            durationLabel={formatDuration(durationHours!)}
            timeSlot={timeSlot!}
            totalPrice={estimatedTotal}
            trainer={trainer}
          />

          <SectionLabel label="02" title="PHƯƠNG THỨC MÔ PHỎNG" />
          <View accessibilityRole="radiogroup" style={styles.methodList}>
            {PAYMENT_METHODS.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onPress={(nextMethod) => {
                  setSelectedMethod(nextMethod);
                  setSubmitError(null);
                  setSubmitRecovery("retry");
                }}
                selected={selectedMethod?.id === method.id}
              />
            ))}
          </View>

          <View style={styles.notice}>
            <SymbolView
              name={{ android: "info", ios: "info.circle", web: "info" }}
              size={20}
              tintColor={COLORS.info}
            />
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.footerSafeArea}>
        <View style={styles.footer}>
          {submitError ? (
            <View accessibilityRole="alert" style={styles.errorBanner}>
              <SymbolView
                name={{ android: "error", ios: "exclamationmark.triangle", web: "error" }}
                size={20}
                tintColor={COLORS.danger}
              />
              <Text style={styles.errorText}>{submitError}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (submitRecovery === "reauth") {
                    router.replace(ROUTES.AUTH);
                  } else if (submitRecovery === "reselect") {
                    router.replace(ROUTE_BUILDERS.trainerDetail(trainer.id));
                  } else {
                    void submitBooking();
                  }
                }}
                style={({ pressed }) => [styles.errorAction, pressed && styles.errorActionPressed]}
              >
                <Text style={styles.errorActionText}>
                  {submitRecovery === "reauth"
                    ? "ĐĂNG NHẬP"
                    : submitRecovery === "reselect"
                      ? "CHỌN LẠI"
                      : "THỬ LẠI"}
                </Text>
              </Pressable>
            </View>
          ) : null}
          <View style={styles.footerTotal}>
            <Text style={styles.footerTotalLabel}>THANH TOÁN DỰ KIẾN</Text>
            <Text style={styles.footerTotalValue}>{formatVnd(estimatedTotal)}</Text>
          </View>
          <AppButton
            accessibilityLabel="Xác nhận đặt lịch và thanh toán"
            disabled={isAuthenticated && !selectedMethod}
            fullWidth
            label={isAuthenticated ? "XÁC NHẬN & THANH TOÁN" : "CẦN ĐĂNG NHẬP LẠI"}
            loading={isSubmitting}
            onPress={isAuthenticated ? submitBooking : () => router.replace(ROUTES.AUTH)}
            size="lg"
          />
        </View>
      </SafeAreaView>

      <BookingSuccessModal
        booking={createdBooking}
        methodLabel={selectedMethodLabel}
        onContinue={goToBookings}
      />
    </View>
  );
}

function SectionLabel({ label, title }: { label: string; title: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionNumber}>{label}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

type PaymentStateProps = {
  actionLabel: string;
  description: string;
  onAction: () => void;
  title: string;
};

function PaymentState({ actionLabel, description, onAction, title }: PaymentStateProps) {
  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Xác nhận booking" }} />
      <View accessibilityRole="alert" style={styles.fullState}>
        <View style={styles.stateIcon}>
          <SymbolView
            name={{ android: "receipt_long", ios: "doc.text.magnifyingglass", web: "receipt_long" }}
            size={30}
            tintColor={COLORS.primary}
          />
        </View>
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateDescription}>{description}</Text>
        <AppButton label={actionLabel} onPress={onAction} />
      </View>
    </View>
  );
}

function PaymentSkeleton() {
  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Xác nhận booking" }} />
      <View accessibilityLabel="Đang tải thông tin booking" style={styles.skeletonPage}>
        <View style={styles.skeletonHero} />
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSummary} />
        <View style={styles.skeletonTitle} />
        {[0, 1, 2].map((item) => <View key={item} style={styles.skeletonMethod} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  contentWidth: {
    maxWidth: 720,
    width: "100%",
  },
  hero: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: "hidden",
    padding: SPACING.lg,
  },
  progressRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    justifyContent: "space-between",
  },
  progress: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 10,
    letterSpacing: 1.7,
  },
  mockBadge: {
    alignItems: "center",
    backgroundColor: COLORS.successSoft,
    borderColor: COLORS.success,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.xs,
    minHeight: 32,
    paddingHorizontal: SPACING.sm,
  },
  mockBadgeText: {
    color: COLORS.success,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 9,
    letterSpacing: 0.7,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 28,
    fontStyle: "italic",
    letterSpacing: -1,
    lineHeight: 32,
    marginTop: SPACING.lg,
  },
  heroAccent: {
    color: COLORS.primary,
  },
  heroDescription: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    lineHeight: 19,
    marginTop: SPACING.sm,
  },
  sectionLabel: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    marginTop: SPACING.xxl,
  },
  sectionNumber: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 12,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 15,
    fontStyle: "italic",
    letterSpacing: 0.2,
  },
  methodList: {
    gap: SPACING.xs,
  },
  notice: {
    alignItems: "flex-start",
    backgroundColor: COLORS.infoSoft,
    borderColor: COLORS.info,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  noticeText: {
    color: COLORS.textPrimary,
    flex: 1,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 11,
    lineHeight: 18,
  },
  footerSafeArea: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
  },
  footer: {
    alignSelf: "center",
    gap: SPACING.sm,
    maxWidth: 720,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    width: "100%",
  },
  footerTotal: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.sm,
    justifyContent: "space-between",
  },
  footerTotalLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 9,
    letterSpacing: 1,
  },
  footerTotalValue: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 18,
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.xs,
    padding: SPACING.sm,
  },
  errorText: {
    color: COLORS.textPrimary,
    flex: 1,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 10,
    lineHeight: 15,
  },
  errorAction: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: SPACING.xs,
  },
  errorActionPressed: {
    opacity: 0.7,
  },
  errorActionText: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 9,
    letterSpacing: 0.7,
  },
  fullState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: SPACING.xl,
  },
  stateIcon: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.pill,
    height: 64,
    justifyContent: "center",
    marginBottom: SPACING.md,
    width: 64,
  },
  stateTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
  },
  stateDescription: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: SPACING.lg,
    marginTop: SPACING.xs,
    maxWidth: 420,
    textAlign: "center",
  },
  skeletonPage: {
    alignSelf: "center",
    maxWidth: 720,
    padding: SPACING.md,
    width: "100%",
  },
  skeletonHero: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    height: 170,
  },
  skeletonTitle: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
    height: 24,
    marginBottom: SPACING.md,
    marginTop: SPACING.xxl,
    width: 190,
  },
  skeletonSummary: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    height: 330,
  },
  skeletonMethod: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    height: 76,
    marginBottom: SPACING.xs,
  },
});

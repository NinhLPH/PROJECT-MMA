import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { SafeAreaView } from "react-native-safe-area-context";

import { BookingDateCard } from "@/components/trainer/BookingDateCard";
import { TimeSlotCard } from "@/components/trainer/TimeSlotCard";
import { TrainerProfileHero } from "@/components/trainer/TrainerProfileHero";
import { AppButton } from "@/components/ui/AppButton";
import { COLORS, FONT_FAMILIES, RADIUS, SPACING } from "@/constants/theme";
import { ROUTE_BUILDERS } from "@/constants/routes";
import type { Schedule } from "@/models/schedule";
import type { Trainer } from "@/models/trainer";
import { scheduleService, trainerService } from "@/services";

type DateOption = {
  apiDate: string;
  accessibilityLabel: string;
  day: string;
  isToday: boolean;
  month: string;
  weekday: string;
};

function formatApiDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDateOptions(totalDays = 7): DateOption[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const weekday = new Intl.DateTimeFormat("vi-VN", { weekday: "short" })
      .format(date)
      .replace("Th ", "T")
      .toLocaleUpperCase("vi");

    return {
      apiDate: formatApiDate(date),
      accessibilityLabel: new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(date),
      day: String(date.getDate()).padStart(2, "0"),
      isToday: index === 0,
      month: `THÁNG ${date.getMonth() + 1}`,
      weekday,
    };
  });
}

function getTrainerErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "Trainer not found") {
    return "Hồ sơ PT này không còn tồn tại trên FlexFit.";
  }

  return "Chưa thể tải hồ sơ PT. Hãy kiểm tra kết nối đến máy chủ và thử lại.";
}

function getScheduleErrorMessage(): string {
  return "Chưa thể tải lịch trống cho ngày này. Hãy thử lại sau ít phút.";
}

export default function TrainerDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const trainerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const dateOptions = useMemo(() => createDateOptions(), []);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0].apiDate);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isTrainerLoading, setIsTrainerLoading] = useState(true);
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);
  const [trainerError, setTrainerError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const scheduleRequestId = useRef(0);

  const loadTrainer = useCallback(async () => {
    if (!trainerId) {
      setTrainerError("Đường dẫn hồ sơ PT không hợp lệ.");
      setIsTrainerLoading(false);
      return;
    }

    setIsTrainerLoading(true);
    setTrainerError(null);
    try {
      setTrainer(await trainerService.getById(trainerId));
    } catch (error) {
      setTrainerError(getTrainerErrorMessage(error));
    } finally {
      setIsTrainerLoading(false);
    }
  }, [trainerId]);

  const loadSchedules = useCallback(async () => {
    if (!trainerId) {
      setSchedules([]);
      setIsScheduleLoading(false);
      return;
    }

    const requestId = ++scheduleRequestId.current;
    setIsScheduleLoading(true);
    setScheduleError(null);
    setSelectedScheduleId(null);

    try {
      const nextSchedules = await scheduleService.getForDate(trainerId, selectedDate);
      if (requestId === scheduleRequestId.current) {
        setSchedules(nextSchedules);
      }
    } catch {
      if (requestId === scheduleRequestId.current) {
        setSchedules([]);
        setScheduleError(getScheduleErrorMessage());
      }
    } finally {
      if (requestId === scheduleRequestId.current) {
        setIsScheduleLoading(false);
      }
    }
  }, [selectedDate, trainerId]);

  useEffect(() => {
    void loadTrainer();
  }, [loadTrainer]);

  useEffect(() => {
    void loadSchedules();
    return () => {
      scheduleRequestId.current += 1;
    };
  }, [loadSchedules]);

  const availableScheduleCount = schedules.filter((schedule) => !schedule.isBooked).length;
  const selectedSchedule = schedules.find(
    (schedule) => schedule.id === selectedScheduleId && !schedule.isBooked,
  ) ?? null;
  const selectedDateOption = dateOptions.find((option) => option.apiDate === selectedDate) ?? dateOptions[0];

  const selectSchedule = useCallback((schedule: Schedule) => {
    if (schedule.isBooked) return;
    setSelectedScheduleId((currentId) => currentId === schedule.id ? null : schedule.id);
  }, []);

  const continueToPayment = useCallback(() => {
    if (!trainer || !selectedSchedule) return;
    router.push(
      ROUTE_BUILDERS.payment({
        date: selectedDate,
        timeSlot: selectedSchedule.timeSlot,
        trainerId: trainer.id,
      }),
    );
  }, [router, selectedDate, selectedSchedule, trainer]);

  if (isTrainerLoading && !trainer) {
    return <TrainerDetailSkeleton />;
  }

  if (!trainer) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ title: "Hồ sơ PT" }} />
        <View accessibilityRole="alert" style={styles.fullState}>
          <View style={styles.stateIcon}>
            <SymbolView
              name={{ android: "person_off", ios: "person.crop.circle.badge.exclamationmark", web: "person_off" }}
              size={30}
              tintColor={COLORS.primary}
            />
          </View>
          <Text style={styles.stateTitle}>KHÔNG THỂ MỞ HỒ SƠ</Text>
          <Text style={styles.stateDescription}>{trainerError}</Text>
          <AppButton label="THỬ TẢI LẠI" onPress={() => void loadTrainer()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: trainer.fullName }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWidth}>
          <TrainerProfileHero trainer={trainer} />

          <SectionHeading
            description="Chọn một trong 7 ngày gần nhất"
            step="01"
            title="CHỌN NGÀY TẬP"
          />
          <ScrollView
            contentContainerStyle={styles.dateList}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {dateOptions.map((option) => (
              <BookingDateCard
                key={option.apiDate}
                accessibilityLabel={`Chọn ${option.accessibilityLabel}`}
                day={option.day}
                isToday={option.isToday}
                month={option.month}
                onPress={() => setSelectedDate(option.apiDate)}
                selected={option.apiDate === selectedDate}
                weekday={option.weekday}
              />
            ))}
          </ScrollView>

          <SectionHeading
            description={
              isScheduleLoading
                ? "Đang kiểm tra lịch trống"
                : availableScheduleCount === 0
                  ? "Không còn ca trống cho ngày này"
                  : `${availableScheduleCount} ca có thể đặt`
            }
            step="02"
            title="CHỌN CA TẬP"
          />

          {isScheduleLoading ? (
            <View accessibilityLabel="Đang tải các ca tập trống" style={styles.slotLoading}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.slotLoadingText}>ĐANG ĐỒNG BỘ LỊCH PT...</Text>
            </View>
          ) : scheduleError ? (
            <InlineState
              actionLabel="THỬ LẠI"
              description={scheduleError}
              icon="error"
              onAction={() => void loadSchedules()}
              title="LỊCH CHƯA SẴN SÀNG"
            />
          ) : schedules.length === 0 ? (
            <InlineState
              description="PT chưa mở ca trống cho ngày này. Hãy chọn một ngày khác trong tuần."
              icon="calendar"
              title="CHƯA CÓ CA TRỐNG"
            />
          ) : (
            <>
              <View style={styles.slotGrid}>
                {schedules.map((schedule) => (
                  <TimeSlotCard
                    key={schedule.id}
                    onPress={selectSchedule}
                    schedule={schedule}
                    selected={schedule.id === selectedScheduleId}
                  />
                ))}
              </View>
              {availableScheduleCount === 0 ? (
                <Text accessibilityRole="alert" style={styles.allBookedNotice}>
                  Tất cả ca tập trong ngày này đã kín. Hãy chọn một ngày khác để đặt lịch.
                </Text>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.footerSafeArea}>
        <View style={styles.footer}>
          <View style={styles.footerSummary}>
            <Text style={styles.footerLabel}>CA ĐÃ CHỌN</Text>
            <Text numberOfLines={1} style={[styles.footerValue, !selectedSchedule && styles.footerPlaceholder]}>
              {selectedSchedule
                ? `${selectedDateOption.isToday ? "Hôm nay" : selectedDateOption.weekday} · ${selectedSchedule.timeSlot}`
                : "Chọn ngày và giờ để tiếp tục"}
            </Text>
          </View>
          <AppButton
            accessibilityLabel="Tiếp tục đến màn hình xác nhận đặt lịch"
            disabled={!selectedSchedule}
            fullWidth
            label="TIẾP TỤC ĐẶT LỊCH"
            onPress={continueToPayment}
            size="lg"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

type SectionHeadingProps = {
  description: string;
  step: string;
  title: string;
};

function SectionHeading({ description, step, title }: SectionHeadingProps) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepText}>{step}</Text>
      </View>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionDescription}>{description}</Text>
      </View>
    </View>
  );
}

type InlineStateProps = {
  actionLabel?: string;
  description: string;
  icon: "calendar" | "error";
  onAction?: () => void;
  title: string;
};

function InlineState({ actionLabel, description, icon, onAction, title }: InlineStateProps) {
  return (
    <View accessibilityRole={icon === "error" ? "alert" : undefined} style={styles.inlineState}>
      <SymbolView
        name={icon === "error"
          ? { android: "error", ios: "exclamationmark.triangle", web: "error" }
          : { android: "event_busy", ios: "calendar.badge.exclamationmark", web: "event_busy" }}
        size={27}
        tintColor={COLORS.primary}
      />
      <View style={styles.inlineStateCopy}>
        <Text style={styles.inlineStateTitle}>{title}</Text>
        <Text style={styles.inlineStateDescription}>{description}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.inlineAction, pressed && styles.inlineActionPressed]}
        >
          <Text style={styles.inlineActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function TrainerDetailSkeleton() {
  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Hồ sơ PT" }} />
      <View accessibilityLabel="Đang tải hồ sơ huấn luyện viên" style={styles.skeletonPage}>
        <View style={styles.skeletonHero} />
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonDates}>
          {[0, 1, 2, 3].map((item) => <View key={item} style={styles.skeletonDate} />)}
        </View>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSlots}>
          {[0, 1, 2, 3].map((item) => <View key={item} style={styles.skeletonSlot} />)}
        </View>
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
  dateList: {
    gap: SPACING.xs,
    paddingRight: SPACING.md,
  },
  sectionHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    marginTop: SPACING.xxl,
  },
  stepBadge: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  stepText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 12,
  },
  sectionCopy: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 17,
    fontStyle: "italic",
    letterSpacing: -0.3,
  },
  sectionDescription: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 11,
    marginTop: SPACING.xxs,
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  allBookedNotice: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 11,
    lineHeight: 17,
    marginTop: SPACING.sm,
  },
  slotLoading: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.sm,
    justifyContent: "center",
    minHeight: 88,
    padding: SPACING.md,
  },
  slotLoadingText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  inlineState: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.sm,
    minHeight: 96,
    padding: SPACING.md,
  },
  inlineStateCopy: {
    flex: 1,
  },
  inlineStateTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 12,
  },
  inlineStateDescription: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 11,
    lineHeight: 17,
    marginTop: SPACING.xs,
  },
  inlineAction: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: SPACING.xs,
  },
  inlineActionPressed: {
    opacity: 0.7,
  },
  inlineActionText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 10,
    letterSpacing: 0.8,
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
  footerSummary: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.sm,
    justifyContent: "space-between",
  },
  footerLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 9,
    letterSpacing: 1,
  },
  footerValue: {
    color: COLORS.textPrimary,
    flex: 1,
    fontFamily: FONT_FAMILIES.semibold,
    fontSize: 11,
    textAlign: "right",
  },
  footerPlaceholder: {
    color: COLORS.textMuted,
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
    height: 340,
  },
  skeletonTitle: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
    height: 38,
    marginBottom: SPACING.md,
    marginTop: SPACING.xxl,
    width: 180,
  },
  skeletonDates: {
    flexDirection: "row",
    gap: SPACING.xs,
    overflow: "hidden",
  },
  skeletonDate: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    height: 92,
    width: 76,
  },
  skeletonSlots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  skeletonSlot: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    height: 64,
    width: "48.5%",
  },
});

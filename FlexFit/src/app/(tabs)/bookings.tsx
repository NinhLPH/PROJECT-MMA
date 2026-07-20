import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { SafeAreaView } from "react-native-safe-area-context";

import { BookingCard } from "@/components/BookingCard";
import {
  BookingHistoryTabs,
  type BookingHistoryTab,
} from "@/components/booking/BookingHistoryTabs";
import { CancelBookingModal } from "@/components/booking/CancelBookingModal";
import { AppButton } from "@/components/ui/AppButton";
import { ApiError } from "@/api/errors";
import { COLORS, FONT_FAMILIES, RADIUS, SPACING } from "@/constants/theme";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import type { BookingWithTrainer } from "@/models/booking";
import { bookingService } from "@/services";

type LoadRecovery = "reauth" | "retry";

type LoadFailure = {
  message: string;
  recovery: LoadRecovery;
};

const UPCOMING_STATUSES = new Set(["pending", "confirmed"]);

function getBookingSortKey(booking: BookingWithTrainer): string {
  const startTime = booking.timeSlot.split("-")[0]?.trim() ?? "00:00";
  return `${booking.date} ${startTime}`;
}

function getLoadFailure(error: unknown): LoadFailure {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return {
      message: "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại để xem lịch tập.",
      recovery: "reauth",
    };
  }

  return {
    message: "Chưa thể đồng bộ lịch tập. Hãy kiểm tra kết nối và thử lại.",
    recovery: "retry",
  };
}

function getCancelError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "Lịch này vừa thay đổi trạng thái và không thể hủy nữa. Hãy đóng hộp thoại để cập nhật lại.";
    }
    if (error.status === 404) {
      return "Booking không còn tồn tại trên hệ thống.";
    }
    if (error.status === 401 || error.status === 403) {
      return "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.";
    }
  }

  return "Chưa thể hủy lịch. Hãy kiểm tra kết nối và thử lại.";
}

export default function BookingsScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { contentPadding, isCompact } = useResponsiveLayout();
  const userId = session?.user.id;
  const [bookings, setBookings] = useState<BookingWithTrainer[]>([]);
  const [selectedTab, setSelectedTab] = useState<BookingHistoryTab>("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadFailure, setLoadFailure] = useState<LoadFailure | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingWithTrainer | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const requestId = useRef(0);
  const hasLoaded = useRef(false);

  const loadBookings = useCallback(async (refresh = false) => {
    if (!userId) return;

    const currentRequestId = ++requestId.current;
    if (refresh) {
      setIsRefreshing(true);
    } else if (!hasLoaded.current) {
      setIsLoading(true);
    }
    setLoadFailure(null);

    try {
      const nextBookings = await bookingService.getByUser(userId);
      if (currentRequestId === requestId.current) {
        setBookings(nextBookings);
        hasLoaded.current = true;
      }
    } catch (error) {
      if (currentRequestId === requestId.current) {
        setLoadFailure(getLoadFailure(error));
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void loadBookings();
      return () => {
        requestId.current += 1;
      };
    }, [loadBookings]),
  );

  useEffect(() => {
    if (!successMessage) return undefined;
    const timeoutId = setTimeout(() => setSuccessMessage(null), 4_000);
    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  const upcomingBookings = useMemo(
    () => bookings
      .filter((booking) => UPCOMING_STATUSES.has(booking.status))
      .sort((first, second) => getBookingSortKey(first).localeCompare(getBookingSortKey(second))),
    [bookings],
  );

  const historyBookings = useMemo(
    () => bookings
      .filter((booking) => !UPCOMING_STATUSES.has(booking.status))
      .sort((first, second) => getBookingSortKey(second).localeCompare(getBookingSortKey(first))),
    [bookings],
  );

  const visibleBookings = selectedTab === "upcoming" ? upcomingBookings : historyBookings;
  const completedCount = bookings.filter((booking) => booking.status === "completed").length;

  const openCancelModal = useCallback((booking: BookingWithTrainer) => {
    setCancelError(null);
    setCancelTarget(booking);
  }, []);

  const closeCancelModal = useCallback(() => {
    if (isCancelling) return;
    const shouldRefresh = cancelError !== null;
    setCancelError(null);
    setCancelTarget(null);
    if (shouldRefresh) {
      void loadBookings();
    }
  }, [cancelError, isCancelling, loadBookings]);

  const confirmCancel = useCallback(async () => {
    if (!cancelTarget || isCancelling) return;
    setIsCancelling(true);
    setCancelError(null);

    try {
      const cancelledBooking = await bookingService.cancel(cancelTarget.id);
      setBookings((currentBookings) => currentBookings.map((booking) =>
        booking.id === cancelTarget.id
          ? { ...booking, ...cancelledBooking }
          : booking));
      setCancelTarget(null);
      setSuccessMessage(`Đã hủy lịch với ${cancelTarget.trainer.fullName}. Ca tập đã được mở lại.`);
    } catch (error) {
      setCancelError(getCancelError(error));
    } finally {
      setIsCancelling(false);
    }
  }, [cancelTarget, isCancelling]);

  const recoverFromLoadError = useCallback(() => {
    if (loadFailure?.recovery === "reauth") {
      signOut();
      router.replace(ROUTES.AUTH);
      return;
    }
    void loadBookings();
  }, [loadBookings, loadFailure, router, signOut]);

  const changeTab = useCallback((tab: BookingHistoryTab) => {
    setSelectedTab(tab);
    setSuccessMessage(null);
  }, []);

  const renderBooking = useCallback(
    ({ item }: { item: BookingWithTrainer }) => (
      <BookingCard
        booking={item}
        onCancel={selectedTab === "upcoming" ? openCancelModal : undefined}
      />
    ),
    [openCancelModal, selectedTab],
  );

  const listHeader = (
    <View>
      <View style={styles.brandRow}>
        <View>
          <Text style={styles.brand}>FLEX<Text style={styles.brandAccent}>FIT</Text></Text>
          <Text style={styles.brandCaption}>TRAINING CONTROL CENTER</Text>
        </View>
        <View style={[styles.syncBadge, loadFailure && styles.syncBadgeError]}>
          <View style={[styles.syncDot, loadFailure && styles.syncDotError]} />
          <Text style={[styles.syncText, loadFailure && styles.syncTextError]}>
            {loadFailure ? "SYNC ERROR" : isRefreshing ? "SYNCING" : "ONLINE"}
          </Text>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroKicker}>YOUR TRAINING LOG</Text>
        <Text style={styles.heroTitle}>
          LỊCH TẬP.{"\n"}<Text style={styles.heroAccent}>GIỮ NHỊP.</Text>
        </Text>
        <Text style={styles.heroDescription}>
          Theo dõi từng buổi tập, kiểm soát trạng thái và giữ lộ trình luôn đúng hướng.
        </Text>
        <View style={[styles.metrics, isCompact && styles.metricsCompact]}>
          <Metric compact={isCompact} value={upcomingBookings.length} label="SẮP TỚI" />
          <View style={[styles.metricDivider, isCompact && styles.metricDividerCompact]} />
          <Metric compact={isCompact} value={completedCount} label="HOÀN THÀNH" />
          <View style={[styles.metricDivider, isCompact && styles.metricDividerCompact]} />
          <Metric compact={isCompact} value={bookings.length} label="TỔNG LỊCH" />
        </View>
      </View>

      <View style={styles.tabsWrapper}>
        <BookingHistoryTabs
          historyCount={historyBookings.length}
          onChange={changeTab}
          selectedTab={selectedTab}
          upcomingCount={upcomingBookings.length}
        />
      </View>

      {successMessage ? (
        <View accessibilityRole="alert" style={styles.successBanner}>
          <SymbolView
            name={{ android: "check_circle", ios: "checkmark.circle.fill", web: "check_circle" }}
            size={20}
            tintColor={COLORS.success}
          />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      {loadFailure && bookings.length > 0 ? (
        <View accessibilityRole="alert" style={styles.errorBanner}>
          <SymbolView
            name={{ android: "sync_problem", ios: "exclamationmark.arrow.triangle.2.circlepath", web: "sync_problem" }}
            size={20}
            tintColor={COLORS.danger}
          />
          <Text style={styles.errorText}>{loadFailure.message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={recoverFromLoadError}
            style={({ pressed }) => [styles.bannerAction, pressed && styles.bannerActionPressed]}
          >
            <Text style={styles.bannerActionText}>
              {loadFailure.recovery === "reauth" ? "ĐĂNG NHẬP" : "THỬ LẠI"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.listHeading, isCompact && styles.listHeadingCompact]}>
        <View>
          <Text style={styles.listEyebrow}>
            {selectedTab === "upcoming" ? "LỘ TRÌNH HIỆN TẠI" : "NHẬT KÝ LUYỆN TẬP"}
          </Text>
          <Text style={styles.listTitle}>
            {selectedTab === "upcoming" ? "CÁC BUỔI SẮP DIỄN RA" : "LỊCH SỬ CỦA BẠN"}
          </Text>
        </View>
        <View style={styles.resultCount}>
          <Text style={styles.resultCountText}>{visibleBookings.length}</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading && !hasLoaded.current) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <FlatList
          accessibilityLabel="Đang tải lịch tập"
          contentContainerStyle={[styles.listContent, { paddingHorizontal: contentPadding }]}
          data={["one", "two", "three"]}
          ItemSeparatorComponent={ListSeparator}
          keyExtractor={(item) => item}
          ListHeaderComponent={listHeader}
          renderItem={() => <BookingCardSkeleton />}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={[styles.listContent, { paddingHorizontal: contentPadding }]}
        data={visibleBookings}
        extraData={selectedTab}
        initialNumToRender={6}
        ItemSeparatorComponent={ListSeparator}
        keyExtractor={(booking) => booking.id}
        ListEmptyComponent={
          <BookingEmptyState
            error={bookings.length === 0 ? loadFailure : null}
            onPrimaryAction={bookings.length === 0 && loadFailure
              ? recoverFromLoadError
              : selectedTab === "upcoming"
                ? () => router.replace(ROUTES.HOME)
                : () => setSelectedTab("upcoming")}
            tab={selectedTab}
          />
        }
        ListFooterComponent={<View style={styles.listFooter} />}
        ListHeaderComponent={listHeader}
        maxToRenderPerBatch={6}
        refreshControl={
          <RefreshControl
            colors={[COLORS.primary]}
            onRefresh={() => void loadBookings(true)}
            progressBackgroundColor={COLORS.surfaceElevated}
            refreshing={isRefreshing}
            tintColor={COLORS.primary}
          />
        }
        renderItem={renderBooking}
        showsVerticalScrollIndicator={false}
        windowSize={7}
      />

      <CancelBookingModal
        booking={cancelTarget}
        error={cancelError}
        loading={isCancelling}
        onClose={closeCancelModal}
        onConfirm={() => void confirmCancel()}
      />
    </SafeAreaView>
  );
}

function Metric({ compact, label, value }: { compact?: boolean; label: string; value: number }) {
  return (
    <View style={[styles.metric, compact && styles.metricCompact]}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

type BookingEmptyStateProps = {
  error: LoadFailure | null;
  onPrimaryAction: () => void;
  tab: BookingHistoryTab;
};

function BookingEmptyState({ error, onPrimaryAction, tab }: BookingEmptyStateProps) {
  const title = error
    ? "CHƯA THỂ TẢI LỊCH TẬP"
    : tab === "upcoming"
      ? "CHƯA CÓ BUỔI TẬP SẮP TỚI"
      : "NHẬT KÝ ĐANG TRỐNG";
  const description = error
    ? error.message
    : tab === "upcoming"
      ? "Chọn một PT phù hợp và bắt đầu xây dựng lộ trình tập luyện của bạn."
      : "Các buổi đã hoàn thành hoặc đã hủy sẽ xuất hiện tại đây.";
  const actionLabel = error
    ? error.recovery === "reauth" ? "ĐĂNG NHẬP LẠI" : "THỬ TẢI LẠI"
    : tab === "upcoming" ? "TÌM PT PHÙ HỢP" : "XEM LỊCH SẮP TỚI";

  return (
    <View accessibilityRole={error ? "alert" : undefined} style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <SymbolView
          name={{
            android: error ? "cloud_off" : "calendar_month",
            ios: error ? "icloud.slash" : "calendar",
            web: error ? "cloud_off" : "calendar_month",
          }}
          size={29}
          tintColor={COLORS.primary}
        />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      <AppButton label={actionLabel} onPress={onPrimaryAction} variant={error ? "primary" : "outline"} />
    </View>
  );
}

function BookingCardSkeleton() {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.skeletonCard}>
      <View style={styles.skeletonTopRow}>
        <View style={styles.skeletonShortLine} />
        <View style={styles.skeletonBadge} />
      </View>
      <View style={styles.skeletonTrainerRow}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonCopy}>
          <View style={styles.skeletonName} />
          <View style={styles.skeletonShortLine} />
        </View>
      </View>
      <View style={styles.skeletonSchedule} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  listContent: {
    alignSelf: "center",
    maxWidth: 720,
    paddingHorizontal: SPACING.md,
    width: "100%",
  },
  listFooter: {
    height: SPACING.xxl,
  },
  separator: {
    height: SPACING.sm,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    justifyContent: "space-between",
    paddingTop: SPACING.sm,
  },
  brand: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 21,
    fontStyle: "italic",
    letterSpacing: -1,
  },
  brandAccent: {
    color: COLORS.primary,
  },
  brandCaption: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: SPACING.xxs,
  },
  syncBadge: {
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
  syncDot: {
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.pill,
    height: 6,
    width: 6,
  },
  syncDotError: {
    backgroundColor: COLORS.danger,
  },
  syncText: {
    color: COLORS.success,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  syncTextError: {
    color: COLORS.danger,
  },
  syncBadgeError: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.danger,
  },
  hero: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginTop: SPACING.xl,
    overflow: "hidden",
    padding: SPACING.lg,
  },
  heroKicker: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 9,
    letterSpacing: 1.8,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 27,
    fontStyle: "italic",
    letterSpacing: -1,
    lineHeight: 31,
    marginTop: SPACING.sm,
  },
  heroAccent: {
    color: COLORS.primary,
  },
  heroDescription: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 14,
    lineHeight: 21,
    marginTop: SPACING.sm,
    maxWidth: 480,
  },
  metrics: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  metricsCompact: {
    alignItems: "stretch",
    flexDirection: "column",
    paddingVertical: 0,
  },
  metric: {
    alignItems: "center",
    flex: 1,
  },
  metricCompact: {
    flex: 0,
    paddingVertical: SPACING.sm,
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 19,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginTop: SPACING.xxs,
  },
  metricDivider: {
    backgroundColor: COLORS.border,
    height: 32,
    width: 1,
  },
  metricDividerCompact: {
    height: 1,
    width: "100%",
  },
  tabsWrapper: {
    marginTop: SPACING.md,
  },
  successBanner: {
    alignItems: "center",
    backgroundColor: COLORS.successSoft,
    borderColor: COLORS.success,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  successText: {
    color: COLORS.textPrimary,
    flex: 1,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  errorText: {
    color: COLORS.textPrimary,
    flex: 1,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  bannerAction: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: SPACING.xs,
  },
  bannerActionPressed: {
    opacity: 0.7,
  },
  bannerActionText: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 11,
    letterSpacing: 0.7,
  },
  listHeading: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    marginTop: SPACING.xxl,
  },
  listHeadingCompact: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: SPACING.sm,
  },
  listEyebrow: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 11,
    letterSpacing: 1.3,
  },
  listTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 17,
    fontStyle: "italic",
    marginTop: SPACING.xxs,
  },
  resultCount: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    minWidth: 32,
    paddingHorizontal: SPACING.xs,
  },
  resultCountText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 11,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.xl,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.pill,
    height: 60,
    justifyContent: "center",
    marginBottom: SPACING.md,
    width: 60,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
  emptyDescription: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: SPACING.lg,
    marginTop: SPACING.xs,
    maxWidth: 440,
    textAlign: "center",
  },
  skeletonCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
  },
  skeletonTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skeletonShortLine: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
    height: 10,
    width: 90,
  },
  skeletonBadge: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.pill,
    height: 28,
    width: 105,
  },
  skeletonTrainerRow: {
    alignItems: "center",
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
  },
  skeletonAvatar: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.pill,
    height: 56,
    width: 56,
  },
  skeletonCopy: {
    flex: 1,
    gap: SPACING.xs,
  },
  skeletonName: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
    height: 15,
    width: "66%",
  },
  skeletonSchedule: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    height: 90,
    marginTop: SPACING.md,
  },
});

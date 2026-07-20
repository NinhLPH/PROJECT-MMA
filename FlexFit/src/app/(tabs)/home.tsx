import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { SafeAreaView } from "react-native-safe-area-context";

import { TrainerCard } from "@/components/TrainerCard";
import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppButton } from "@/components/ui/AppButton";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { SelectableChip } from "@/components/ui/SelectableChip";
import { COLORS, FONT_FAMILIES, RADIUS, SPACING } from "@/constants/theme";
import { ROUTE_BUILDERS } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import type { Trainer } from "@/models/trainer";
import { trainerService } from "@/services";

const SPECIALTY_FILTERS = ["Tất cả", "Giảm cân", "Tăng cơ", "Yoga", "Pilates", "Boxing"] as const;

const SPECIALTY_ALIASES: Record<(typeof SPECIALTY_FILTERS)[number], readonly string[]> = {
  "Tất cả": [],
  "Giảm cân": ["giảm cân", "giảm mỡ"],
  "Tăng cơ": ["tăng cơ", "sức mạnh"],
  Yoga: ["yoga"],
  Pilates: ["pilates"],
  Boxing: ["boxing", "quyền anh"],
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi")
    .trim();
}

function getTrainerErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.includes("timeout")) {
    return "Máy chủ phản hồi quá chậm. Hãy kiểm tra kết nối và thử lại.";
  }

  return "Chưa thể tải đội ngũ PT. Hãy kiểm tra máy chủ FlexFit và thử lại.";
}

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { contentPadding, isCompact } = useResponsiveLayout();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [query, setQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<(typeof SPECIALTY_FILTERS)[number]>("Tất cả");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTrainers = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setErrorMessage(null);

    try {
      setTrainers(await trainerService.getAll());
    } catch (error) {
      setErrorMessage(getTrainerErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadTrainers();
  }, [loadTrainers]);

  const filteredTrainers = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    const specialtyAliases = SPECIALTY_ALIASES[selectedSpecialty].map(normalizeText);

    return trainers.filter((trainer) => {
      const matchesQuery = !normalizedQuery || normalizeText(trainer.fullName).includes(normalizedQuery);
      const normalizedTrainerSpecialty = normalizeText(trainer.specialty);
      const matchesSpecialty =
        selectedSpecialty === "Tất cả" ||
        specialtyAliases.some((specialty) => normalizedTrainerSpecialty.includes(specialty));
      return matchesQuery && matchesSpecialty;
    });
  }, [query, selectedSpecialty, trainers]);

  const hasActiveFilter = query.trim().length > 0 || selectedSpecialty !== "Tất cả";
  const firstName = session?.user.fullName.trim().split(/\s+/).at(-1) ?? "bạn";

  const clearFilters = useCallback(() => {
    setQuery("");
    setSelectedSpecialty("Tất cả");
  }, []);

  const openTrainer = useCallback(
    (trainer: Trainer) => router.push(ROUTE_BUILDERS.trainerDetail(trainer.id)),
    [router],
  );

  const renderTrainer = useCallback(
    ({ item }: { item: Trainer }) => <TrainerCard trainer={item} onPress={openTrainer} />,
    [openTrainer],
  );

  const listHeader = (
    <View>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>FLEX<Text style={styles.brandAccent}>FIT</Text></Text>
          <Text style={styles.greeting}>Sẵn sàng bứt phá, {firstName}?</Text>
        </View>
        <AppAvatar label={session?.user.fullName ?? "Tài khoản FlexFit"} size={48} />
      </View>

      <View style={[styles.hero, isCompact && styles.heroCompact]}>
        <View style={styles.heroMarker} />
        <Text style={styles.heroKicker}>FIND YOUR COACH</Text>
        <Text style={styles.heroTitle}>CHỌN ĐÚNG PT.{"\n"}<Text style={styles.heroTitleAccent}>TẬP ĐÚNG MỤC TIÊU.</Text></Text>
        <Text style={styles.heroBody}>Chuyên môn thật, lịch tập rõ ràng, một lộ trình dành riêng cho bạn.</Text>
      </View>

      <AppTextInput
        accessibilityLabel="Tìm huấn luyện viên theo tên"
        autoCapitalize="words"
        autoCorrect={false}
        label="TÌM HUẤN LUYỆN VIÊN"
        leftAccessory={
          <SymbolView
            name={{ android: "search", ios: "magnifyingglass", web: "search" }}
            size={21}
            tintColor={COLORS.textSecondary}
          />
        }
        onChangeText={setQuery}
        onSubmitEditing={Keyboard.dismiss}
        placeholder="Nhập tên PT..."
        returnKeyType="search"
        rightAccessory={query ? (
          <Pressable
            accessibilityLabel="Xóa nội dung tìm kiếm"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setQuery("")}
            style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
          >
            <SymbolView
              name={{ android: "close", ios: "xmark.circle.fill", web: "close" }}
              size={20}
              tintColor={COLORS.textMuted}
            />
          </Pressable>
        ) : undefined}
        submitBehavior="blurAndSubmit"
        value={query}
      />

      <Text style={styles.filterLabel}>MỤC TIÊU TẬP LUYỆN</Text>
      <ScrollView
        contentContainerStyle={styles.filters}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {SPECIALTY_FILTERS.map((specialty) => (
          <SelectableChip
            key={specialty}
            label={specialty}
            onPress={() => setSelectedSpecialty(specialty)}
            selected={selectedSpecialty === specialty}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionEyebrow}>ĐỘI NGŨ FLEXFIT</Text>
          <Text style={styles.sectionTitle}>PT PHÙ HỢP VỚI BẠN</Text>
        </View>
        {!isLoading ? (
          <View style={styles.countBadge}>
            <Text style={styles.count}>{filteredTrainers.length}</Text>
          </View>
        ) : null}
      </View>

      {errorMessage && trainers.length > 0 ? (
        <View accessibilityRole="alert" style={styles.inlineError}>
          <Text style={styles.inlineErrorText}>{errorMessage}</Text>
          <Pressable accessibilityRole="button" onPress={() => void loadTrainers()} style={styles.retryLink}>
            <Text style={styles.retryLinkText}>THỬ LẠI</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  if (isLoading && trainers.length === 0) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <FlatList
          accessibilityLabel="Đang tải danh sách huấn luyện viên"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: contentPadding }]}
          data={["one", "two", "three"]}
          keyExtractor={(item) => item}
          ListHeaderComponent={listHeader}
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps="handled"
          renderItem={() => <TrainerCardSkeleton />}
          ItemSeparatorComponent={ListSeparator}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <FlatList
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: contentPadding }]}
        data={filteredTrainers}
        initialNumToRender={6}
        ItemSeparatorComponent={ListSeparator}
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(trainer) => trainer.id}
        ListEmptyComponent={
          <EmptyState
            errorMessage={errorMessage}
            hasActiveFilter={hasActiveFilter}
            onAction={errorMessage ? () => void loadTrainers() : hasActiveFilter ? clearFilters : () => void loadTrainers()}
          />
        }
        ListFooterComponent={<View style={styles.listFooter} />}
        ListHeaderComponent={listHeader}
        maxToRenderPerBatch={6}
        refreshControl={
          <RefreshControl
            colors={[COLORS.primary]}
            onRefresh={() => void loadTrainers(true)}
            progressBackgroundColor={COLORS.surfaceElevated}
            refreshing={isRefreshing}
            tintColor={COLORS.primary}
          />
        }
        renderItem={renderTrainer}
        showsVerticalScrollIndicator={false}
        windowSize={7}
      />
    </SafeAreaView>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

function TrainerCardSkeleton() {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.skeletonCard}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonLine, styles.skeletonLineSmall]} />
        <View style={[styles.skeletonLine, styles.skeletonLineLarge]} />
        <View style={[styles.skeletonLine, styles.skeletonLineMedium]} />
      </View>
    </View>
  );
}

type EmptyStateProps = {
  errorMessage: string | null;
  hasActiveFilter: boolean;
  onAction: () => void;
};

function EmptyState({ errorMessage, hasActiveFilter, onAction }: EmptyStateProps) {
  const title = errorMessage
    ? "MẤT KẾT NỐI VỚI ĐỘI NGŨ"
    : hasActiveFilter
      ? "CHƯA TÌM THẤY PT PHÙ HỢP"
      : "ĐỘI NGŨ ĐANG ĐƯỢC CẬP NHẬT";
  const description = errorMessage
    ? errorMessage
    : hasActiveFilter
      ? "Thử một tên khác hoặc đặt lại mục tiêu tập luyện để mở rộng kết quả."
      : "Các hồ sơ PT mới sẽ sớm xuất hiện. Kéo xuống để cập nhật lại danh sách.";

  return (
    <View accessibilityRole={errorMessage ? "alert" : undefined} style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <SymbolView
          name={{ android: errorMessage ? "wifi_off" : "fitness_center", ios: errorMessage ? "wifi.slash" : "figure.strengthtraining.traditional", web: errorMessage ? "wifi_off" : "fitness_center" }}
          size={28}
          tintColor={COLORS.primary}
        />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      <AppButton
        accessibilityLabel={errorMessage ? "Thử tải lại danh sách PT" : hasActiveFilter ? "Xóa bộ lọc PT" : "Làm mới danh sách PT"}
        label={errorMessage ? "THỬ KẾT NỐI LẠI" : hasActiveFilter ? "XÓA BỘ LỌC" : "LÀM MỚI"}
        onPress={onAction}
        variant={hasActiveFilter && !errorMessage ? "outline" : "primary"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.background, flex: 1 },
  listContent: { alignSelf: "center", maxWidth: 720, paddingHorizontal: SPACING.md, width: "100%" },
  listFooter: { height: SPACING.xxl },
  separator: { height: SPACING.sm },
  topBar: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, justifyContent: "space-between", paddingTop: SPACING.sm },
  brand: { color: COLORS.textPrimary, fontFamily: FONT_FAMILIES.extraBold, fontSize: 22, fontStyle: "italic", letterSpacing: -1 },
  brandAccent: { color: COLORS.primary },
  greeting: { color: COLORS.textSecondary, fontFamily: FONT_FAMILIES.medium, fontSize: 12, marginTop: SPACING.xxs },
  hero: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: SPACING.xl, marginTop: SPACING.xl, overflow: "hidden", padding: SPACING.lg },
  heroCompact: { padding: SPACING.md },
  heroMarker: { backgroundColor: COLORS.primary, height: 4, left: SPACING.lg, position: "absolute", top: 0, width: 56 },
  heroKicker: { color: COLORS.primary, fontFamily: FONT_FAMILIES.bold, fontSize: 10, letterSpacing: 2.1, marginBottom: SPACING.sm },
  heroTitle: { color: COLORS.textPrimary, fontFamily: FONT_FAMILIES.extraBold, fontSize: 27, fontStyle: "italic", letterSpacing: -1.2, lineHeight: 31 },
  heroTitleAccent: { color: COLORS.primary },
  heroBody: { color: COLORS.textSecondary, fontFamily: FONT_FAMILIES.medium, fontSize: 14, lineHeight: 21, marginTop: SPACING.sm, maxWidth: 440 },
  filterLabel: { color: COLORS.textSecondary, fontFamily: FONT_FAMILIES.bold, fontSize: 12, letterSpacing: 1.2, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  filters: { gap: SPACING.xs, paddingRight: SPACING.md },
  sectionHeading: { alignItems: "flex-end", flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, justifyContent: "space-between", marginBottom: SPACING.md, marginTop: SPACING.xxl },
  sectionEyebrow: { color: COLORS.primary, fontFamily: FONT_FAMILIES.bold, fontSize: 10, letterSpacing: 1.4 },
  sectionTitle: { color: COLORS.textPrimary, fontFamily: FONT_FAMILIES.extraBold, fontSize: 19, fontStyle: "italic", letterSpacing: -0.6, marginTop: SPACING.xxs },
  countBadge: { alignItems: "center", backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary, borderRadius: RADIUS.pill, borderWidth: 1, height: 32, justifyContent: "center", minWidth: 32, paddingHorizontal: SPACING.xs },
  count: { color: COLORS.textPrimary, fontFamily: FONT_FAMILIES.bold, fontSize: 12 },
  clearButton: { alignItems: "center", justifyContent: "center", minHeight: 48, minWidth: 48 },
  clearButtonPressed: { opacity: 0.65 },
  inlineError: { alignItems: "center", backgroundColor: COLORS.dangerSoft, borderColor: COLORS.danger, borderRadius: RADIUS.md, borderWidth: 1, flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.md, padding: SPACING.sm },
  inlineErrorText: { color: COLORS.textPrimary, flex: 1, fontFamily: FONT_FAMILIES.medium, fontSize: 12, lineHeight: 18 },
  retryLink: { alignItems: "center", justifyContent: "center", minHeight: 44, paddingHorizontal: SPACING.xs },
  retryLinkText: { color: COLORS.danger, fontFamily: FONT_FAMILIES.bold, fontSize: 11, letterSpacing: 0.7 },
  emptyState: { alignItems: "center", backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.xl },
  emptyIcon: { alignItems: "center", backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.pill, height: 56, justifyContent: "center", marginBottom: SPACING.md, width: 56 },
  emptyTitle: { color: COLORS.textPrimary, fontFamily: FONT_FAMILIES.extraBold, fontSize: 16, fontStyle: "italic", textAlign: "center" },
  emptyDescription: { color: COLORS.textSecondary, fontFamily: FONT_FAMILIES.medium, fontSize: 13, lineHeight: 20, marginBottom: SPACING.lg, marginTop: SPACING.xs, maxWidth: 420, textAlign: "center" },
  skeletonCard: { alignItems: "center", backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADIUS.lg, borderWidth: 1, flexDirection: "row", gap: SPACING.md, minHeight: 116, padding: SPACING.md },
  skeletonAvatar: { backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.pill, height: 72, width: 72 },
  skeletonContent: { flex: 1, gap: SPACING.xs },
  skeletonLine: { backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.sm, height: 10 },
  skeletonLineSmall: { width: "34%" },
  skeletonLineMedium: { width: "52%" },
  skeletonLineLarge: { height: 16, width: "76%" },
});

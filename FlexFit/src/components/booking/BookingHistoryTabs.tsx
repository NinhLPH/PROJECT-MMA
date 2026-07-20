import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_FAMILIES, RADIUS, SPACING } from "@/constants/theme";

export type BookingHistoryTab = "history" | "upcoming";

type BookingHistoryTabsProps = {
  historyCount: number;
  onChange: (tab: BookingHistoryTab) => void;
  selectedTab: BookingHistoryTab;
  upcomingCount: number;
};

export function BookingHistoryTabs({
  historyCount,
  onChange,
  selectedTab,
  upcomingCount,
}: BookingHistoryTabsProps) {
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      <TabButton
        count={upcomingCount}
        label="SẮP DIỄN RA"
        onPress={() => onChange("upcoming")}
        selected={selectedTab === "upcoming"}
      />
      <TabButton
        count={historyCount}
        label="LỊCH SỬ TẬP"
        onPress={() => onChange("history")}
        selected={selectedTab === "history"}
      />
    </View>
  );
}

type TabButtonProps = {
  count: number;
  label: string;
  onPress: () => void;
  selected: boolean;
};

function TabButton({ count, label, onPress, selected }: TabButtonProps) {
  return (
    <Pressable
      accessibilityLabel={`${label}, ${count} lịch`}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        selected && styles.selectedTab,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
      <View style={[styles.countBadge, selected && styles.selectedCountBadge]}>
        <Text style={[styles.count, selected && styles.selectedCount]}>{count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.xs,
    padding: SPACING.xs,
  },
  tab: {
    alignItems: "center",
    borderColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: SPACING.xs,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: SPACING.xs,
  },
  selectedTab: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  pressed: {
    opacity: 0.78,
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  selectedLabel: {
    color: COLORS.white,
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.pill,
    height: 24,
    justifyContent: "center",
    minWidth: 24,
    paddingHorizontal: SPACING.xs,
  },
  selectedCountBadge: {
    backgroundColor: COLORS.primary,
  },
  count: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 10,
  },
  selectedCount: {
    color: COLORS.white,
  },
});

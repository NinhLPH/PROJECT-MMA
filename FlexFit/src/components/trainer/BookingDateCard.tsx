import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_FAMILIES, RADIUS, SPACING } from "@/constants/theme";

type BookingDateCardProps = {
  accessibilityLabel: string;
  day: string;
  isToday?: boolean;
  month: string;
  onPress: () => void;
  selected?: boolean;
  weekday: string;
};

export function BookingDateCard({
  accessibilityLabel,
  day,
  isToday = false,
  month,
  onPress,
  selected = false,
  weekday,
}: BookingDateCardProps) {
  return (
    <Pressable
      android_ripple={{ color: "rgba(255, 255, 255, 0.16)" }}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selectedCard,
        pressed && Platform.OS !== "android" && styles.pressed,
      ]}
    >
      <View style={[styles.topRule, selected && styles.selectedTopRule]} />
      <Text style={[styles.weekday, selected && styles.selectedText]}>
        {isToday ? "HÔM NAY" : weekday}
      </Text>
      <Text style={[styles.day, selected && styles.selectedText]}>{day}</Text>
      <Text style={[styles.month, selected && styles.selectedMonth]}>{month}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 92,
    minWidth: 76,
    overflow: "hidden",
    paddingHorizontal: SPACING.sm,
  },
  selectedCard: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  topRule: {
    backgroundColor: COLORS.border,
    height: 3,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  selectedTopRule: {
    backgroundColor: COLORS.primary,
  },
  weekday: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 9,
    letterSpacing: 0.7,
  },
  day: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 24,
    lineHeight: 29,
    marginTop: SPACING.xxs,
  },
  month: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.semibold,
    fontSize: 10,
  },
  selectedText: {
    color: COLORS.white,
  },
  selectedMonth: {
    color: COLORS.textSecondary,
  },
});

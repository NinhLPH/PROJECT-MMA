import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { COLORS, FONT_FAMILIES, RADIUS, SPACING } from "@/constants/theme";
import type { Schedule } from "@/models/schedule";

type TimeSlotCardProps = {
  onPress: (schedule: Schedule) => void;
  schedule: Schedule;
  selected?: boolean;
};

export function TimeSlotCard({ onPress, schedule, selected = false }: TimeSlotCardProps) {
  const disabled = schedule.isBooked;

  return (
    <Pressable
      accessibilityHint={disabled ? "Ca tập này đã có người đặt" : "Chọn ca tập này"}
      accessibilityLabel={`Ca tập ${schedule.timeSlot}`}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={() => onPress(schedule)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selectedCard,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <SymbolView
        name={{ android: "schedule", ios: "clock", web: "schedule" }}
        size={19}
        tintColor={selected ? COLORS.white : COLORS.primary}
      />
      <View style={styles.content}>
        <Text style={[styles.time, selected && styles.selectedText]}>{schedule.timeSlot}</Text>
        <Text style={[styles.status, selected && styles.selectedStatus]}>
          {disabled ? "ĐÃ KÍN" : "CÒN TRỐNG"}
        </Text>
      </View>
      {selected ? (
        <SymbolView
          name={{ android: "check_circle", ios: "checkmark.circle.fill", web: "check_circle" }}
          size={18}
          tintColor={COLORS.white}
        />
      ) : null}
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
    flexDirection: "row",
    gap: SPACING.xs,
    minHeight: 64,
    paddingHorizontal: SPACING.sm,
    width: "48.5%",
  },
  selectedCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.38,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flex: 1,
  },
  time: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 12,
  },
  status: {
    color: COLORS.success,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 8,
    letterSpacing: 0.8,
    marginTop: SPACING.xxs,
  },
  selectedText: {
    color: COLORS.white,
  },
  selectedStatus: {
    color: COLORS.white,
  },
});

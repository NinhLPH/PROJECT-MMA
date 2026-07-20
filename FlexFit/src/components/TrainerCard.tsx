import { memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { AppAvatar } from "@/components/ui/AppAvatar";
import { COLORS, FONT_FAMILIES, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import type { Trainer } from "@/types/domain";
import { formatVnd } from "@/utils/formatters";

type TrainerCardProps = {
  trainer: Trainer;
  onPress?: (trainer: Trainer) => void;
};

export const TrainerCard = memo(function TrainerCard({ trainer, onPress }: TrainerCardProps) {
  return (
    <Pressable
      android_ripple={{ color: "rgba(255, 255, 255, 0.14)" }}
      accessibilityHint={onPress ? "Mở thông tin và lịch tập của huấn luyện viên" : undefined}
      accessibilityLabel={`${trainer.fullName}, chuyên môn ${trainer.specialty}, ${formatVnd(trainer.pricePerHour)} một giờ`}
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={() => onPress?.(trainer)}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress && Platform.OS !== "android" && styles.pressed,
      ]}
    >
      <View style={styles.accentRail} />
      <AppAvatar label={`Image ${trainer.fullName}`} source={trainer.avatar} size={72} />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>HUẤN LUYỆN VIÊN</Text>
        <Text style={styles.name}>
          {trainer.fullName}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.specialtyPill}>
            <Text style={styles.specialty}>
              {trainer.specialty}
            </Text>
          </View>
          {trainer.rating !== undefined ? (
            <Text accessibilityLabel={`${trainer.rating.toFixed(1)} trên 5 sao`} style={styles.rating}>
              ★ {trainer.rating.toFixed(1)}
            </Text>
          ) : null}
        </View>
        <Text style={styles.price}>{formatVnd(trainer.pricePerHour)}<Text style={styles.priceUnit}> / giờ</Text></Text>
      </View>
      {onPress ? (
        <View style={styles.arrow}>
          <SymbolView
            name={{ android: "chevron_right", ios: "chevron.right", web: "chevron_right" }}
            size={20}
            tintColor={COLORS.textSecondary}
          />
        </View>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    ...SHADOWS.card,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.sm,
    minHeight: 116,
    overflow: "hidden",
    padding: SPACING.md,
    paddingLeft: SPACING.lg,
  },
  accentRail: {
    backgroundColor: COLORS.primary,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 4,
  },
  arrow: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    width: 28,
  },
  content: {
    flex: 1,
  },
  eyebrow: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 9,
    letterSpacing: 1.4,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  name: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 17,
    marginTop: SPACING.xxs,
  },
  price: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  priceUnit: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  rating: {
    color: COLORS.warning,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 12,
    marginTop: SPACING.xxs,
  },
  specialty: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.semibold,
    fontSize: 10,
    flexShrink: 1,
  },
  specialtyPill: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
  },
});

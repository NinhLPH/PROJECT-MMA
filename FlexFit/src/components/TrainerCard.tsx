import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppAvatar } from "@/components/ui/AppAvatar";
import { COLORS, FONT_FAMILIES, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import type { Trainer } from "@/types/domain";
import { formatVnd } from "@/utils/formatters";

type TrainerCardProps = {
  trainer: Trainer;
  onPress?: (trainer: Trainer) => void;
};

export function TrainerCard({ trainer, onPress }: TrainerCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Xem huấn luyện viên ${trainer.fullName}`}
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={() => onPress?.(trainer)}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    >
      <AppAvatar label={trainer.fullName} source={trainer.avatar} size={64} />
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>
          {trainer.fullName}
        </Text>
        <Text numberOfLines={1} style={styles.specialty}>
          {trainer.specialty}
        </Text>
        <Text style={styles.price}>{formatVnd(trainer.pricePerHour)}/giờ</Text>
        {trainer.rating !== undefined ? (
          <Text style={styles.rating}>★ {trainer.rating.toFixed(1)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...SHADOWS.card,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.md,
  },
  content: {
    flex: 1,
  },
  name: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 16,
  },
  price: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 13,
    marginTop: SPACING.xxs,
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
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 13,
    marginTop: SPACING.xxs,
  },
});

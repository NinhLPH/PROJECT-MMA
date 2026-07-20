import { StyleSheet, Text, View } from "react-native";

import { AppAvatar } from "@/components/ui/AppAvatar";
import { COLORS, FONT_FAMILIES, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import type { Trainer } from "@/models/trainer";
import { formatVnd } from "@/utils/formatters";

type TrainerProfileHeroProps = {
  trainer: Trainer;
  compact?: boolean;
};

export function TrainerProfileHero({ trainer, compact = false }: TrainerProfileHeroProps) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.hero, compact && styles.heroCompact]}>
        <View style={styles.redBlock} />
        <View style={styles.avatarFrame}>
          <AppAvatar
            label={`Image ${trainer.fullName}`}
            size={compact ? 96 : 112}
            source={trainer.avatar}
          />
        </View>

        <View style={[styles.identity, compact && styles.identityCompact]}>
          <Text style={styles.kicker}>COACH PROFILE</Text>
          <Text style={styles.name}>{trainer.fullName}</Text>
          <View style={styles.specialtyPill}>
            <Text style={styles.specialty}>{trainer.specialty}</Text>
          </View>
          {trainer.rating !== undefined ? (
            <Text
              accessibilityLabel={`${trainer.rating.toFixed(1)} trên 5 sao`}
              style={styles.rating}
            >
              ★ {trainer.rating.toFixed(1)}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.priceBand}>
        <View>
          <Text style={styles.priceLabel}>MỨC PHÍ HUẤN LUYỆN</Text>
          <Text style={styles.priceHint}>Tính theo thời lượng ca tập</Text>
        </View>
        <Text style={styles.price}>
          {formatVnd(trainer.pricePerHour)}
          <Text style={styles.priceUnit}> / giờ</Text>
        </Text>
      </View>

      <View style={styles.bioSection}>
        <Text style={styles.sectionKicker}>HỒ SƠ CHUYÊN MÔN</Text>
        <Text style={styles.bio}>{trainer.bio}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...SHADOWS.card,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  hero: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.lg,
    minHeight: 168,
    padding: SPACING.lg,
  },
  heroCompact: {
    alignItems: "flex-start",
    flexDirection: "column",
    padding: SPACING.md,
  },
  redBlock: {
    backgroundColor: COLORS.primarySoft,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 80,
  },
  avatarFrame: {
    borderColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    borderWidth: 2,
    padding: SPACING.xxs,
  },
  identity: {
    flex: 1,
    minWidth: 160,
  },
  identityCompact: {
    minWidth: 0,
    width: "100%",
  },
  kicker: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 10,
    letterSpacing: 1.8,
  },
  name: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 23,
    fontStyle: "italic",
    letterSpacing: -0.8,
    lineHeight: 28,
    marginTop: SPACING.xs,
  },
  specialtyPill: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    marginTop: SPACING.sm,
    maxWidth: "100%",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  specialty: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.semibold,
    fontSize: 11,
  },
  rating: {
    color: COLORS.warning,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 12,
    marginTop: SPACING.sm,
  },
  priceBand: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderBottomColor: COLORS.border,
    borderTopColor: COLORS.border,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    justifyContent: "space-between",
    padding: SPACING.md,
  },
  priceLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  priceHint: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 10,
    marginTop: SPACING.xxs,
  },
  price: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 16,
    textAlign: "right",
  },
  priceUnit: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 10,
  },
  bioSection: {
    padding: SPACING.lg,
  },
  sectionKicker: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 11,
    letterSpacing: 1.3,
    marginBottom: SPACING.sm,
  },
  bio: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 14,
    lineHeight: 23,
  },
});

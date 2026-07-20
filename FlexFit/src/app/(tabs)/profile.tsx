import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppButton } from "@/components/ui/AppButton";
import { InfoRow } from "@/components/ui/InfoRow";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ROUTES } from "@/constants/routes";
import {
  COLORS,
  FONT_FAMILIES,
  RADIUS,
  SPACING,
} from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { contentPadding, isCompact } = useResponsiveLayout();

  if (!session) return null;

  function handleSignOut() {
    signOut();
    router.replace(ROUTES.AUTH);
  }

  return (
    <ScreenContainer
      contentContainerStyle={[styles.content, { padding: contentPadding }]}
      safeAreaEdges={["top", "left", "right", "bottom"]}
    >
      <Text accessibilityRole="header" style={styles.eyebrow}>
        FLEXFIT MEMBER
      </Text>
      <Text style={styles.title}>TÀI KHOẢN</Text>

      <View style={styles.profileCard}>
        <View style={[styles.identity, isCompact && styles.identityCompact]}>
          <AppAvatar label={session.user.fullName} size={64} />
          <View style={styles.identityText}>
            <Text style={styles.name}>{session.user.fullName}</Text>
            <Text style={styles.role}>HỌC VIÊN FLEXFIT</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <InfoRow label="Email" value={session.user.email} />
        <InfoRow label="Số điện thoại" value={session.user.phoneNumber} />
      </View>

      <View style={styles.signOut}>
        <AppButton
          fullWidth
          label="ĐĂNG XUẤT"
          onPress={handleSignOut}
          variant="outline"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    maxWidth: 720,
    width: "100%",
  },
  divider: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: SPACING.md,
  },
  eyebrow: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  identity: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.md,
  },
  identityCompact: {
    alignItems: "flex-start",
    flexDirection: "column",
  },
  identityText: {
    flex: 1,
  },
  name: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 18,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderTopColor: COLORS.primary,
    borderTopWidth: 3,
    borderWidth: 1,
    marginTop: SPACING.xxl,
    padding: SPACING.lg,
  },
  role: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.semibold,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: SPACING.xxs,
  },
  signOut: {
    marginTop: SPACING.xl,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: SPACING.xs,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 30,
    marginTop: SPACING.xs,
  },
});

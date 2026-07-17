import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { COLORS, FONT_FAMILIES, SPACING } from "@/constants/theme";

type MockScreenAction = {
  label: string;
  onPress: () => void;
};

type MockScreenProps = {
  title: string;
  description: string;
  actions: MockScreenAction[];
};

export function MockScreen({ title, description, actions }: MockScreenProps) {
  return (
    <ScreenContainer
      contentContainerStyle={styles.container}
      safeAreaEdges={["top", "left", "right"]}
    >
      <Text style={styles.eyebrow}>FLEXFIT WORKSPACE</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.actions}>
        {actions.map((action, index) => (
          <View key={action.label} style={styles.action}>
            <AppButton
              fullWidth
              label={action.label}
              onPress={action.onPress}
              variant={index === 0 ? "primary" : "outline"}
            />
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    justifyContent: "center",
    maxWidth: 520,
    width: "100%",
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 28,
    lineHeight: 34,
    marginTop: SPACING.xs,
  },
  description: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 15,
    lineHeight: 23,
    marginTop: SPACING.sm,
  },
  actions: {
    marginTop: SPACING.xxl,
  },
  action: {
    marginBottom: SPACING.sm,
  },
  eyebrow: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
});

import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { COLORS, SPACING } from "@/constants/theme";

type ScreenContainerProps = {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeAreaEdges?: Edge[];
};

export function ScreenContainer({
  children,
  scroll = true,
  contentContainerStyle,
  safeAreaEdges = ["left", "right", "bottom"],
}: ScreenContainerProps) {
  return (
    <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
});

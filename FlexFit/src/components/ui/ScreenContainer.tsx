import { forwardRef, type ReactNode } from "react";
import type { ScrollViewProps, StyleProp, ViewStyle } from "react-native";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { COLORS, SPACING } from "@/constants/theme";

type ScreenContainerProps = {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeAreaEdges?: Edge[];
  scrollViewProps?: Omit<ScrollViewProps, "children" | "contentContainerStyle">;
};

export const ScreenContainer = forwardRef<ScrollView, ScreenContainerProps>(
  function ScreenContainer(
    {
      children,
      scroll = true,
      contentContainerStyle,
      safeAreaEdges = ["left", "right", "bottom"],
      scrollViewProps,
    },
    ref,
  ) {
    return (
      <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
        {scroll ? (
          <ScrollView
            automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            {...scrollViewProps}
            ref={ref}
            contentContainerStyle={[styles.content, contentContainerStyle]}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, contentContainerStyle]}>{children}</View>
        )}
      </SafeAreaView>
    );
  },
);

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

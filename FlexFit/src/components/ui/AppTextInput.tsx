import { forwardRef, type ReactNode } from "react";
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, FONT_FAMILIES, RADIUS, SPACING } from "@/constants/theme";

type AppTextInputProps = Omit<
  TextInputProps,
  "onChangeText" | "placeholderTextColor" | "style" | "value"
> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
};

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  function AppTextInput(
    {
      accessibilityLabel,
      containerStyle,
      editable = true,
      error,
      inputStyle,
      label,
      leftAccessory,
      onChangeText,
      rightAccessory,
      value,
      ...inputProps
    },
    ref,
  ) {
    return (
      <View style={containerStyle}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.inputFrame,
            !editable && styles.inputDisabled,
            error && styles.inputError,
          ]}
        >
          {leftAccessory ? (
            <View style={styles.leftAccessory}>{leftAccessory}</View>
          ) : null}
          <TextInput
            {...inputProps}
            ref={ref}
            accessibilityLabel={accessibilityLabel ?? label}
            editable={editable}
            onChangeText={onChangeText}
            placeholderTextColor={COLORS.textMuted}
            selectionColor={COLORS.primary}
            style={[styles.input, inputStyle]}
            value={value}
          />
          {rightAccessory ? (
            <View style={styles.rightAccessory}>{rightAccessory}</View>
          ) : null}
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  error: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  input: {
    color: COLORS.textPrimary,
    flex: 1,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: SPACING.md,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  inputFrame: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    overflow: "hidden",
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.semibold,
    fontSize: 13,
    marginBottom: SPACING.xs,
  },
  leftAccessory: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingLeft: SPACING.md,
  },
  rightAccessory: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    minWidth: 48,
  },
});

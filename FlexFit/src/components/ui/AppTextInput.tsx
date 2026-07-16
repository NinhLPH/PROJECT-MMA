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
};

export function AppTextInput({
  accessibilityLabel,
  containerStyle,
  editable = true,
  error,
  inputStyle,
  label,
  onChangeText,
  value,
  ...inputProps
}: AppTextInputProps) {
  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={accessibilityLabel ?? label}
        editable={editable}
        onChangeText={onChangeText}
        placeholderTextColor={COLORS.textMuted}
        selectionColor={COLORS.primary}
        style={[styles.input, !editable && styles.inputDisabled, error && styles.inputError, inputStyle]}
        value={value}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.textPrimary,
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
  label: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.semibold,
    fontSize: 13,
    marginBottom: SPACING.xs,
  },
});

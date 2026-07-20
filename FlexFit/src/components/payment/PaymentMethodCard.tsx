import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { COLORS, FONT_FAMILIES, RADIUS, SPACING } from "@/constants/theme";

export type PaymentMethod = {
  id: "momo" | "vnpay" | "bank-card";
  description: string;
  icon: "card" | "qr" | "wallet";
  label: string;
};

type PaymentMethodCardProps = {
  method: PaymentMethod;
  onPress: (method: PaymentMethod) => void;
  selected?: boolean;
};

const iconNames = {
  card: { android: "credit_card", ios: "creditcard", web: "credit_card" },
  qr: { android: "qr_code_2", ios: "qrcode", web: "qr_code_2" },
  wallet: { android: "account_balance_wallet", ios: "wallet.bifold", web: "account_balance_wallet" },
} as const;

export function PaymentMethodCard({ method, onPress, selected = false }: PaymentMethodCardProps) {
  return (
    <Pressable
      android_ripple={{ color: "rgba(255, 255, 255, 0.16)" }}
      accessibilityLabel={`${method.label}. ${method.description}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, selected }}
      onPress={() => onPress(method)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selectedCard,
        pressed && Platform.OS !== "android" && styles.pressed,
      ]}
    >
      <View style={[styles.iconFrame, selected && styles.selectedIconFrame]}>
        <SymbolView
          name={iconNames[method.icon]}
          size={23}
          tintColor={selected ? COLORS.white : COLORS.primary}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, selected && styles.selectedLabel]}>{method.label}</Text>
        <Text style={styles.description}>{method.description}</Text>
      </View>
      <View style={[styles.radio, selected && styles.selectedRadio]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
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
    gap: SPACING.sm,
    minHeight: 76,
    overflow: "hidden",
    padding: SPACING.sm,
  },
  selectedCard: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  iconFrame: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  selectedIconFrame: {
    backgroundColor: COLORS.primary,
  },
  copy: {
    flex: 1,
  },
  label: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 13,
  },
  selectedLabel: {
    color: COLORS.white,
  },
  description: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: SPACING.xxs,
  },
  radio: {
    alignItems: "center",
    borderColor: COLORS.textMuted,
    borderRadius: RADIUS.pill,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  selectedRadio: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    height: 10,
    width: 10,
  },
});

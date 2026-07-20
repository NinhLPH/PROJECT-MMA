import { useState } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_FAMILIES } from "@/constants/theme";

type AppAvatarProps = {
  source?: ImageSourcePropType | string | null;
  label: string;
  size?: number;
};

export function AppAvatar({ source, label, size = 48 }: AppAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSource = typeof source === "string" ? { uri: source } : source;
  const initials = label.trim().charAt(0).toLocaleUpperCase() || "?";
  const dimensions = { borderRadius: size / 2, height: size, width: size };

  if (!imageSource || imageFailed) {
    return (
      <View accessibilityLabel={label} style={[styles.fallback, dimensions]}>
        <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={label}
      onError={() => setImageFailed(true)}
      source={imageSource}
      style={[styles.image, dimensions]}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
    borderWidth: 1,
    justifyContent: "center",
  },
  image: {
    backgroundColor: COLORS.surfaceElevated,
  },
  initials: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.extraBold,
  },
});

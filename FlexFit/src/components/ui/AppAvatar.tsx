import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image, type ImageProps } from "expo-image";

import { COLORS, FONT_FAMILIES } from "@/constants/theme";

type AppAvatarProps = {
  source?: ImageProps["source"];
  label: string;
  size?: number;
};

export function AppAvatar({ source, label, size = 48 }: AppAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = label.trim().charAt(0).toLocaleUpperCase() || "?";
  const dimensions = { borderRadius: size / 2, height: size, width: size };

  if (!source || imageFailed) {
    return (
      <View accessibilityLabel={label} style={[styles.fallback, dimensions]}>
        <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={label}
      cachePolicy="memory-disk"
      contentFit="cover"
      onError={() => setImageFailed(true)}
      recyclingKey={typeof source === "string" ? source : label}
      source={source}
      style={[styles.image, dimensions]}
      transition={160}
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

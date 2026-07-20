import { useWindowDimensions } from "react-native";

const COMPACT_WIDTH = 360;
const COMPACT_FONT_SCALE = 1.3;

export function useResponsiveLayout() {
  const { fontScale, height, width } = useWindowDimensions();
  const isCompact = width < COMPACT_WIDTH || fontScale >= COMPACT_FONT_SCALE;

  return {
    contentPadding: isCompact ? 12 : 16,
    fontScale,
    height,
    isCompact,
    slotColumns: isCompact ? 1 : 2,
    width,
  } as const;
}

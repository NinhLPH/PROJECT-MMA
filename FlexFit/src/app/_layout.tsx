import { Stack } from "expo-router";

import { SCREEN_TITLES } from "@/constants/routes";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: SCREEN_TITLES.AUTH }} />
      <Stack.Screen name="home" options={{ title: SCREEN_TITLES.HOME }} />
      <Stack.Screen
        name="trainer/[id]"
        options={{ title: SCREEN_TITLES.TRAINER_DETAIL }}
      />
      <Stack.Screen name="payment" options={{ title: SCREEN_TITLES.PAYMENT }} />
      <Stack.Screen name="bookings" options={{ title: SCREEN_TITLES.BOOKINGS }} />
    </Stack>
  );
}

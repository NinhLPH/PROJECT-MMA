import { useEffect } from "react";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SCREEN_TITLES } from "@/constants/routes";
import { COLORS, FONT_FAMILIES } from "@/constants/theme";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: { fontFamily: FONT_FAMILIES.semibold },
        }}
      >
        <Stack.Screen name="index" options={{ title: SCREEN_TITLES.AUTH }} />
        <Stack.Screen name="home" options={{ title: SCREEN_TITLES.HOME }} />
        <Stack.Screen
          name="trainer/[id]"
          options={{ title: SCREEN_TITLES.TRAINER_DETAIL }}
        />
        <Stack.Screen
          name="payment"
          options={{ title: SCREEN_TITLES.PAYMENT }}
        />
        <Stack.Screen
          name="bookings"
          options={{ title: SCREEN_TITLES.BOOKINGS }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

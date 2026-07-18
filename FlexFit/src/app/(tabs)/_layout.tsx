import { Redirect, Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";

import { ROUTES } from "@/constants/routes";
import { COLORS, FONT_FAMILIES } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";

export default function AppTabsLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.AUTH} />;
  }

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarLabelStyle: {
          fontFamily: FONT_FAMILIES.semibold,
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarAccessibilityLabel: "Trang chủ",
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={{
                android: "home",
                ios: focused ? "house.fill" : "house",
                web: "home",
              }}
              size={24}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Lịch tập",
          tabBarAccessibilityLabel: "Lịch tập",
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={{
                android: "calendar_month",
                ios: focused ? "calendar.circle.fill" : "calendar",
                web: "calendar_month",
              }}
              size={24}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarAccessibilityLabel: "Tài khoản",
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={{
                android: "person",
                ios: focused ? "person.crop.circle.fill" : "person.crop.circle",
                web: "person",
              }}
              size={24}
              tintColor={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

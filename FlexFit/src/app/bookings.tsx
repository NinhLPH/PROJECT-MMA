import { useRouter } from "expo-router";

import { MockScreen } from "@/components/MockScreen";
import { ROUTES, SCREEN_TITLES } from "@/constants/routes";

export default function BookingsScreen() {
  const router = useRouter();

  return (
    <MockScreen
      title={SCREEN_TITLES.BOOKINGS}
      description="Lịch tập sắp diễn ra và lịch sử tập."
      actions={[
        {
          label: "Về trang chủ",
          onPress: () => router.replace(ROUTES.HOME),
        },
      ]}
    />
  );
}

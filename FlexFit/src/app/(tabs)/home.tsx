import { useRouter } from "expo-router";

import { MockScreen } from "@/components/MockScreen";
import { ROUTES, SCREEN_TITLES } from "@/constants/routes";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <MockScreen
      title={SCREEN_TITLES.HOME}
      description="Danh sách huấn luyện viên cá nhân."
      actions={[
        {
          label: "Xem PT mẫu",
          onPress: () => router.push(ROUTES.TRAINER_DETAIL),
        },
        {
          label: "Xem lịch sử đặt lịch",
          onPress: () => router.push(ROUTES.BOOKINGS),
        },
      ]}
    />
  );
}

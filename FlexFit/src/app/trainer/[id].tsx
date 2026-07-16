import { useRouter } from "expo-router";

import { MockScreen } from "@/components/MockScreen";
import { ROUTES, SCREEN_TITLES } from "@/constants/routes";

export default function TrainerDetailScreen() {
  const router = useRouter();

  return (
    <MockScreen
      title={SCREEN_TITLES.TRAINER_DETAIL}
      description="Xem chi tiết PT và chọn khung giờ tập."
      actions={[
        {
          label: "Tiến hành đặt lịch",
          onPress: () => router.push(ROUTES.PAYMENT),
        },
      ]}
    />
  );
}

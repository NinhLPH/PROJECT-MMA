import { useRouter } from "expo-router";

import { MockScreen } from "@/components/MockScreen";
import { ROUTES, SCREEN_TITLES } from "@/constants/routes";

export default function PaymentScreen() {
  const router = useRouter();

  return (
    <MockScreen
      title={SCREEN_TITLES.PAYMENT}
      description="Xác nhận đặt lịch và thanh toán mô phỏng."
      actions={[
        {
          label: "Xác nhận đặt lịch & thanh toán",
          onPress: () => router.replace(ROUTES.BOOKINGS),
        },
      ]}
    />
  );
}

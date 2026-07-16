import type { Href } from "expo-router";

const asHref = (path: string) => path as Href;

export const ROUTES = {
  AUTH: asHref("/"),
  HOME: asHref("/home"),
  TRAINER_DETAIL: asHref("/trainer/mock-trainer"),
  PAYMENT: asHref("/payment"),
  BOOKINGS: asHref("/bookings"),
} as const;

export const SCREEN_TITLES = {
  AUTH: "Đăng nhập / Đăng ký",
  HOME: "Trang chủ & Danh sách PT",
  TRAINER_DETAIL: "Chi tiết PT & Chọn lịch",
  PAYMENT: "Xác nhận & Thanh toán",
  BOOKINGS: "Lịch sử đặt lịch",
} as const;

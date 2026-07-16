import type { ImageSourcePropType } from "react-native";

export type Trainer = {
  id: string;
  fullName: string;
  avatar?: ImageSourcePropType | string | null;
  specialty: string;
  bio?: string;
  pricePerHour: number;
  rating?: number;
};

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type PaymentStatus = "unpaid" | "paid";

export type Booking = {
  id: string;
  date: string;
  timeSlot: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  trainer: Pick<Trainer, "id" | "fullName" | "avatar" | "specialty">;
};

import type { TimestampedModel } from "@/models/common";
import type { TrainerSummary } from "@/models/trainer";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";

export interface BookingRecord extends TimestampedModel {
  id: string;
  userId: string;
  trainerId: string;
  date: string;
  timeSlot: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
}

export interface BookingWithTrainer extends BookingRecord {
  trainer: TrainerSummary;
}

export interface CreateBookingInput {
  trainerId: string;
  date: string;
  timeSlot: string;
}

import type { TimestampedModel } from "@/models/common";

export interface Schedule extends TimestampedModel {
  id: string;
  trainerId: string;
  date: string;
  timeSlot: string;
  isBooked: boolean;
}

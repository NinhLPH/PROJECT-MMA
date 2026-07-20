import type { TimestampedModel } from "@/models/common";

export interface Trainer extends TimestampedModel {
  id: string;
  fullName: string;
  avatar: string;
  specialty: string;
  bio: string;
  pricePerHour: number;
  rating?: number;
}

export interface TrainerSummary {
  id: string;
  fullName: string;
  avatar: string;
  specialty: string;
}

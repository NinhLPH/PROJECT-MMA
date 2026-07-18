import { ApiError } from "@/api/errors";
import type { BookingRecord, BookingWithTrainer } from "@/models/booking";
import type { BookingDto, ScheduleDto, TrainerDto, UserDto } from "@/models/api.dto";
import type { Schedule } from "@/models/schedule";
import type { Trainer, TrainerSummary } from "@/models/trainer";
import type { User } from "@/models/user";

export function mapUser(dto: UserDto): User {
  return {
    id: dto._id,
    email: dto.email,
    fullName: dto.fullName,
    phoneNumber: dto.phoneNumber,
    role: dto.role,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapTrainer(dto: TrainerDto): Trainer {
  return {
    id: dto._id,
    fullName: dto.fullName,
    avatar: dto.avatar,
    specialty: dto.specialty,
    bio: dto.bio,
    pricePerHour: dto.pricePerHour,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function mapTrainerSummary(dto: TrainerDto): TrainerSummary {
  return {
    id: dto._id,
    fullName: dto.fullName,
    avatar: dto.avatar,
    specialty: dto.specialty,
  };
}

export function mapSchedule(dto: ScheduleDto): Schedule {
  return {
    id: dto._id,
    trainerId: dto.trainerId,
    date: dto.date,
    timeSlot: dto.timeSlot,
    isBooked: dto.isBooked,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapBookingRecord(dto: BookingDto): BookingRecord {
  return {
    id: dto._id,
    userId: dto.userId,
    trainerId: typeof dto.trainerId === "string" ? dto.trainerId : dto.trainerId._id,
    date: dto.date,
    timeSlot: dto.timeSlot,
    totalPrice: dto.totalPrice,
    status: dto.status,
    paymentStatus: dto.paymentStatus,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapBookingWithTrainer(dto: BookingDto): BookingWithTrainer {
  if (typeof dto.trainerId === "string") {
    throw new ApiError(
      "Booking response did not include trainer details.",
      500,
      "INVALID_RESPONSE",
    );
  }

  return {
    ...mapBookingRecord(dto),
    trainer: mapTrainerSummary(dto.trainerId),
  };
}

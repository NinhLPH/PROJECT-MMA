import type { BookingStatus, PaymentStatus } from "@/models/booking";
import type { UserRole } from "@/models/user";

interface TimestampedDto {
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDto extends TimestampedDto {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
}

export interface TrainerDto extends TimestampedDto {
  _id: string;
  fullName: string;
  avatar: string;
  specialty: string;
  bio: string;
  pricePerHour: number;
}

export interface ScheduleDto extends TimestampedDto {
  _id: string;
  trainerId: string;
  date: string;
  timeSlot: string;
  isBooked: boolean;
}

export interface BookingDto extends TimestampedDto {
  _id: string;
  userId: string;
  trainerId: string | TrainerDto;
  date: string;
  timeSlot: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
}

export interface RegisterResponseDto {
  user: UserDto;
}

export interface LoginResponseDto extends RegisterResponseDto {
  token: string;
}

export interface TrainersResponseDto {
  trainers: TrainerDto[];
}

export interface SchedulesResponseDto {
  schedules: ScheduleDto[];
}

export interface BookingResponseDto {
  booking: BookingDto;
}

export interface BookingsResponseDto {
  bookings: BookingDto[];
}

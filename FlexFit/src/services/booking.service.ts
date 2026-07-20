import { apiClient } from "@/api";
import type { BookingResponseDto, BookingsResponseDto } from "@/models/api.dto";
import type { BookingRecord, BookingWithTrainer, CreateBookingInput } from "@/models/booking";
import { mapBookingRecord, mapBookingWithTrainer } from "@/services/mappers";

async function create(input: CreateBookingInput): Promise<BookingRecord> {
  const { data } = await apiClient.post<BookingResponseDto>("/bookings", input);
  return mapBookingRecord(data.booking);
}

async function getByUser(userId: string): Promise<BookingWithTrainer[]> {
  const { data } = await apiClient.get<BookingsResponseDto>(
    `/bookings/user/${encodeURIComponent(userId)}`,
  );

  return data.bookings.map(mapBookingWithTrainer);
}

async function cancel(bookingId: string): Promise<BookingRecord> {
  const { data } = await apiClient.put<BookingResponseDto>(
    `/bookings/${encodeURIComponent(bookingId)}/cancel`,
  );

  return mapBookingRecord(data.booking);
}

export const bookingService = {
  cancel,
  create,
  getByUser,
};

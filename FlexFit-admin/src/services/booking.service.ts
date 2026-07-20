import { api } from './api';
import type { Booking } from '../types';

export async function getBookings(): Promise<Booking[]> {
  const { data } = await api.get<{ bookings: Booking[] }>('/admin/bookings');
  return data.bookings;
}

export async function confirmBooking(id: string): Promise<Booking> {
  const { data } = await api.put<{ booking: Booking }>(`/admin/bookings/${id}/confirm`);
  return data.booking;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data } = await api.put<{ booking: Booking }>(`/admin/bookings/${id}/cancel`);
  return data.booking;
}

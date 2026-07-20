export type UserRole = 'customer' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';

export interface User {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
}

export interface AdminSession {
  token: string;
  user: User;
}

export interface Trainer {
  _id: string;
  fullName: string;
  avatar: string;
  specialty: string;
  bio: string;
  pricePerHour: number;
}

export interface TrainerInput {
  fullName: string;
  avatar: string;
  specialty: string;
  bio: string;
  pricePerHour: number;
}

export interface ScheduleTrainer {
  _id: string;
  fullName: string;
}

export interface Schedule {
  _id: string;
  trainerId: ScheduleTrainer | string;
  date: string;
  timeSlot: string;
  isBooked: boolean;
}

export interface ScheduleInput {
  trainerId: string;
  date: string;
  timeSlot: string;
}

export interface Booking {
  _id: string;
  userId: Pick<User, '_id' | 'email' | 'fullName' | 'phoneNumber'> | string;
  trainerId: Pick<Trainer, '_id' | 'fullName' | 'avatar' | 'specialty' | 'pricePerHour'> | string;
  date: string;
  timeSlot: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

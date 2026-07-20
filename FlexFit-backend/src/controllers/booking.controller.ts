import type { Request, Response } from 'express';
import BookingModel from '../models/booking.model';
import ScheduleModel from '../models/schedule.model';
import TrainerModel from '../models/trainer.model';
import UserModel from '../models/user.model';
import { HttpError } from '../utils/http-error';
import { getDurationHours, requireDate, requireObjectId, requireTimeSlot } from '../utils/validation';

const cancellableStatuses = ['pending', 'confirmed'] as const;

export async function createBooking(req: Request, res: Response): Promise<void> {
  const userId = req.auth!.userId;
  const trainerId = requireObjectId(req.body.trainerId, 'trainerId');
  const date = requireDate(req.body.date);
  const timeSlot = requireTimeSlot(req.body.timeSlot);

  const [user, trainer] = await Promise.all([
    UserModel.exists({ _id: userId }),
    TrainerModel.findById(trainerId),
  ]);
  if (!user) throw new HttpError(401, 'User account no longer exists');
  if (!trainer) throw new HttpError(404, 'Trainer not found');

  const existingSchedule = await ScheduleModel.exists({ trainerId, date, timeSlot });
  if (!existingSchedule) throw new HttpError(404, 'Schedule not found');

  const schedule = await ScheduleModel.findOneAndUpdate(
    { trainerId, date, timeSlot, isBooked: false },
    { $set: { isBooked: true } },
    { new: true },
  );
  if (!schedule) throw new HttpError(409, 'Schedule has already been booked');

  try {
    const booking = await BookingModel.create({
      userId,
      trainerId,
      date,
      timeSlot,
      totalPrice: getDurationHours(timeSlot) * trainer.pricePerHour,
      status: 'pending',
      paymentStatus: 'paid',
    });
    res.status(201).json({ booking });
  } catch (error) {
    await ScheduleModel.updateOne({ _id: schedule._id, isBooked: true }, { $set: { isBooked: false } });
    throw error;
  }
}

export async function listUserBookings(req: Request, res: Response): Promise<void> {
  const userId = requireObjectId(req.params.userId, 'user id');
  if (req.auth!.role !== 'admin' && req.auth!.userId !== userId) {
    throw new HttpError(403, 'You can only view your own bookings');
  }

  const bookings = await BookingModel.find({ userId })
    .populate('trainerId', 'fullName avatar specialty bio pricePerHour')
    .sort({ date: -1, createdAt: -1 });
  res.status(200).json({ bookings });
}

export async function cancelBookingById(bookingId: string): Promise<unknown> {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new HttpError(404, 'Booking not found');
  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    throw new HttpError(409, 'Only pending or confirmed bookings can be cancelled');
  }

  const cancelledBooking = await BookingModel.findOneAndUpdate(
    { _id: bookingId, status: { $in: cancellableStatuses } },
    { $set: { status: 'cancelled' } },
    { new: true },
  );
  if (!cancelledBooking) throw new HttpError(409, 'Only pending or confirmed bookings can be cancelled');
  await ScheduleModel.updateOne(
    { trainerId: cancelledBooking.trainerId, date: cancelledBooking.date, timeSlot: cancelledBooking.timeSlot },
    { $set: { isBooked: false } },
  );
  return cancelledBooking;
}

export async function cancelOwnBooking(req: Request, res: Response): Promise<void> {
  const bookingId = requireObjectId(req.params.id, 'booking id');
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new HttpError(404, 'Booking not found');
  if (req.auth!.role !== 'admin' && String(booking.userId) !== req.auth!.userId) {
    throw new HttpError(403, 'You can only cancel your own booking');
  }

  const cancelledBooking = await cancelBookingById(bookingId);
  res.status(200).json({ booking: cancelledBooking });
}

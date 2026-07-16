import type { Request, Response } from 'express';
import BookingModel from '../models/booking.model';
import ScheduleModel from '../models/schedule.model';
import TrainerModel from '../models/trainer.model';
import { cancelBookingById } from './booking.controller';
import { HttpError } from '../utils/http-error';
import { requireDate, requireObjectId, requirePositiveNumber, requireString, requireTimeSlot } from '../utils/validation';

function trainerInput(body: Record<string, unknown>) {
  return {
    fullName: requireString(body.fullName, 'fullName'),
    avatar: requireString(body.avatar, 'avatar'),
    specialty: requireString(body.specialty, 'specialty'),
    bio: requireString(body.bio, 'bio'),
    pricePerHour: requirePositiveNumber(body.pricePerHour, 'pricePerHour'),
  };
}

function scheduleInput(body: Record<string, unknown>) {
  return {
    trainerId: requireObjectId(body.trainerId, 'trainerId'),
    date: requireDate(body.date),
    timeSlot: requireTimeSlot(body.timeSlot),
  };
}

async function ensureTrainerExists(trainerId: string): Promise<void> {
  if (!(await TrainerModel.exists({ _id: trainerId }))) throw new HttpError(404, 'Trainer not found');
}

export async function listAdminTrainers(_req: Request, res: Response): Promise<void> {
  const trainers = await TrainerModel.find().sort({ fullName: 1 });
  res.status(200).json({ trainers });
}

export async function createTrainer(req: Request, res: Response): Promise<void> {
  const trainer = await TrainerModel.create(trainerInput(req.body));
  res.status(201).json({ trainer });
}

export async function updateTrainer(req: Request, res: Response): Promise<void> {
  const trainerId = requireObjectId(req.params.id, 'trainer id');
  const trainer = await TrainerModel.findByIdAndUpdate(trainerId, trainerInput(req.body), { new: true, runValidators: true });
  if (!trainer) throw new HttpError(404, 'Trainer not found');
  res.status(200).json({ trainer });
}

export async function deleteTrainer(req: Request, res: Response): Promise<void> {
  const trainerId = requireObjectId(req.params.id, 'trainer id');
  const trainer = await TrainerModel.findById(trainerId);
  if (!trainer) throw new HttpError(404, 'Trainer not found');

  const [hasBookings, hasSchedules] = await Promise.all([
    BookingModel.exists({ trainerId }),
    ScheduleModel.exists({ trainerId }),
  ]);
  if (hasBookings || hasSchedules) {
    throw new HttpError(409, 'Trainer cannot be deleted while bookings or schedules exist');
  }

  await trainer.deleteOne();
  res.status(200).json({ message: 'Trainer deleted' });
}

export async function listSchedules(_req: Request, res: Response): Promise<void> {
  const schedules = await ScheduleModel.find().populate('trainerId', 'fullName').sort({ date: 1, timeSlot: 1 });
  res.status(200).json({ schedules });
}

export async function createSchedule(req: Request, res: Response): Promise<void> {
  const input = scheduleInput(req.body);
  await ensureTrainerExists(input.trainerId);
  const schedule = await ScheduleModel.create(input);
  res.status(201).json({ schedule });
}

export async function updateSchedule(req: Request, res: Response): Promise<void> {
  const scheduleId = requireObjectId(req.params.id, 'schedule id');
  const existingSchedule = await ScheduleModel.findById(scheduleId);
  if (!existingSchedule) throw new HttpError(404, 'Schedule not found');
  if (existingSchedule.isBooked) throw new HttpError(409, 'A booked schedule cannot be changed');

  const input = scheduleInput(req.body);
  await ensureTrainerExists(input.trainerId);
  const schedule = await ScheduleModel.findOneAndUpdate(
    { _id: scheduleId, isBooked: false },
    input,
    { new: true, runValidators: true },
  );
  if (!schedule) throw new HttpError(409, 'A booked schedule cannot be changed');
  res.status(200).json({ schedule });
}

export async function deleteSchedule(req: Request, res: Response): Promise<void> {
  const scheduleId = requireObjectId(req.params.id, 'schedule id');
  const existingSchedule = await ScheduleModel.findById(scheduleId);
  if (!existingSchedule) throw new HttpError(404, 'Schedule not found');
  if (existingSchedule.isBooked) throw new HttpError(409, 'A booked schedule cannot be deleted');

  const deletedSchedule = await ScheduleModel.findOneAndDelete({ _id: scheduleId, isBooked: false });
  if (!deletedSchedule) throw new HttpError(409, 'A booked schedule cannot be deleted');
  res.status(200).json({ message: 'Schedule deleted' });
}

export async function listBookings(_req: Request, res: Response): Promise<void> {
  const bookings = await BookingModel.find()
    .populate('userId', 'email fullName phoneNumber')
    .populate('trainerId', 'fullName avatar specialty pricePerHour')
    .sort({ date: -1, createdAt: -1 });
  res.status(200).json({ bookings });
}

export async function confirmBooking(req: Request, res: Response): Promise<void> {
  const bookingId = requireObjectId(req.params.id, 'booking id');
  const booking = await BookingModel.findOneAndUpdate(
    { _id: bookingId, status: 'pending' },
    { $set: { status: 'confirmed' } },
    { new: true },
  );
  if (!booking) {
    if (!(await BookingModel.exists({ _id: bookingId }))) throw new HttpError(404, 'Booking not found');
    throw new HttpError(409, 'Only pending bookings can be confirmed');
  }
  res.status(200).json({ booking });
}

export async function cancelBooking(req: Request, res: Response): Promise<void> {
  const bookingId = requireObjectId(req.params.id, 'booking id');
  const booking = await cancelBookingById(bookingId);
  res.status(200).json({ booking });
}

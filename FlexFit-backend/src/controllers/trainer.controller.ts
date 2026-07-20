import type { Request, Response } from 'express';
import TrainerModel from '../models/trainer.model';
import ScheduleModel from '../models/schedule.model';
import { HttpError } from '../utils/http-error';
import { requireDate, requireObjectId } from '../utils/validation';

export async function listTrainers(_req: Request, res: Response): Promise<void> {
  const trainers = await TrainerModel.find().sort({ fullName: 1 });
  res.status(200).json({ trainers });
}

function includeBookedSchedules(value: unknown): boolean {
  if (value === undefined) return false;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new HttpError(400, 'includeBooked must be true or false');
}

export async function listSchedules(req: Request, res: Response): Promise<void> {
  const trainerId = requireObjectId(req.params.id, 'trainer id');
  const date = requireDate(req.query.date);
  const includeBooked = includeBookedSchedules(req.query.includeBooked);
  const trainer = await TrainerModel.exists({ _id: trainerId });
  if (!trainer) throw new HttpError(404, 'Trainer not found');

  const schedules = await ScheduleModel.find({
    trainerId,
    date,
    ...(includeBooked ? {} : { isBooked: false }),
  }).sort({ timeSlot: 1 });
  res.status(200).json({ schedules });
}

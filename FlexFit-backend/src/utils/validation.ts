import { isValidObjectId } from 'mongoose';
import { HttpError } from './http-error';

export function requireString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new HttpError(400, `${name} is required`);
  return value.trim();
}

export function requireObjectId(value: unknown, name: string): string {
  const id = requireString(value, name);
  if (!isValidObjectId(id)) throw new HttpError(400, `${name} is invalid`);
  return id;
}

export function requireDate(value: unknown): string {
  const date = requireString(value, 'date');
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new HttpError(400, 'date must use YYYY-MM-DD format');
  }
  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (parsed.getUTCFullYear() !== Number(year) || parsed.getUTCMonth() !== Number(month) - 1 || parsed.getUTCDate() !== Number(day)) {
    throw new HttpError(400, 'date must be a real calendar date');
  }
  return date;
}

export function requireTimeSlot(value: unknown): string {
  const timeSlot = requireString(value, 'timeSlot');
  if (!/^([01]\d|2[0-3]):[0-5]\d\s*-\s*([01]\d|2[0-3]):[0-5]\d$/.test(timeSlot)) {
    throw new HttpError(400, 'timeSlot must use HH:MM - HH:MM format');
  }
  if (getDurationHours(timeSlot) <= 0) throw new HttpError(400, 'timeSlot must end after it starts');
  return timeSlot;
}

export function getDurationHours(timeSlot: string): number {
  const [start, end] = timeSlot.split('-').map((time) => time.trim());
  const minutes = (time: string): number => {
    const [hours, minute] = time.split(':').map(Number);
    return hours * 60 + minute;
  };
  return (minutes(end) - minutes(start)) / 60;
}

export function requirePositiveNumber(value: unknown, name: string): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number) || number < 0) throw new HttpError(400, `${name} must be a non-negative number`);
  return number;
}

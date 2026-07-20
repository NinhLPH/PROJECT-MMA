import type {Schedule, Trainer} from '../types';

export const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
}).format(value);
export const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', {dateStyle: 'medium'}).format(new Date(`${value}T12:00:00`));
export const trainerIdOf = (value: Schedule['trainerId']) => typeof value === 'string' ? value : value._id;
export const trainerNameOf = (value: Schedule['trainerId'], trainers: Trainer[]) => typeof value === 'string' ? trainers.find((trainer) => trainer._id === value)?.fullName || 'PT không xác định' : value.fullName;

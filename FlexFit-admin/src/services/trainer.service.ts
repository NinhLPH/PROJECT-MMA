import { api } from './api';
import type { Trainer, TrainerInput } from '../types';

export async function getTrainers(): Promise<Trainer[]> {
  const { data } = await api.get<{ trainers: Trainer[] }>('/admin/trainers');
  return data.trainers;
}

export async function createTrainer(input: TrainerInput): Promise<Trainer> {
  const { data } = await api.post<{ trainer: Trainer }>('/admin/trainers', input);
  return data.trainer;
}

export async function updateTrainer(id: string, input: TrainerInput): Promise<Trainer> {
  const { data } = await api.put<{ trainer: Trainer }>(`/admin/trainers/${id}`, input);
  return data.trainer;
}

export async function deleteTrainer(id: string): Promise<void> {
  await api.delete(`/admin/trainers/${id}`);
}

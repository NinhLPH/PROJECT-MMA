import { api } from './api';
import type { Schedule, ScheduleInput } from '../types';

export async function getSchedules(): Promise<Schedule[]> {
  const { data } = await api.get<{ schedules: Schedule[] }>('/admin/schedules');
  return data.schedules;
}

export async function createSchedule(input: ScheduleInput): Promise<Schedule> {
  const { data } = await api.post<{ schedule: Schedule }>('/admin/schedules', input);
  return data.schedule;
}

export async function updateSchedule(id: string, input: ScheduleInput): Promise<Schedule> {
  const { data } = await api.put<{ schedule: Schedule }>(`/admin/schedules/${id}`, input);
  return data.schedule;
}

export async function deleteSchedule(id: string): Promise<void> {
  await api.delete(`/admin/schedules/${id}`);
}

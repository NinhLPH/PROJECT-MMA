import { apiClient } from "@/api";
import type { SchedulesResponseDto } from "@/models/api.dto";
import type { Schedule } from "@/models/schedule";
import { mapSchedule } from "@/services/mappers";

async function getAvailable(trainerId: string, date: string): Promise<Schedule[]> {
  const { data } = await apiClient.get<SchedulesResponseDto>(
    `/trainers/${encodeURIComponent(trainerId)}/schedules`,
    { params: { date } },
  );

  return data.schedules.map(mapSchedule);
}

export const scheduleService = {
  getAvailable,
};

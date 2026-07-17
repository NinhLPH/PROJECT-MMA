import { apiClient } from "@/api";
import { ApiError } from "@/api/errors";
import type { TrainersResponseDto } from "@/models/api.dto";
import type { Trainer } from "@/models/trainer";
import { mapTrainer } from "@/services/mappers";

async function getAll(): Promise<Trainer[]> {
  const { data } = await apiClient.get<TrainersResponseDto>("/trainers");
  return data.trainers.map(mapTrainer);
}

async function getById(id: string): Promise<Trainer> {
  const trainers = await getAll();
  const trainer = trainers.find((item) => item.id === id);

  if (!trainer) {
    throw new ApiError("Trainer not found", 404, "TRAINER_NOT_FOUND");
  }

  return trainer;
}

export const trainerService = {
  getAll,
  getById,
};

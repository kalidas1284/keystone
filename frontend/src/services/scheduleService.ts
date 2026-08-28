import api from "./api";
import type { Schedule, ScheduleRequest } from "../types/domain";

export async function listSchedules(params?: { from?: string; to?: string }): Promise<Schedule[]> {
  const { data } = await api.get<Schedule[]>("/schedules", { params });
  return data;
}

export async function createSchedule(payload: ScheduleRequest): Promise<Schedule> {
  const { data } = await api.post<Schedule>("/schedules", payload);
  return data;
}

export async function updateSchedule(id: number, payload: ScheduleRequest): Promise<Schedule> {
  const { data } = await api.put<Schedule>(`/schedules/${id}`, payload);
  return data;
}

export async function cancelSchedule(id: number): Promise<void> {
  await api.delete(`/schedules/${id}`);
}

const scheduleService = {
  listSchedules,
  createSchedule,
  updateSchedule,
  cancelSchedule,
};

export default scheduleService;

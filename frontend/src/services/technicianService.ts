import api from "./api";
import type {
  AvailabilityStatus,
  PageResponse,
  Technician,
  TechnicianRequest,
  WorkOrder,
} from "../types/domain";

export async function listTechnicians(params: {
  search?: string;
  availability?: AvailabilityStatus;
  active?: boolean;
  page?: number;
  size?: number;
}): Promise<PageResponse<Technician>> {
  const { data } = await api.get<PageResponse<Technician>>("/technicians", { params });
  return data;
}

export async function getTechnician(id: number): Promise<Technician> {
  const { data } = await api.get<Technician>(`/technicians/${id}`);
  return data;
}

export async function createTechnician(payload: TechnicianRequest): Promise<Technician> {
  const { data } = await api.post<Technician>("/technicians", payload);
  return data;
}

export async function createTechnicianWithAccount(payload: {
  fullName: string;
  email: string;
  password: string;
  employeeCode: string;
  phone?: string;
  specialization?: string;
  availabilityStatus?: AvailabilityStatus;
  currentLocation?: string;
}): Promise<Technician> {
  const { data } = await api.post<Technician>("/technicians/with-account", payload);
  return data;
}

export async function updateTechnician(id: number, payload: TechnicianRequest): Promise<Technician> {
  const { data } = await api.put<Technician>(`/technicians/${id}`, payload);
  return data;
}

export async function updateAvailability(
  id: number,
  availabilityStatus: AvailabilityStatus
): Promise<Technician> {
  const { data } = await api.post<Technician>(`/technicians/${id}/availability`, {
    availabilityStatus,
  });
  return data;
}

export async function deactivateTechnician(id: number): Promise<void> {
  await api.delete(`/technicians/${id}`);
}

export async function getTechnicianWorkOrders(id: number): Promise<WorkOrder[]> {
  const { data } = await api.get<WorkOrder[]>(`/technicians/${id}/work-orders`);
  return data;
}

const technicianService = {
  listTechnicians,
  getTechnician,
  createTechnician,
  createTechnicianWithAccount,
  updateTechnician,
  updateAvailability,
  deactivateTechnician,
  getTechnicianWorkOrders,
};

export default technicianService;

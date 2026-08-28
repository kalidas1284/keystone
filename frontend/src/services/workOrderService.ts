import api from "./api";
import type {
  PageResponse,
  TimeLog,
  WorkOrder,
  WorkOrderPartUsage,
  WorkOrderPriority,
  WorkOrderRequest,
  WorkOrderStatus,
} from "../types/domain";

export async function listWorkOrders(params: {
  search?: string;
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  technicianId?: number;
  page?: number;
  size?: number;
}): Promise<PageResponse<WorkOrder>> {
  const { data } = await api.get<PageResponse<WorkOrder>>("/work-orders", { params });
  return data;
}

export async function getWorkOrder(id: number): Promise<WorkOrder> {
  const { data } = await api.get<WorkOrder>(`/work-orders/${id}`);
  return data;
}

export async function createWorkOrder(payload: WorkOrderRequest): Promise<WorkOrder> {
  const { data } = await api.post<WorkOrder>("/work-orders", payload);
  return data;
}

export async function updateWorkOrder(id: number, payload: WorkOrderRequest): Promise<WorkOrder> {
  const { data } = await api.put<WorkOrder>(`/work-orders/${id}`, payload);
  return data;
}

export async function assignTechnician(id: number, technicianId: number): Promise<WorkOrder> {
  const { data } = await api.post<WorkOrder>(`/work-orders/${id}/assign`, { technicianId });
  return data;
}

export async function scheduleWorkOrder(
  id: number,
  payload: { scheduledDate: string; startTime?: string; endTime?: string; notes?: string }
): Promise<WorkOrder> {
  const { data } = await api.post<WorkOrder>(`/work-orders/${id}/schedule`, payload);
  return data;
}

export async function updateStatus(
  id: number,
  status: WorkOrderStatus,
  notes?: string
): Promise<WorkOrder> {
  const { data } = await api.post<WorkOrder>(`/work-orders/${id}/status`, { status, notes });
  return data;
}

export async function completeWorkOrder(id: number, notes?: string): Promise<WorkOrder> {
  const { data } = await api.post<WorkOrder>(`/work-orders/${id}/complete`, { status: "COMPLETED", notes });
  return data;
}

export async function cancelWorkOrder(id: number, notes?: string): Promise<WorkOrder> {
  const { data } = await api.post<WorkOrder>(`/work-orders/${id}/cancel`, { status: "CANCELLED", notes });
  return data;
}

export async function listTimeLogs(id: number): Promise<TimeLog[]> {
  const { data } = await api.get<TimeLog[]>(`/work-orders/${id}/time-logs`);
  return data;
}

export async function addTimeLog(id: number, minutes: number, notes?: string): Promise<TimeLog> {
  const { data } = await api.post<TimeLog>(`/work-orders/${id}/time-logs`, { minutes, notes });
  return data;
}

export async function listParts(id: number): Promise<WorkOrderPartUsage[]> {
  const { data } = await api.get<WorkOrderPartUsage[]>(`/work-orders/${id}/parts`);
  return data;
}

export async function addPart(
  id: number,
  inventoryItemId: number,
  quantity: number,
  notes?: string
): Promise<WorkOrderPartUsage> {
  const { data } = await api.post<WorkOrderPartUsage>(`/work-orders/${id}/parts`, {
    inventoryItemId,
    quantity,
    notes,
  });
  return data;
}

const workOrderService = {
  listWorkOrders,
  getWorkOrder,
  createWorkOrder,
  updateWorkOrder,
  assignTechnician,
  scheduleWorkOrder,
  updateStatus,
  completeWorkOrder,
  cancelWorkOrder,
  listTimeLogs,
  addTimeLog,
  listParts,
  addPart,
};

export default workOrderService;

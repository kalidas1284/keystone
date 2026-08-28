import api from "./api";
import type { Invoice, Site, WorkOrder, WorkOrderPriority } from "../types/domain";

export async function listMyRequests(): Promise<WorkOrder[]> {
  const { data } = await api.get<WorkOrder[]>("/portal/requests");
  return data;
}

export async function getMyRequest(id: number): Promise<WorkOrder> {
  const { data } = await api.get<WorkOrder>(`/portal/requests/${id}`);
  return data;
}

export async function createMyRequest(payload: {
  title: string;
  description?: string;
  priority: WorkOrderPriority;
  siteId: number;
  location?: string;
  notes?: string;
}): Promise<WorkOrder> {
  const { data } = await api.post<WorkOrder>("/portal/requests", payload);
  return data;
}

export async function listMySites(): Promise<Site[]> {
  const { data } = await api.get<Site[]>("/portal/sites");
  return data;
}

export async function listMyInvoices(): Promise<Invoice[]> {
  const { data } = await api.get<Invoice[]>("/portal/invoices");
  return data;
}

export async function getMyInvoice(id: number): Promise<Invoice> {
  const { data } = await api.get<Invoice>(`/portal/invoices/${id}`);
  return data;
}

const portalService = {
  listMyRequests,
  getMyRequest,
  createMyRequest,
  listMySites,
  listMyInvoices,
  getMyInvoice,
};

export default portalService;

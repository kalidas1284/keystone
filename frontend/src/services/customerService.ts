import api from "./api";
import type { Customer, CustomerRequest, PageResponse, Site, WorkOrder } from "../types/domain";

export async function listCustomers(params: {
  search?: string;
  active?: boolean;
  page?: number;
  size?: number;
}): Promise<PageResponse<Customer>> {
  const { data } = await api.get<PageResponse<Customer>>("/customers", { params });
  return data;
}

export async function getCustomer(id: number): Promise<Customer> {
  const { data } = await api.get<Customer>(`/customers/${id}`);
  return data;
}

export async function createCustomer(payload: CustomerRequest): Promise<Customer> {
  const { data } = await api.post<Customer>("/customers", payload);
  return data;
}

export async function updateCustomer(id: number, payload: CustomerRequest): Promise<Customer> {
  const { data } = await api.put<Customer>(`/customers/${id}`, payload);
  return data;
}

export async function deactivateCustomer(id: number): Promise<void> {
  await api.delete(`/customers/${id}`);
}

export async function getCustomerWorkOrders(id: number): Promise<WorkOrder[]> {
  const { data } = await api.get<WorkOrder[]>(`/customers/${id}/work-orders`);
  return data;
}

export async function listCustomerSites(customerId: number): Promise<Site[]> {
  const { data } = await api.get<Site[]>(`/customers/${customerId}/sites`);
  return data;
}

export async function createCustomerSite(
  customerId: number,
  payload: { name: string; location: string; notes?: string }
): Promise<Site> {
  const { data } = await api.post<Site>(`/customers/${customerId}/sites`, {
    customerId,
    name: payload.name,
    location: payload.location,
    notes: payload.notes,
  });
  return data;
}

export async function updateCustomerSite(
  customerId: number,
  siteId: number,
  payload: { name: string; location: string; notes?: string }
): Promise<Site> {
  const { data } = await api.put<Site>(`/customers/${customerId}/sites/${siteId}`, {
    customerId,
    name: payload.name,
    location: payload.location,
    notes: payload.notes,
  });
  return data;
}

export async function listAvailablePortalUsers() {
  const { data } = await api.get("/customers/available-portal-users");
  return data as import("../types/user").User[];
}

export async function linkPortalUser(customerId: number, userId: number): Promise<Customer> {
  const { data } = await api.put<Customer>(`/customers/${customerId}/portal-user`, { userId });
  return data;
}

export async function unlinkPortalUser(customerId: number): Promise<Customer> {
  const { data } = await api.delete<Customer>(`/customers/${customerId}/portal-user`);
  return data;
}

const customerService = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deactivateCustomer,
  getCustomerWorkOrders,
  listCustomerSites,
  createCustomerSite,
  updateCustomerSite,
  listAvailablePortalUsers,
  linkPortalUser,
  unlinkPortalUser,
};

export default customerService;

import api from "./api";
import type { Invoice, InvoiceStatus } from "../types/domain";

export async function listInvoices(): Promise<Invoice[]> {
  const { data } = await api.get<Invoice[]>("/invoices");
  return data;
}

export async function getInvoice(id: number): Promise<Invoice> {
  const { data } = await api.get<Invoice>(`/invoices/${id}`);
  return data;
}

export async function getInvoiceByWorkOrder(workOrderId: number): Promise<Invoice> {
  const { data } = await api.get<Invoice>(`/invoices/by-work-order/${workOrderId}`);
  return data;
}

export async function generateInvoice(workOrderId: number): Promise<Invoice> {
  const { data } = await api.post<Invoice>(`/invoices/from-work-order/${workOrderId}`);
  return data;
}

export async function updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<Invoice> {
  const { data } = await api.put<Invoice>(`/invoices/${id}/status`, { status });
  return data;
}

const invoiceService = {
  listInvoices,
  getInvoice,
  getInvoiceByWorkOrder,
  generateInvoice,
  updateInvoiceStatus,
};

export default invoiceService;

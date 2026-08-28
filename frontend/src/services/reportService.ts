import api from "./api";
import type {
  CustomerSummaryItem,
  DashboardStatistics,
  InventoryReport,
  TechnicianWorkloadItem,
  WorkOrderSummaryReport,
} from "../types/domain";

export async function getDashboard(): Promise<DashboardStatistics> {
  const { data } = await api.get<DashboardStatistics>("/reports/dashboard");
  return data;
}

export async function getWorkOrderReport(): Promise<WorkOrderSummaryReport> {
  const { data } = await api.get<WorkOrderSummaryReport>("/reports/work-orders");
  return data;
}

export async function getTechnicianReport(): Promise<TechnicianWorkloadItem[]> {
  const { data } = await api.get<TechnicianWorkloadItem[]>("/reports/technicians");
  return data;
}

export async function getCustomerReport(): Promise<CustomerSummaryItem[]> {
  const { data } = await api.get<CustomerSummaryItem[]>("/reports/customers");
  return data;
}

export async function getInventoryReport(): Promise<InventoryReport> {
  const { data } = await api.get<InventoryReport>("/reports/inventory");
  return data;
}

const reportService = {
  getDashboard,
  getWorkOrderReport,
  getTechnicianReport,
  getCustomerReport,
  getInventoryReport,
};

export default reportService;

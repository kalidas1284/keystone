export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  notes?: string | null;
  active: boolean;
  portalUserId?: number | null;
  portalUserEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: number;
  customerId: number;
  customerName: string;
  name: string;
  location: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CustomerRequest = Omit<
  Customer,
  "id" | "active" | "createdAt" | "updatedAt" | "portalUserId" | "portalUserEmail"
>;

export type AvailabilityStatus = "AVAILABLE" | "BUSY" | "OFF_DUTY";

export interface Technician {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  employeeCode: string;
  phone?: string | null;
  specialization?: string | null;
  availabilityStatus: AvailabilityStatus;
  currentLocation?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianRequest {
  userId: number;
  employeeCode: string;
  phone?: string;
  specialization?: string;
  availabilityStatus?: AvailabilityStatus;
  currentLocation?: string;
}

export type WorkOrderPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type WorkOrderStatus =
  | "NEW"
  | "ASSIGNED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CLOSED"
  | "CANCELLED";

export type SlaStatus = "ON_TRACK" | "AT_RISK" | "BREACHED" | "MET";

export interface WorkOrder {
  id: number;
  workOrderNumber: string;
  customerId: number;
  customerName: string;
  siteId?: number | null;
  title: string;
  description?: string | null;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  technicianId?: number | null;
  technicianName?: string | null;
  scheduledDate?: string | null;
  estimatedDuration?: number | null;
  location?: string | null;
  notes?: string | null;
  slaDueAt?: string | null;
  slaStatus?: SlaStatus | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;

  // F6 spec roll-ups
  totalPartsAmount?: number | null;
  totalLaborMinutes?: number | null;

  // F9 spec: status history visible to customer
  statusHistory?: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  id: number;
  fromStatus?: string | null;
  toStatus?: string | null;
  changedByName?: string | null;
  changedAt: string;
  note?: string | null;
}

export interface WorkOrderRequest {
  customerId: number;
  siteId: number;
  title: string;
  description?: string;
  priority: WorkOrderPriority;
  scheduledDate?: string;
  estimatedDuration?: number;
  location?: string;
  notes?: string;
}

export type ScheduleStatus = "SCHEDULED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED";

export interface Schedule {
  id: number;
  workOrderId: number;
  workOrderNumber: string;
  workOrderTitle: string;
  technicianId: number;
  technicianName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleRequest {
  workOrderId: number;
  technicianId: number;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface InventoryItem {
  id: number;
  itemCode: string;
  name: string;
  description?: string | null;
  category?: string | null;
  quantity: number;
  minimumStock: number;
  unitPrice: number;
  supplier?: string | null;
  active: boolean;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemRequest {
  itemCode: string;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  minimumStock: number;
  unitPrice: number;
  supplier?: string;
}

export interface DashboardStatistics {
  totalCustomers: number;
  totalTechnicians: number;
  openWorkOrders: number;
  completedWorkOrders: number;
  urgentWorkOrders: number;
  lowStockItems: number;
  slaBreached: number;
  slaAtRisk: number;
  slaOnTrack: number;
  slaMet: number;
  recentWorkOrders: WorkOrder[];
  workOrdersByStatus: Record<string, number>;
  technicianWorkload: TechnicianWorkloadItem[];
  lowStockList: InventoryItem[];
}

export interface TechnicianWorkloadItem {
  technicianId: number;
  technicianName: string;
  assignedJobs: number;
  completedJobs: number;
  activeJobs: number;
}

export interface WorkOrderSummaryReport {
  total: number;
  newCount: number;
  assigned: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  onHold: number;
}

export interface CustomerSummaryItem {
  customerId: number;
  customerName: string;
  totalWorkOrders: number;
  completedWorkOrders: number;
  openWorkOrders: number;
}

export interface InventoryReport {
  totalItems: number;
  lowStock: number;
  outOfStock: number;
  stockValue: number;
}

export interface TimeLog {
  id: number;
  workOrderId: number;
  loggedById: number;
  loggedByName: string;
  minutes: number;
  notes?: string | null;
  createdAt: string;
}

export interface WorkOrderPartUsage {
  id: number;
  workOrderId: number;
  inventoryItemId: number;
  itemCode: string;
  itemName: string;
  quantity: number;
  notes?: string | null;
  createdAt: string;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type?: string | null;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

export interface Attachment {
  id: number;
  workOrderId: number;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  uploadedByName: string;
  createdAt: string;
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "VOID";
export type InvoiceLineType = "LABOR" | "PART" | "OTHER";

export interface InvoiceLine {
  id: number;
  lineType: InvoiceLineType;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  workOrderId: number;
  workOrderNumber: string;
  customerId: number;
  customerName: string;
  status: InvoiceStatus;
  laborAmount: number;
  partsAmount: number;
  totalAmount: number;
  notes?: string | null;
  lines: InvoiceLine[];
  createdAt: string;
  updatedAt: string;
}


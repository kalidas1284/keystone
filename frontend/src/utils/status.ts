import type { SlaStatus, WorkOrderPriority, WorkOrderStatus } from "../types/domain";

/** Mirrors backend WorkOrderService ALLOWED_TRANSITIONS */
export const STATUS_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  NEW: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["SCHEDULED", "IN_PROGRESS", "CANCELLED"],
  SCHEDULED: ["IN_PROGRESS", "ON_HOLD", "CANCELLED"],
  IN_PROGRESS: ["ON_HOLD", "COMPLETED", "CANCELLED"],
  ON_HOLD: ["IN_PROGRESS", "CANCELLED"],
  COMPLETED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
};

export function allowedNextStatuses(
  current: WorkOrderStatus,
  options?: { allowCancel?: boolean }
): WorkOrderStatus[] {
  const allowCancel = options?.allowCancel ?? true;
  return STATUS_TRANSITIONS[current].filter((s) => allowCancel || s !== "CANCELLED");
}

export function statusTone(status: WorkOrderStatus) {
  switch (status) {
    case "COMPLETED":
      return "success" as const;
    case "CLOSED":
      return "success" as const;
    case "CANCELLED":
      return "danger" as const;
    case "IN_PROGRESS":
      return "info" as const;
    case "ON_HOLD":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

export function priorityTone(priority: WorkOrderPriority) {
  switch (priority) {
    case "URGENT":
      return "danger" as const;
    case "HIGH":
      return "warning" as const;
    case "MEDIUM":
      return "info" as const;
    default:
      return "neutral" as const;
  }
}

export function slaTone(status?: SlaStatus | null) {
  switch (status) {
    case "MET":
      return "success" as const;
    case "ON_TRACK":
      return "info" as const;
    case "AT_RISK":
      return "warning" as const;
    case "BREACHED":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

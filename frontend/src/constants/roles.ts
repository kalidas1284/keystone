export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  DISPATCHER: "DISPATCHER",
  TECHNICIAN: "TECHNICIAN",
  CUSTOMER: "CUSTOMER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  DISPATCHER: "Dispatcher",
  TECHNICIAN: "Technician",
  CUSTOMER: "Customer",
};

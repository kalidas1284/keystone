import type { Role } from "../constants/roles";

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role: Role;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

import type { Role } from "../constants/roles";
import type { User } from "./user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface ApiError {
  timestamp?: string;
  status: number;
  error?: string;
  message: string;
  path?: string;
}

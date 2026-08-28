import api from "./api";
import type { LoginRequest, LoginResponse, RegisterRequest } from "../types/auth";
import type { User } from "../types/user";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function register(payload: RegisterRequest): Promise<User> {
  const { data } = await api.post<User>("/auth/register", payload);
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}

const authService = { login, register, getCurrentUser };
export default authService;

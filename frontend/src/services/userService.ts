import api from "./api";
import type { Role } from "../constants/roles";
import type { User } from "../types/user";

export async function listUsers(role?: Role): Promise<User[]> {
  const { data } = await api.get<User[]>("/users", { params: role ? { role } : undefined });
  return data;
}

export async function createUser(payload: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: Role;
}): Promise<User> {
  const { data } = await api.post<User>("/users", payload);
  return data;
}

export async function updateUser(
  id: number,
  payload: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: Role;
    active: boolean;
  }
): Promise<User> {
  const { data } = await api.put<User>(`/users/${id}`, payload);
  return data;
}

export async function deactivateUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function updateProfile(payload: {
  fullName: string;
  phoneNumber?: string;
}): Promise<User> {
  const { data } = await api.put<User>("/users/me", payload);
  return data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await api.put("/users/me/password", payload);
}

const userService = {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
  updateProfile,
  changePassword,
};

export default userService;

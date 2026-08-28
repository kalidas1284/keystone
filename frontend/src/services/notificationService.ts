import api from "./api";
import type { AppNotification } from "../types/domain";

export async function listNotifications(): Promise<AppNotification[]> {
  const { data } = await api.get<AppNotification[]>("/notifications");
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>("/notifications/unread-count");
  return data.count;
}

export async function markRead(id: number): Promise<AppNotification> {
  const { data } = await api.post<AppNotification>(`/notifications/${id}/read`);
  return data;
}

export async function markAllRead(): Promise<void> {
  await api.post("/notifications/read-all");
}

const notificationService = {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
};

export default notificationService;

import api from "./api";
import type { Attachment } from "../types/domain";
import { getToken } from "../utils/storage";
import { API_BASE_URL } from "../constants/api";

export async function listAttachments(workOrderId: number): Promise<Attachment[]> {
  const { data } = await api.get<Attachment[]>(`/work-orders/${workOrderId}/attachments`);
  return data;
}

export async function uploadAttachment(workOrderId: number, file: File): Promise<Attachment> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<Attachment>(`/work-orders/${workOrderId}/attachments`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteAttachment(workOrderId: number, attachmentId: number): Promise<void> {
  await api.delete(`/work-orders/${workOrderId}/attachments/${attachmentId}`);
}

export function attachmentDownloadUrl(workOrderId: number, attachmentId: number): string {
  return `${API_BASE_URL}/work-orders/${workOrderId}/attachments/${attachmentId}/download`;
}

export async function downloadAttachment(
  workOrderId: number,
  attachmentId: number,
  filename: string
): Promise<void> {
  const blob = await fetchAttachmentBlob(workOrderId, attachmentId);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function fetchAttachmentBlob(
  workOrderId: number,
  attachmentId: number
): Promise<Blob> {
  const token = getToken();
  const response = await fetch(attachmentDownloadUrl(workOrderId, attachmentId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error("Download failed");
  }
  return response.blob();
}

const attachmentService = {
  listAttachments,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
  fetchAttachmentBlob,
};

export default attachmentService;

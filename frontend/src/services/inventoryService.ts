import api from "./api";
import type { InventoryItem, InventoryItemRequest, PageResponse } from "../types/domain";

export async function listInventory(params: {
  search?: string;
  category?: string;
  active?: boolean;
  page?: number;
  size?: number;
}): Promise<PageResponse<InventoryItem>> {
  const { data } = await api.get<PageResponse<InventoryItem>>("/inventory", { params });
  return data;
}

export async function createInventoryItem(payload: InventoryItemRequest): Promise<InventoryItem> {
  const { data } = await api.post<InventoryItem>("/inventory", payload);
  return data;
}

export async function updateInventoryItem(
  id: number,
  payload: InventoryItemRequest
): Promise<InventoryItem> {
  const { data } = await api.put<InventoryItem>(`/inventory/${id}`, payload);
  return data;
}

export async function stockIn(
  id: number,
  quantity: number,
  reference?: string,
  notes?: string
): Promise<InventoryItem> {
  const { data } = await api.post<InventoryItem>(`/inventory/${id}/stock-in`, {
    quantity,
    reference,
    notes,
  });
  return data;
}

export async function stockOut(
  id: number,
  quantity: number,
  reference?: string,
  notes?: string
): Promise<InventoryItem> {
  const { data } = await api.post<InventoryItem>(`/inventory/${id}/stock-out`, {
    quantity,
    reference,
    notes,
  });
  return data;
}

export async function deactivateInventoryItem(id: number): Promise<void> {
  await api.delete(`/inventory/${id}`);
}

const inventoryService = {
  listInventory,
  createInventoryItem,
  updateInventoryItem,
  stockIn,
  stockOut,
  deactivateInventoryItem,
};

export default inventoryService;

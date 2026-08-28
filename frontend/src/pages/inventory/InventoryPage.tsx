import { useEffect, useState, type FormEvent } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import inventoryService from "../../services/inventoryService";
import { getErrorMessage } from "../../services/api";
import type { InventoryItem, InventoryItemRequest } from "../../types/domain";

const emptyForm: InventoryItemRequest = {
  itemCode: "",
  name: "",
  description: "",
  category: "",
  quantity: 0,
  minimumStock: 5,
  unitPrice: 0,
  supplier: "",
};

function InventoryPage() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [stockOpen, setStockOpen] = useState(false);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<InventoryItem | null>(null);
  const [stockQty, setStockQty] = useState(1);
  const [stockMode, setStockMode] = useState<"in" | "out">("in");
  const [form, setForm] = useState<InventoryItemRequest>(emptyForm);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.listInventory({
        search: search || undefined,
        active: true,
        page: 0,
        size: 50,
      });
      setItems(data.content);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load inventory"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setForm({
      itemCode: item.itemCode,
      name: item.name,
      description: item.description || "",
      category: item.category || "",
      quantity: item.quantity,
      minimumStock: item.minimumStock,
      unitPrice: item.unitPrice,
      supplier: item.supplier || "",
    });
    setFormOpen(true);
  };

  const saveItem = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (editing) {
        await inventoryService.updateInventoryItem(editing.id, form);
      } else {
        await inventoryService.createInventoryItem(form);
      }
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, editing ? "Failed to update item" : "Failed to create item"));
    }
  };

  const adjustStock = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    try {
      if (stockMode === "in") {
        await inventoryService.stockIn(selected.id, stockQty);
      } else {
        await inventoryService.stockOut(selected.id, stockQty);
      }
      setStockOpen(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Stock adjustment failed"));
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await inventoryService.deactivateInventoryItem(deactivateTarget.id);
      setDeactivateTarget(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to deactivate item"));
      setDeactivateTarget(null);
    }
  };

  const stockTone = (status: InventoryItem["stockStatus"]) => {
    if (status === "OUT_OF_STOCK") return "danger" as const;
    if (status === "LOW_STOCK") return "warning" as const;
    return "success" as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Parts tracking with low-stock detection</p>
        </div>
        {canManage && <Button onClick={openCreate}>Add Item</Button>}
      </div>

      <Card>
        <form
          className="flex flex-wrap gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
          <Input
            className="min-w-[240px] flex-1"
            placeholder="Search code, name, category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
      </Card>

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState title="No inventory items" />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Min</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.itemCode}</td>
                  <td className="px-4 py-3 text-slate-700">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.category || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-slate-600">{item.minimumStock}</td>
                  <td className="px-4 py-3">
                    <Badge tone={stockTone(item.stockStatus)}>{item.stockStatus}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {canManage ? (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          className="!px-2 !py-1 text-xs"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          className="!px-2 !py-1 text-xs"
                          onClick={() => {
                            setSelected(item);
                            setStockMode("in");
                            setStockQty(1);
                            setStockOpen(true);
                          }}
                        >
                          Stock In
                        </Button>
                        <Button
                          variant="secondary"
                          className="!px-2 !py-1 text-xs"
                          onClick={() => {
                            setSelected(item);
                            setStockMode("out");
                            setStockQty(1);
                            setStockOpen(true);
                          }}
                        >
                          Stock Out
                        </Button>
                        <Button
                          variant="danger"
                          className="!px-2 !py-1 text-xs"
                          onClick={() => setDeactivateTarget(item)}
                        >
                          Deactivate
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">View only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={formOpen}
        title={editing ? "Edit Inventory Item" : "Add Inventory Item"}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setFormOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form="inv-form">
              {editing ? "Save" : "Create"}
            </Button>
          </>
        }
      >
        <form id="inv-form" className="grid gap-3 sm:grid-cols-2" onSubmit={saveItem}>
          <Input
            required
            placeholder="Item code"
            value={form.itemCode}
            onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
          />
          <Input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            placeholder="Supplier"
            value={form.supplier}
            onChange={(e) => setForm({ ...form, supplier: e.target.value })}
          />
          <Input
            type="number"
            min={0}
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            disabled={!!editing}
          />
          <Input
            type="number"
            min={0}
            placeholder="Minimum stock"
            value={form.minimumStock}
            onChange={(e) => setForm({ ...form, minimumStock: Number(e.target.value) })}
          />
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="Unit price"
            value={form.unitPrice}
            onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
          />
          <Input
            className="sm:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </form>
      </Modal>

      <Modal
        open={stockOpen}
        title={stockMode === "in" ? "Stock In" : "Stock Out"}
        onClose={() => setStockOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setStockOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="stock-form">
              Confirm
            </Button>
          </>
        }
      >
        <form id="stock-form" onSubmit={adjustStock}>
          <p className="mb-3 text-sm text-slate-600">{selected?.name}</p>
          <Input
            type="number"
            min={1}
            required
            value={stockQty}
            onChange={(e) => setStockQty(Number(e.target.value))}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deactivateTarget}
        title="Deactivate item?"
        message={`Deactivate ${deactivateTarget?.itemCode} — ${deactivateTarget?.name}?`}
        confirmLabel="Deactivate"
        onCancel={() => setDeactivateTarget(null)}
        onConfirm={() => void confirmDeactivate()}
      />
    </div>
  );
}

export default InventoryPage;

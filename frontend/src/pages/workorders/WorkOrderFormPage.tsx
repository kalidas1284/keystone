import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Select from "../../components/ui/Select";
import customerService from "../../services/customerService";
import { getErrorMessage } from "../../services/api";
import workOrderService from "../../services/workOrderService";
import type { Customer, Site, WorkOrderPriority, WorkOrderRequest } from "../../types/domain";

function WorkOrderFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<WorkOrderRequest>({
    customerId: Number(searchParams.get("customerId") || 0),
    siteId: 0,
    title: "",
    description: "",
    priority: "MEDIUM",
    scheduledDate: "",
    estimatedDuration: 60,
    location: "",
    notes: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const customerPage = await customerService.listCustomers({ active: true, page: 0, size: 100 });
        setCustomers(customerPage.content);
        if (isEdit && id) {
          const order = await workOrderService.getWorkOrder(Number(id));
          setForm({
            customerId: order.customerId,
                siteId: order.siteId ?? 0,
            title: order.title,
            description: order.description || "",
            priority: order.priority,
            scheduledDate: order.scheduledDate || "",
            estimatedDuration: order.estimatedDuration || 60,
            location: order.location || "",
            notes: order.notes || "",
          });
        } else if (!form.customerId && customerPage.content[0]) {
              setForm((prev) => ({ ...prev, customerId: customerPage.content[0].id }));
        }
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load form data"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, isEdit]);

  // Keep site list in sync with the selected customer.
  useEffect(() => {
    const loadSites = async () => {
      if (!form.customerId) return;
      try {
        const sitePage = await customerService.listCustomerSites(form.customerId, { page: 0, size: 100 });
        const siteList = sitePage.content;
        setSites(siteList);
        setForm((prev) => {
          const nextSiteId =
            prev.siteId && siteList.some((s) => s.id === prev.siteId)
              ? prev.siteId
              : siteList[0]?.id ?? 0;
          return { ...prev, siteId: nextSiteId };
        });
      } catch (err) {
        // Non-blocking: form can still be saved if siteId is already correct.
      }
    };
    void loadSites();
  }, [form.customerId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        scheduledDate: form.scheduledDate || undefined,
      };
      if (isEdit && id) {
        await workOrderService.updateWorkOrder(Number(id), payload);
        navigate(`/work-orders/${id}`);
      } else {
        const created = await workOrderService.createWorkOrder(payload);
        navigate(`/work-orders/${created.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save work order"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? "Edit Work Order" : "New Work Order"}</h1>
        <p className="mt-1 text-sm text-slate-500">Capture service request details</p>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Customer</label>
            <Select
              required
              value={form.customerId || ""}
              onChange={(e) => setForm({ ...form, customerId: Number(e.target.value) })}
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Site</label>
            <Select
              required
              value={form.siteId || ""}
              onChange={(e) => setForm({ ...form, siteId: Number(e.target.value) })}
              disabled={sites.length === 0}
            >
              <option value="">{sites.length === 0 ? "Select customer first" : "Select site"}</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Title</label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Priority</label>
            <Select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as WorkOrderPriority })}
            >
              {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Estimated Duration (min)</label>
            <Input
              type="number"
              min={15}
              value={form.estimatedDuration || 60}
              onChange={(e) => setForm({ ...form, estimatedDuration: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Scheduled Date</label>
            <Input
              type="date"
              value={form.scheduledDate || ""}
              onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Location</label>
            <Input value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Notes</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {error && <div className="md:col-span-2"><ErrorMessage message={error} /></div>}

          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            <Link to="/work-orders"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default WorkOrderFormPage;

import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import { getErrorMessage } from "../../services/api";
import technicianService from "../../services/technicianService";
import type { AvailabilityStatus, Technician, WorkOrder } from "../../types/domain";
import { priorityTone, statusTone } from "../../utils/status";

function TechnicianDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [form, setForm] = useState({
    employeeCode: "",
    phone: "",
    specialization: "",
    currentLocation: "",
    availabilityStatus: "AVAILABLE" as AvailabilityStatus,
  });

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [profile, orders] = await Promise.all([
        technicianService.getTechnician(Number(id)),
        technicianService.getTechnicianWorkOrders(Number(id)),
      ]);
      setTechnician(profile);
      setWorkOrders(orders);
      setForm({
        employeeCode: profile.employeeCode,
        phone: profile.phone || "",
        specialization: profile.specialization || "",
        currentLocation: profile.currentLocation || "",
        availabilityStatus: profile.availabilityStatus,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load technician"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const updateAvailability = async (availabilityStatus: AvailabilityStatus) => {
    if (!id) return;
    try {
      const updated = await technicianService.updateAvailability(Number(id), availabilityStatus);
      setTechnician(updated);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update availability"));
    }
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!technician) return;
    try {
      const updated = await technicianService.updateTechnician(technician.id, {
        userId: technician.userId,
        employeeCode: form.employeeCode,
        phone: form.phone || undefined,
        specialization: form.specialization || undefined,
        currentLocation: form.currentLocation || undefined,
        availabilityStatus: form.availabilityStatus,
      });
      setTechnician(updated);
      setEditOpen(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update technician"));
    }
  };

  const deactivate = async () => {
    if (!technician) return;
    try {
      await technicianService.deactivateTechnician(technician.id);
      setConfirmDeactivate(false);
      navigate("/technicians");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to deactivate technician"));
      setConfirmDeactivate(false);
    }
  };

  if (loading) return <Loader />;
  if (error && !technician) return <ErrorMessage message={error} />;
  if (!technician) return <EmptyState title="Technician not found" />;

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{technician.fullName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {technician.employeeCode} · {technician.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setConfirmDeactivate(true)}>
            Deactivate
          </Button>
          <Link to="/technicians">
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3">
          <h2 className="font-semibold text-slate-900">Profile</h2>
          <p className="text-sm text-slate-600">Specialization: {technician.specialization || "—"}</p>
          <p className="text-sm text-slate-600">Phone: {technician.phone || "—"}</p>
          <p className="text-sm text-slate-600">Location: {technician.currentLocation || "—"}</p>
          <p className="text-sm text-slate-600">Active: {technician.active ? "Yes" : "No"}</p>
        </Card>
        <Card className="space-y-3">
          <h2 className="font-semibold text-slate-900">Availability</h2>
          <Badge>{technician.availabilityStatus}</Badge>
          <Select
            value={technician.availabilityStatus}
            onChange={(e) => void updateAvailability(e.target.value as AvailabilityStatus)}
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="BUSY">BUSY</option>
            <option value="OFF_DUTY">OFF_DUTY</option>
          </Select>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-semibold text-slate-900">Assigned Work Orders</h2>
        {workOrders.length === 0 ? (
          <EmptyState title="No assigned work orders" />
        ) : (
          <div className="space-y-2">
            {workOrders.map((order) => (
              <Link
                key={order.id}
                to={`/work-orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-800">{order.workOrderNumber}</p>
                  <p className="text-sm text-slate-500">{order.title}</p>
                </div>
                <div className="flex gap-2">
                  <Badge tone={priorityTone(order.priority)}>{order.priority}</Badge>
                  <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={editOpen}
        title="Edit Technician"
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="tech-edit">
              Save
            </Button>
          </>
        }
      >
        <form id="tech-edit" className="space-y-3" onSubmit={saveEdit}>
          <Input
            required
            placeholder="Employee code"
            value={form.employeeCode}
            onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
          />
          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            placeholder="Specialization"
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          />
          <Input
            placeholder="Current location"
            value={form.currentLocation}
            onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
          />
          <Select
            value={form.availabilityStatus}
            onChange={(e) =>
              setForm({ ...form, availabilityStatus: e.target.value as AvailabilityStatus })
            }
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="BUSY">BUSY</option>
            <option value="OFF_DUTY">OFF_DUTY</option>
          </Select>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDeactivate}
        title="Deactivate technician?"
        message={`Deactivate ${technician.fullName}? They will no longer be assignable to new jobs.`}
        confirmLabel="Deactivate"
        onCancel={() => setConfirmDeactivate(false)}
        onConfirm={() => void deactivate()}
      />
    </div>
  );
}

export default TechnicianDetailsPage;

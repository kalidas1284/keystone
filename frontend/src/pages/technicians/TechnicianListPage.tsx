import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";
import technicianService from "../../services/technicianService";
import api from "../../services/api";
import type { AvailabilityStatus, Technician } from "../../types/domain";
import type { User } from "../../types/user";

function TechnicianListPage() {
  const { user } = useAuth();
  const canCreate =
    user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "DISPATCHER";
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    userId: "",
    employeeCode: "",
    phone: "",
    specialization: "",
    availabilityStatus: "AVAILABLE" as AvailabilityStatus,
    currentLocation: "",
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await technicianService.listTechnicians({
        search: search || undefined,
        availability: (availability || undefined) as AvailabilityStatus | undefined,
        active: true,
        page: 0,
        size: 50,
      });
      setTechnicians(data.content);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load technicians"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = async () => {
    setMode("new");
    setFormError(null);
    setForm({
      fullName: "",
      email: "",
      password: "password123",
      userId: "",
      employeeCode: "",
      phone: "",
      specialization: "",
      availabilityStatus: "AVAILABLE",
      currentLocation: "",
    });
    setModalOpen(true);
    try {
      const [userRes, techPage] = await Promise.all([
        api.get<User[]>("/users", { params: { role: "TECHNICIAN" } }),
        technicianService.listTechnicians({ active: true, page: 0, size: 100 }),
      ]);
      const linkedIds = new Set(techPage.content.map((t) => t.userId));
      setUsers(userRes.data.filter((u) => u.active && !linkedIds.has(u.id)));
    } catch {
      setUsers([]);
    }
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (mode === "new") {
        await technicianService.createTechnicianWithAccount({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          employeeCode: form.employeeCode,
          phone: form.phone || undefined,
          specialization: form.specialization || undefined,
          availabilityStatus: form.availabilityStatus,
          currentLocation: form.currentLocation || undefined,
        });
      } else {
        await technicianService.createTechnician({
          userId: Number(form.userId),
          employeeCode: form.employeeCode,
          phone: form.phone || undefined,
          specialization: form.specialization || undefined,
          availabilityStatus: form.availabilityStatus,
          currentLocation: form.currentLocation || undefined,
        });
      }
      toast.success("Technician created");
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to create technician"));
    } finally {
      setSubmitting(false);
    }
  };

  const tone = (status: AvailabilityStatus) => {
    if (status === "AVAILABLE") return "success" as const;
    if (status === "BUSY") return "warning" as const;
    return "neutral" as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Technicians</h1>
          <p className="mt-1 text-sm text-slate-500">Field workforce availability and specialization</p>
        </div>
        {canCreate && <Button onClick={() => void openCreate()}>Add Technician</Button>}
      </div>

      <Card>
        <form
          className="grid gap-3 md:grid-cols-[1fr_180px_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
          <Input
            placeholder="Search name, code, specialization"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="">All availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Busy</option>
            <option value="OFF_DUTY">Off duty</option>
          </Select>
          <Button type="submit">Search</Button>
        </form>
      </Card>

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <Loader />
      ) : technicians.length === 0 ? (
        <EmptyState
          title="No technicians found"
          description="Add a worker with login details to create a technician profile."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {technicians.map((tech) => (
            <Card key={tech.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    to={`/technicians/${tech.id}`}
                    className="text-lg font-semibold text-slate-900 hover:text-blue-600"
                  >
                    {tech.fullName}
                  </Link>
                  <p className="text-sm text-slate-500">{tech.employeeCode}</p>
                </div>
                <Badge tone={tone(tech.availabilityStatus)}>{tech.availabilityStatus}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">{tech.specialization || "General technician"}</p>
              <p className="mt-1 text-sm text-slate-500">{tech.currentLocation || "No location set"}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title="Add Technician"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="tech-form" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </>
        }
      >
        <form id="tech-form" className="space-y-3" onSubmit={handleCreate}>
          <div className="flex gap-2 rounded-lg bg-slate-50 p-1">
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                mode === "new" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
              onClick={() => setMode("new")}
            >
              New worker account
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                mode === "existing" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
              onClick={() => setMode("existing")}
            >
              Link existing user
            </button>
          </div>

          {mode === "new" ? (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Full name</label>
                <Input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Login email</label>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Temporary password</label>
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium">User (TECHNICIAN role)</label>
              <Select
                required
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
              >
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </Select>
              {users.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  No unlinked technician users available. Use “New worker account” instead.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">Employee code</label>
            <Input
              required
              placeholder="TECH-002"
              value={form.employeeCode}
              onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Specialization</label>
            <Input
              placeholder="HVAC, Electrical, Plumbing..."
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Phone</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Location</label>
            <Input
              value={form.currentLocation}
              onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Availability</label>
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
          </div>

          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}

export default TechnicianListPage;

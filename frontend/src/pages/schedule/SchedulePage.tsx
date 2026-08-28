import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";
import scheduleService from "../../services/scheduleService";
import technicianService from "../../services/technicianService";
import workOrderService from "../../services/workOrderService";
import type { Schedule, Technician, WorkOrder } from "../../types/domain";
import { formatDate } from "../../utils/helpers";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function SchedulePage() {
  const { user } = useAuth();
  const canManage = user?.role !== "TECHNICIAN";
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Schedule | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [form, setForm] = useState({
    workOrderId: "",
    technicianId: "",
    scheduledDate: "",
    startTime: "09:00",
    endTime: "10:00",
    notes: "",
  });

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const from = toIsoDate(weekStart);
      const to = toIsoDate(addDays(weekStart, 6));
      const data = await scheduleService.listSchedules({ from, to });
      setSchedules(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load schedules"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [weekStart]);

  const openCreate = async (date?: string) => {
    setEditing(null);
    setForm({
      workOrderId: "",
      technicianId: "",
      scheduledDate: date || toIsoDate(new Date()),
      startTime: "09:00",
      endTime: "10:00",
      notes: "",
    });
    setOpen(true);
    try {
      const [techPage, woPage] = await Promise.all([
        technicianService.listTechnicians({ active: true, page: 0, size: 100 }),
        workOrderService.listWorkOrders({ page: 0, size: 100 }),
      ]);
      setTechnicians(techPage.content);
      setWorkOrders(woPage.content.filter((w) => w.status !== "COMPLETED" && w.status !== "CANCELLED"));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load schedule form data"));
    }
  };

  const openEdit = async (item: Schedule) => {
    setEditing(item);
    setForm({
      workOrderId: String(item.workOrderId),
      technicianId: String(item.technicianId),
      scheduledDate: item.scheduledDate,
      startTime: item.startTime.slice(0, 5),
      endTime: item.endTime.slice(0, 5),
      notes: item.notes || "",
    });
    setOpen(true);
    try {
      const [techPage, woPage] = await Promise.all([
        technicianService.listTechnicians({ active: true, page: 0, size: 100 }),
        workOrderService.listWorkOrders({ page: 0, size: 100 }),
      ]);
      setTechnicians(techPage.content);
      setWorkOrders(woPage.content.filter((w) => w.status !== "COMPLETED" && w.status !== "CANCELLED"));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load schedule form data"));
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      workOrderId: Number(form.workOrderId),
      technicianId: Number(form.technicianId),
      scheduledDate: form.scheduledDate,
      startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
      endTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
      notes: form.notes || undefined,
    };
    try {
      if (editing) {
        await scheduleService.updateSchedule(editing.id, payload);
      } else {
        await scheduleService.createSchedule(payload);
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, editing ? "Failed to reschedule" : "Failed to create schedule"));
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      await scheduleService.cancelSchedule(cancelTarget.id);
      setCancelTarget(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to cancel schedule"));
      setCancelTarget(null);
    }
  };

  const byDay = (iso: string) =>
    schedules.filter((s) => s.scheduledDate === iso && s.status !== "CANCELLED");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
          <p className="mt-1 text-sm text-slate-500">Weekly calendar with conflict-aware booking</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setWeekStart(startOfWeek(addDays(weekStart, -7)))}>
            Previous
          </Button>
          <Button variant="secondary" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            This week
          </Button>
          <Button variant="secondary" onClick={() => setWeekStart(startOfWeek(addDays(weekStart, 7)))}>
            Next
          </Button>
          {canManage && <Button onClick={() => void openCreate()}>New Schedule</Button>}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <Loader />
      ) : (
        <div className="grid gap-3 lg:grid-cols-7">
          {weekDays.map((day) => {
            const iso = toIsoDate(day);
            const items = byDay(iso);
            const isToday = iso === toIsoDate(new Date());
            return (
              <Card
                key={iso}
                className={`min-h-48 space-y-2 !p-3 ${isToday ? "ring-2 ring-blue-200" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {day.toLocaleDateString(undefined, { weekday: "short" })}
                    </p>
                    <p className="text-sm font-bold text-slate-900">{formatDate(iso)}</p>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      className="text-xs font-medium text-blue-600 hover:underline"
                      onClick={() => void openCreate(iso)}
                    >
                      + Add
                    </button>
                  )}
                </div>
                {items.length === 0 ? (
                  <p className="pt-6 text-center text-xs text-slate-400">No visits</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left"
                    >
                      <p className="text-xs font-semibold text-slate-800">
                        {item.startTime.slice(0, 5)}–{item.endTime.slice(0, 5)}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{item.workOrderNumber}</p>
                      <p className="text-[11px] text-slate-500">{item.technicianName}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge tone={item.status === "RESCHEDULED" ? "warning" : "info"}>
                          {item.status}
                        </Badge>
                        {canManage && (
                          <>
                            <button
                              type="button"
                              className="text-[11px] font-medium text-blue-600"
                              onClick={() => void openEdit(item)}
                            >
                              Reschedule
                            </button>
                            <button
                              type="button"
                              className="text-[11px] font-medium text-red-600"
                              onClick={() => setCancelTarget(item)}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </Card>
            );
          })}
        </div>
      )}

      {!loading && schedules.filter((s) => s.status === "CANCELLED").length > 0 && (
        <EmptyState
          title="Cancelled visits hidden from calendar"
          description={`${schedules.filter((s) => s.status === "CANCELLED").length} cancelled this week`}
        />
      )}

      <Modal
        open={open}
        title={editing ? "Reschedule" : "Create Schedule"}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form="schedule-form">
              {editing ? "Save changes" : "Save"}
            </Button>
          </>
        }
      >
        <form id="schedule-form" className="space-y-3" onSubmit={save}>
          <Select
            required
            value={form.workOrderId}
            onChange={(e) => setForm({ ...form, workOrderId: e.target.value })}
            disabled={!!editing}
          >
            <option value="">Select work order</option>
            {workOrders.map((w) => (
              <option key={w.id} value={w.id}>
                {w.workOrderNumber} — {w.title}
              </option>
            ))}
            {editing && !workOrders.some((w) => w.id === editing.workOrderId) && (
              <option value={editing.workOrderId}>
                {editing.workOrderNumber} — {editing.workOrderTitle}
              </option>
            )}
          </Select>
          <Select
            required
            value={form.technicianId}
            onChange={(e) => setForm({ ...form, technicianId: e.target.value })}
          >
            <option value="">Select technician</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            required
            value={form.scheduledDate}
            onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="time"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <Input
              type="time"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
          <Input
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel schedule?"
        message={`Cancel visit for ${cancelTarget?.workOrderNumber} on ${cancelTarget?.scheduledDate}?`}
        confirmLabel="Cancel visit"
        onCancel={() => setCancelTarget(null)}
        onConfirm={() => void confirmCancel()}
      />
    </div>
  );
}

export default SchedulePage;

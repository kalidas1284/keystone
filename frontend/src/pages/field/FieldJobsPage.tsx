import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, MapPin, Play, Pause } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Loader from "../../components/ui/Loader";
import { getErrorMessage } from "../../services/api";
import workOrderService from "../../services/workOrderService";
import type { WorkOrder, WorkOrderStatus } from "../../types/domain";
import { formatDate, formatDateTime } from "../../utils/helpers";
import { priorityTone, slaTone, statusTone } from "../../utils/status";

const ACTIVE: WorkOrderStatus[] = ["ASSIGNED", "SCHEDULED", "IN_PROGRESS", "ON_HOLD"];

function FieldJobsPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await workOrderService.listWorkOrders({ page: 0, size: 50 });
      setOrders(page.content);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load your jobs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const { todayJobs, otherActive, completedToday } = useMemo(() => {
    const todayList = orders.filter(
      (o) => ACTIVE.includes(o.status) && o.scheduledDate === today
    );
    const other = orders.filter(
      (o) => ACTIVE.includes(o.status) && o.scheduledDate !== today
    );
    const done = orders.filter(
      (o) => o.status === "COMPLETED" && o.completedAt?.startsWith(today)
    );
    return { todayJobs: todayList, otherActive: other, completedToday: done };
  }, [orders, today]);

  const updateStatus = async (id: number, status: WorkOrderStatus) => {
    setBusyId(id);
    setError(null);
    try {
      if (status === "COMPLETED") {
        await workOrderService.completeWorkOrder(id);
      } else {
        await workOrderService.updateStatus(id, status);
      }
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update job status"));
    } finally {
      setBusyId(null);
    }
  };

  const renderJob = (order: WorkOrder) => (
    <Card key={order.id} className="space-y-4 border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {order.workOrderNumber}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{order.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{order.customerName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={priorityTone(order.priority)}>{order.priority}</Badge>
          <Badge tone={statusTone(order.status)}>{order.status}</Badge>
          {order.slaStatus && <Badge tone={slaTone(order.slaStatus)}>SLA {order.slaStatus}</Badge>}
        </div>
      </div>

      <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <p className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          {order.location || "No location set"}
        </p>
        <p>
          Scheduled: {order.scheduledDate ? formatDate(order.scheduledDate) : "Not scheduled"}
        </p>
        {order.slaDueAt && <p>SLA due: {formatDateTime(order.slaDueAt)}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {(order.status === "ASSIGNED" || order.status === "SCHEDULED" || order.status === "ON_HOLD") && (
          <Button
            className="min-h-11 flex-1 sm:flex-none"
            disabled={busyId === order.id}
            onClick={() => void updateStatus(order.id, "IN_PROGRESS")}
          >
            <span className="inline-flex items-center gap-2">
              <Play className="h-4 w-4" /> Start job
            </span>
          </Button>
        )}
        {order.status === "IN_PROGRESS" && (
          <>
            <Button
              variant="secondary"
              className="min-h-11 flex-1 sm:flex-none"
              disabled={busyId === order.id}
              onClick={() => void updateStatus(order.id, "ON_HOLD")}
            >
              <span className="inline-flex items-center gap-2">
                <Pause className="h-4 w-4" /> Hold
              </span>
            </Button>
            <Button
              className="min-h-11 flex-1 sm:flex-none"
              disabled={busyId === order.id}
              onClick={() => void updateStatus(order.id, "COMPLETED")}
            >
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Complete
              </span>
            </Button>
          </>
        )}
        <Link to={`/work-orders/${order.id}`} className="min-h-11 flex-1 sm:flex-none">
          <Button variant="secondary" className="h-full w-full min-h-11">
            Details / time & parts
          </Button>
        </Link>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="ks-slide-up">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Field board</p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)]">
          My jobs
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Start, hold, and complete assigned work for today.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <Loader />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Today ({todayJobs.length})
            </h2>
            {todayJobs.length === 0 ? (
              <EmptyState title="No jobs scheduled for today" description="Check upcoming assignments below." />
            ) : (
              todayJobs.map(renderJob)
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Upcoming / open ({otherActive.length})
            </h2>
            {otherActive.length === 0 ? (
              <EmptyState title="No other open jobs" />
            ) : (
              otherActive.map(renderJob)
            )}
          </section>

          {completedToday.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Completed today ({completedToday.length})
              </h2>
              {completedToday.map((order) => (
                <Card key={order.id} className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-800">{order.workOrderNumber}</p>
                    <p className="text-sm text-slate-500">{order.title}</p>
                  </div>
                  <Badge tone="success">COMPLETED</Badge>
                </Card>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default FieldJobsPage;

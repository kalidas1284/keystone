import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import DashboardCharts from "../../components/dashboard/DashboardCharts";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";
import reportService from "../../services/reportService";
import type { DashboardStatistics } from "../../types/domain";
import { priorityTone, statusTone } from "../../utils/status";

function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const dashboard = await reportService.getDashboard();
        setData(dashboard);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load dashboard"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return <EmptyState title="No dashboard data" />;

  const cards = [
    { label: "Customers", value: data.totalCustomers, hint: "Active accounts" },
    { label: "Technicians", value: data.totalTechnicians, hint: "Field workforce" },
    { label: "Open jobs", value: data.openWorkOrders, hint: "Needs attention" },
    { label: "Completed", value: data.completedWorkOrders, hint: "Closed work orders" },
    { label: "Urgent", value: data.urgentWorkOrders, hint: "Priority queue" },
    { label: "Low stock", value: data.lowStockItems, hint: "Inventory alerts" },
    { label: "Overdue work", value: data.slaBreached, hint: "Past due" },
    { label: "SLA breached", value: data.slaBreached, hint: "SLA breach" },
    { label: "SLA at risk", value: data.slaAtRisk, hint: "Closing window" },
    { label: "SLA on track", value: data.slaOnTrack, hint: "Healthy" },
  ];

  return (
    <div className="space-y-7">
      <div className="ks-slide-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Overview</p>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Welcome back, {user?.fullName}. Live operational pulse.
          </p>
        </div>
        <div className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
          Real-time · PostgreSQL
        </div>
      </div>

      <div className="ks-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} className="!p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow)]">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="font-display mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{card.hint}</p>
          </Card>
        ))}
      </div>

      <DashboardCharts data={data} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[var(--ink)]">Recent work orders</h2>
            <Link to="/work-orders" className="text-xs font-semibold text-teal-700 hover:underline">
              View all
            </Link>
          </div>
          {data.recentWorkOrders.length === 0 ? (
            <EmptyState title="No work orders yet" />
          ) : (
            <div className="space-y-2">
              {data.recentWorkOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/work-orders/${order.id}`}
                  className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2.5 transition hover:border-teal-200 hover:bg-teal-50/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{order.workOrderNumber}</p>
                    <p className="text-xs text-slate-500">{order.title}</p>
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

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[var(--ink)]">Low stock</h2>
            <Link to="/inventory" className="text-xs font-semibold text-teal-700 hover:underline">
              Inventory
            </Link>
          </div>
          {data.lowStockList.length === 0 ? (
            <EmptyState title="Stock levels look healthy" />
          ) : (
            <ul className="space-y-2 text-sm">
              {data.lowStockList.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2.5"
                >
                  <span className="font-medium text-slate-800">{item.name}</span>
                  <Badge tone="warning">{item.quantity} left</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;

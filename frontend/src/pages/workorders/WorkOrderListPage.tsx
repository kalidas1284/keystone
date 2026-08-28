import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Select from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";
import workOrderService from "../../services/workOrderService";
import type { WorkOrder, WorkOrderPriority, WorkOrderStatus } from "../../types/domain";
import { formatDate } from "../../utils/helpers";
import { priorityTone, slaTone, statusTone } from "../../utils/status";

function WorkOrderListPage() {
  const { user } = useAuth();
  const canCreate = user?.role !== "TECHNICIAN";
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardView, setBoardView] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workOrderService.listWorkOrders({
        search: search || undefined,
        status: (status || undefined) as WorkOrderStatus | undefined,
        priority: (priority || undefined) as WorkOrderPriority | undefined,
        page: boardView ? 0 : page,
        size: boardView ? 200 : 10,
      });
      setOrders(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load work orders"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, status, priority, boardView]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(0);
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Work Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Track service jobs from creation to completion</p>
        </div>
        {canCreate && (
          <Link to="/work-orders/new">
            <Button>New Work Order</Button>
          </Link>
        )}
        <Button variant="secondary" onClick={() => setBoardView((v) => !v)}>
          {boardView ? "Table view" : "Board view"}
        </Button>
      </div>

      <Card>
        <form className="grid gap-3 md:grid-cols-[1fr_160px_160px_auto]" onSubmit={handleSearch}>
          <Input placeholder="Search WO number, title, customer" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {["NEW","ASSIGNED","SCHEDULED","IN_PROGRESS","ON_HOLD","COMPLETED","CLOSED","CANCELLED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All priorities</option>
            {["LOW","MEDIUM","HIGH","URGENT"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <Button type="submit">Filter</Button>
        </form>
      </Card>

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <EmptyState title="No work orders found" />
      ) : (
        <>
          {boardView ? (
            <div className="grid gap-4 lg:grid-cols-6 md:grid-cols-3">
              {(
                ["NEW","ASSIGNED","SCHEDULED","IN_PROGRESS","ON_HOLD","COMPLETED"] as WorkOrderStatus[]
              ).map((st) => {
                const col = orders.filter((o) => o.status === st);
                return (
                  <Card key={st} className="space-y-3 !p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">{st}</h3>
                      <Badge tone={statusTone(st)}>{col.length}</Badge>
                    </div>
                    {col.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 p-2 text-center text-xs text-slate-400">
                        No jobs
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {col.map((order) => (
                          <Link
                            key={order.id}
                            to={`/work-orders/${order.id}`}
                            className="block rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="truncate font-medium text-slate-900">{order.workOrderNumber}</div>
                                <div className="mt-1 line-clamp-2 text-xs text-slate-600">{order.title}</div>
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge tone={priorityTone(order.priority)}>{order.priority}</Badge>
                              {order.slaStatus ? (
                                <Badge tone={slaTone(order.slaStatus)}>{order.slaStatus}</Badge>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="overflow-x-auto !p-0">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">WO #</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Technician</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">SLA</th>
                    <th className="px-4 py-3 font-medium">Scheduled</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link className="font-medium text-blue-600 hover:underline" to={`/work-orders/${order.id}`}>
                          {order.workOrderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{order.title}</td>
                      <td className="px-4 py-3 text-slate-600">{order.customerName}</td>
                      <td className="px-4 py-3 text-slate-600">{order.technicianName || "Unassigned"}</td>
                      <td className="px-4 py-3"><Badge tone={priorityTone(order.priority)}>{order.priority}</Badge></td>
                      <td className="px-4 py-3"><Badge tone={statusTone(order.status)}>{order.status}</Badge></td>
                      <td className="px-4 py-3">
                        {order.slaStatus ? (
                          <Badge tone={slaTone(order.slaStatus)}>{order.slaStatus}</Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(order.scheduledDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      {!boardView && totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
          <Button variant="secondary" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

export default WorkOrderListPage;

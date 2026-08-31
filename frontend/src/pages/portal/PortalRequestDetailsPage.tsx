import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Loader from "../../components/ui/Loader";
import { getErrorMessage } from "../../services/api";
import portalService from "../../services/portalService";
import type { PortalWorkOrder } from "../../types/domain";
import { formatDateTime } from "../../utils/helpers";
import { priorityTone, slaTone, statusTone } from "../../utils/status";

function PortalRequestDetailsPage() {
  const { id } = useParams();
  const [request, setRequest] = useState<PortalWorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setRequest(await portalService.getMyRequest(Number(id)));
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load request"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!request) return <EmptyState title="Request not found" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-600">{request.workOrderNumber}</p>
          <h1 className="text-2xl font-bold text-slate-900">{request.title}</h1>
        </div>
        <Link to="/portal/requests">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone={priorityTone(request.priority)}>{request.priority}</Badge>
          <Badge tone={statusTone(request.status)}>{request.status}</Badge>
          {request.slaStatus && <Badge tone={slaTone(request.slaStatus)}>{request.slaStatus}</Badge>}
        </div>
        <p className="whitespace-pre-wrap text-sm text-slate-700">
          {request.description || "No description provided"}
        </p>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-slate-500">Location:</span> {request.location || "—"}
          </p>
          <p>
            <span className="text-slate-500">Technician:</span> {request.technicianName || "Not assigned yet"}
          </p>
          <p>
            <span className="text-slate-500">Created:</span> {formatDateTime(request.createdAt)}
          </p>
          <p>
            <span className="text-slate-500">SLA due:</span> {formatDateTime(request.slaDueAt)}
          </p>
          <p>
            <span className="text-slate-500">Completed:</span> {formatDateTime(request.completedAt)}
          </p>
        </div>
      </Card>

      {request.statusHistory && request.statusHistory.length > 0 && (
        <Card className="space-y-3">
          <h2 className="font-semibold text-slate-900">Status History</h2>
          <ul className="space-y-2 text-sm">
            {request.statusHistory.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2"
              >
                <div>
                  <span className="font-medium text-slate-800">
                    {entry.fromStatus ?? "—"} → {entry.toStatus ?? "—"}
                  </span>
                  {entry.note && (
                    <p className="text-xs text-slate-500">{entry.note}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400">{formatDateTime(entry.changedAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export default PortalRequestDetailsPage;

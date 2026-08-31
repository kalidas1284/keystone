import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

function PortalRequestsPage() {
  const [requests, setRequests] = useState<PortalWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setRequests(await portalService.listMyRequests());
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load requests"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Service Requests</h1>
          <p className="mt-1 text-sm text-slate-500">Status and SLA for your facility tickets</p>
        </div>
        <Link to="/portal/requests/new">
          <Button>New Request</Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState title="No requests yet" description="Create your first service request to get started." />
      ) : (
        <div className="space-y-3">
          {requests.map((item) => (
            <Card key={item.id}>
              <Link to={`/portal/requests/${item.id}`} className="block">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-blue-600">{item.workOrderNumber}</p>
                    <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Created {formatDateTime(item.createdAt)}
                      {item.slaDueAt ? ` · SLA due ${formatDateTime(item.slaDueAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={priorityTone(item.priority)}>{item.priority}</Badge>
                    <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                    {item.slaStatus && <Badge tone={slaTone(item.slaStatus)}>{item.slaStatus}</Badge>}
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default PortalRequestsPage;

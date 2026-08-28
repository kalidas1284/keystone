import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useConfirmDialog } from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Loader from "../../components/ui/Loader";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import customerService from "../../services/customerService";
import { getErrorMessage } from "../../services/api";
import type { Customer, Site, WorkOrder } from "../../types/domain";
import type { User } from "../../types/user";
import { formatDate } from "../../utils/helpers";
import { priorityTone, statusTone } from "../../utils/status";

function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canLinkPortal = user?.role === "ADMIN" || user?.role === "MANAGER";
  const { confirm, dialog } = useConfirmDialog();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [savingSite, setSavingSite] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<number | null>(null);
  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [siteNotes, setSiteNotes] = useState("");
  const [portalUsers, setPortalUsers] = useState<User[]>([]);
  const [selectedPortalUserId, setSelectedPortalUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [profile, orders, siteList] = await Promise.all([
        customerService.getCustomer(Number(id)),
        customerService.getCustomerWorkOrders(Number(id)),
        customerService.listCustomerSites(Number(id)),
      ]);
      setCustomer(profile);
      setWorkOrders(orders);
      setSites(siteList);
      if (canLinkPortal) {
        setPortalUsers(await customerService.listAvailablePortalUsers());
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load customer"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const deactivate = async () => {
    if (!id) return;
    const ok = await confirm(
      "Deactivate customer?",
      "This customer will no longer be available for new work orders."
    );
    if (!ok) return;
    try {
      await customerService.deactivateCustomer(Number(id));
      toast.success("Customer deactivated");
      navigate("/customers");
    } catch (err) {
      const message = getErrorMessage(err, "Failed to deactivate customer");
      setError(message);
      toast.error(message);
    }
  };

  const linkPortal = async () => {
    if (!id || !selectedPortalUserId) return;
    try {
      const updated = await customerService.linkPortalUser(Number(id), Number(selectedPortalUserId));
      setCustomer(updated);
      setSelectedPortalUserId("");
      setPortalUsers(await customerService.listAvailablePortalUsers());
      toast.success("Portal user linked");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to link portal user"));
    }
  };

  const unlinkPortal = async () => {
    if (!id) return;
    const ok = await confirm(
      "Unlink portal user?",
      "They will no longer see this customer’s requests and invoices in the portal."
    );
    if (!ok) return;
    try {
      const updated = await customerService.unlinkPortalUser(Number(id));
      setCustomer(updated);
      setPortalUsers(await customerService.listAvailablePortalUsers());
      toast.success("Portal user unlinked");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to unlink portal user"));
    }
  };

  const startEditSite = (site: Site) => {
    setEditingSiteId(site.id);
    setSiteName(site.name);
    setSiteLocation(site.location);
    setSiteNotes(site.notes || "");
  };

  const resetSiteForm = () => {
    setEditingSiteId(null);
    setSiteName("");
    setSiteLocation("");
    setSiteNotes("");
  };

  const saveSite = async () => {
    if (!id) return;
    setSavingSite(true);
    setError(null);
    try {
      if (!editingSiteId) {
        await customerService.createCustomerSite(Number(id), {
          name: siteName,
          location: siteLocation,
          notes: siteNotes || undefined,
        });
      } else {
        await customerService.updateCustomerSite(Number(id), editingSiteId, {
          name: siteName,
          location: siteLocation,
          notes: siteNotes || undefined,
        });
      }
      const refreshed = await customerService.listCustomerSites(Number(id));
      setSites(refreshed);
      resetSiteForm();
      toast.success(editingSiteId ? "Site updated" : "Site created");
    } catch (err) {
      const message = getErrorMessage(err, "Failed to save site");
      setError(message);
      toast.error(message);
    } finally {
      setSavingSite(false);
    }
  };

  if (loading) return <Loader />;
  if (error && !customer) return <ErrorMessage message={error} />;
  if (!customer) return <EmptyState title="Customer not found" />;

  return (
    <div className="space-y-6">
      {dialog}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{customer.companyName || "No company"}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/customers/${customer.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Link to={`/work-orders/new?customerId=${customer.id}`}>
            <Button>Create Work Order</Button>
          </Link>
          {customer.active && (
            <Button variant="danger" onClick={() => void deactivate()}>
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Profile</h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p>
              <span className="text-slate-500">Email:</span> {customer.email}
            </p>
            <p>
              <span className="text-slate-500">Phone:</span> {customer.phone || "—"}
            </p>
            <p>
              <span className="text-slate-500">Address:</span> {customer.address || "—"}
            </p>
            <p>
              <span className="text-slate-500">City:</span> {customer.city || "—"}
            </p>
            <p>
              <span className="text-slate-500">State:</span> {customer.state || "—"}
            </p>
            <p>
              <span className="text-slate-500">Postal:</span> {customer.postalCode || "—"}
            </p>
          </div>
          <p className="text-sm text-slate-600">{customer.notes || "No notes"}</p>
        </Card>
        <Card className="space-y-3">
          <h2 className="font-semibold text-slate-900">Status</h2>
          <Badge tone={customer.active ? "success" : "neutral"}>
            {customer.active ? "Active" : "Inactive"}
          </Badge>
          <p className="text-sm text-slate-500">Created {formatDate(customer.createdAt)}</p>
        </Card>
      </div>

      {canLinkPortal && (
        <Card className="space-y-3">
          <h2 className="font-semibold text-slate-900">Portal access</h2>
          {customer.portalUserId ? (
            <>
              <p className="text-sm text-slate-700">
                Linked to <span className="font-medium">{customer.portalUserEmail}</span>
              </p>
              <Button variant="secondary" onClick={() => void unlinkPortal()}>
                Unlink portal user
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                Link an existing CUSTOMER login so they can use the self-service portal for this
                account.
              </p>
              {portalUsers.length === 0 ? (
                <p className="text-sm text-amber-700">
                  No unlinked customer users available. Ask them to register, or create a customer
                  account first.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Select
                    className="min-w-[260px] flex-1"
                    value={selectedPortalUserId}
                    onChange={(e) => setSelectedPortalUserId(e.target.value)}
                  >
                    <option value="">Select portal user</option>
                    {portalUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email})
                      </option>
                    ))}
                  </Select>
                  <Button disabled={!selectedPortalUserId} onClick={() => void linkPortal()}>
                    Link
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      <Card>
        <h2 className="mb-4 font-semibold text-slate-900">Work Orders</h2>
        {workOrders.length === 0 ? (
          <EmptyState title="No work orders yet" description="Create a work order for this customer." />
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

      <Card className="space-y-4">
        <h2 className="font-semibold text-slate-900">Sites</h2>

        {sites.length === 0 ? (
          <EmptyState title="No sites yet" description="Dispatcher/manager can add building sites for this customer." />
        ) : (
          <div className="space-y-2">
            {sites.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/50 px-4 py-3"
              >
                <div className="min-w-[200px]">
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="text-sm text-slate-600">{s.location}</p>
                </div>
                {(user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "DISPATCHER") && (
                  <Button variant="secondary" onClick={() => startEditSite(s)}>
                    Edit
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {(user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "DISPATCHER") && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900">{editingSiteId ? "Edit site" : "Add site"}</h3>
              {editingSiteId && (
                <Button variant="ghost" onClick={resetSiteForm}>
                  Cancel
                </Button>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Site name</label>
                <Input required value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Location</label>
                <Input required value={siteLocation} onChange={(e) => setSiteLocation(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes (optional)</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={siteNotes}
                onChange={(e) => setSiteNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button disabled={savingSite} onClick={() => void saveSite()}>
                {savingSite ? "Saving..." : editingSiteId ? "Update site" : "Create site"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default CustomerDetailsPage;

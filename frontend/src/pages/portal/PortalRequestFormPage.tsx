import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { getErrorMessage } from "../../services/api";
import portalService from "../../services/portalService";
import type { Site, WorkOrderPriority } from "../../types/domain";

function PortalRequestFormPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<WorkOrderPriority>("MEDIUM");
  const [location, setLocation] = useState("");
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<number>(0);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const list = await portalService.listMySites();
        setSites(list);
        setSiteId(list[0]?.id ?? 0);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load your sites"));
      } finally {
        setSitesLoading(false);
      }
    };
    setError(null);
    setSitesLoading(true);
    void loadSites();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    if (sitesLoading || sites.length === 0 || !siteId) {
      setSaving(false);
      setError("No sites available for your account. Please contact your admin to add a site.");
      return;
    }

    try {
      const created = await portalService.createMyRequest({
        title,
        description: description || undefined,
        priority,
        siteId,
        location: location || undefined,
        notes: notes || undefined,
      });
      navigate(`/portal/requests/${created.id}`);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to submit request"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Service Request</h1>
        <p className="mt-1 text-sm text-slate-500">
          SLA timers start when your request is submitted (Urgent 4h, High 24h, Medium 72h, Low 7d).
        </p>
      </div>

      <Card>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
            <Select value={priority} onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}>
              {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Site</label>
            <Select
              required
              value={siteId || ""}
              onChange={(e) => setSiteId(Number(e.target.value))}
              disabled={sitesLoading || sites.length === 0}
            >
              <option value="">
                {sitesLoading
                  ? "Loading sites..."
                  : sites.length === 0
                    ? "No sites available"
                    : "Select site"}
              </option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Building / floor / asset" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={saving || sitesLoading || sites.length === 0}
            >
              {saving ? "Submitting..." : "Submit Request"}
            </Button>
            <Link to="/portal/requests">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default PortalRequestFormPage;

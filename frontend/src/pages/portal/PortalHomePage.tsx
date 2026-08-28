import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";

function PortalHomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-7">
      <div className="ks-slide-up relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--ink)] px-6 py-8 text-white shadow-[var(--shadow)]">
        <div className="ks-grid-bg pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Customer portal</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
            Welcome, {user?.fullName}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-slate-300">
            Submit and track service requests for your facility — with live status and SLA visibility.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]">
          <h2 className="font-display text-lg font-semibold text-[var(--ink)]">Create a service request</h2>
          <p className="mt-2 text-sm text-slate-500">
            Report maintenance issues and our dispatch team will assign a technician.
          </p>
          <Link to="/portal/requests/new" className="mt-5 inline-block">
            <Button>New request</Button>
          </Link>
        </Card>
        <Card className="transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]">
          <h2 className="font-display text-lg font-semibold text-[var(--ink)]">Track existing requests</h2>
          <p className="mt-2 text-sm text-slate-500">
            View status, SLA due dates, and progress on open and completed jobs.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/portal/requests">
              <Button variant="secondary">My requests</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PortalHomePage;

import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ClipboardList, Home, LogOut, PlusCircle, UserRound } from "lucide-react";
import Logo from "../components/common/Logo";
import NotificationBell from "../components/common/NotificationBell";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/helpers";

function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { to: "/portal", label: "Home", icon: Home, end: true },
    { to: "/portal/requests", label: "My Requests", icon: ClipboardList, end: false },
    { to: "/portal/requests/new", label: "New Request", icon: PlusCircle, end: false },
    { to: "/portal/profile", label: "Account", icon: UserRound, end: false },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <NotificationBell linkPrefix="/portal" />
            <Link to="/portal/profile" className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800 hover:text-teal-700">{user?.fullName}</p>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Customer Portal</p>
            </Link>
            <Button variant="secondary" onClick={handleLogout} className="!px-3 !py-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </span>
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition",
                    isActive
                      ? "bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100"
                      : "text-slate-600 hover:bg-slate-100"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 ks-fade-in">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--border)] py-5 text-center text-xs text-slate-500">
        Keystone Customer Self-Service Portal
      </footer>
    </div>
  );
}

export default PortalLayout;

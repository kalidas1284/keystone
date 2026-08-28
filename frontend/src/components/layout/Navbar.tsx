import { LogOut, Menu, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../constants/roles";
import NotificationBell from "../common/NotificationBell";
import Button from "../ui/Button";

type NavbarProps = {
  onMenuClick?: () => void;
};

function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-white/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="font-display text-sm font-semibold tracking-tight text-[var(--ink)]">
            Operations Console
          </p>
          <p className="text-xs text-slate-500">Live field service control</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <NotificationBell />

        <Link
          to="/profile"
          className="hidden items-center gap-2.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 transition hover:border-teal-600/30 hover:bg-teal-50/40 sm:flex"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ink)] text-teal-300">
            <UserRound className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-slate-800">{user?.fullName}</p>
            <p className="text-[11px] text-slate-500">{user ? ROLE_LABELS[user.role] : ""}</p>
          </div>
        </Link>

        <Button variant="secondary" onClick={handleLogout} className="!px-3 !py-2 text-sm">
          <span className="inline-flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </span>
        </Button>
      </div>
    </header>
  );
}

export default Navbar;

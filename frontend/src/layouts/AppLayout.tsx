import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  HardHat,
  LayoutDashboard,
  Package,
  UserCog,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Logo from "../components/common/Logo";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../constants/roles";
import { cn } from "../utils/helpers";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "My Jobs", to: "/field", icon: HardHat, roles: ["TECHNICIAN"] },
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "DISPATCHER"] },
  { label: "Customers", to: "/customers", icon: Users, roles: ["ADMIN", "MANAGER", "DISPATCHER"] },
  { label: "Technicians", to: "/technicians", icon: Wrench, roles: ["ADMIN", "MANAGER", "DISPATCHER"] },
  { label: "Work Orders", to: "/work-orders", icon: ClipboardList, roles: ["ADMIN", "MANAGER", "DISPATCHER", "TECHNICIAN"] },
  { label: "Schedule", to: "/schedule", icon: CalendarDays, roles: ["ADMIN", "MANAGER", "DISPATCHER", "TECHNICIAN"] },
  { label: "Inventory", to: "/inventory", icon: Package, roles: ["ADMIN", "MANAGER", "DISPATCHER"] },
  // Spec: invoicing/payment engines are out of scope.
  { label: "Users", to: "/users", icon: UserCog, roles: ["ADMIN"] },
  { label: "Reports", to: "/reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
];

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--ink)]/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu overlay"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[var(--ink)] p-4 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <Logo variant="light" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                        isActive
                          ? "bg-teal-500/15 text-teal-200"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="ks-fade-in mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

import { NavLink } from "react-router-dom";
import {
  ClipboardList,
  LayoutDashboard,
  Package,
  CalendarDays,
  Users,
  Wrench,
  BarChart3,
  HardHat,
  UserCog,
} from "lucide-react";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../constants/roles";
import { cn } from "../../utils/helpers";

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

function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;
  const visibleItems = NAV_ITEMS.filter((item) => role && item.roles.includes(role));

  return (
    <aside className="sticky top-0 hidden h-screen w-[15.5rem] shrink-0 flex-col bg-[var(--ink)] text-slate-300 md:flex">
      <div className="border-b border-white/10 px-5 py-5">
        <Logo variant="light" />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Navigate
        </p>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-200",
                  isActive
                    ? "bg-teal-500/15 text-teal-200 shadow-[inset_3px_0_0_0_#14b8a6]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                )
              }
            >
              <Icon className="h-4 w-4 opacity-80 group-hover:opacity-100" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="text-[11px] leading-relaxed text-slate-500">
          Commercial facilities · Dispatch · SLA
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;

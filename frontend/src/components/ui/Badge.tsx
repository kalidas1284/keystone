import type { ReactNode } from "react";
import { cn } from "../../utils/helpers";

type BadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  className?: string;
};

const tones = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200/80",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  warning: "bg-amber-50 text-amber-800 ring-amber-100",
  danger: "bg-red-50 text-red-800 ring-red-100",
  info: "bg-teal-50 text-teal-800 ring-teal-100",
};

function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;

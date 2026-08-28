import type { SelectHTMLAttributes } from "react";
import { cn } from "../../utils/helpers";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-[var(--shadow-sm)] outline-none transition focus:border-teal-600/50 focus:ring-2 focus:ring-teal-600/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export default Select;

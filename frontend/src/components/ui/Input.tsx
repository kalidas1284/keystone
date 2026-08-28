import React from "react";
import { cn } from "../../utils/helpers";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-[var(--shadow-sm)] outline-none transition placeholder:text-slate-400 focus:border-teal-600/50 focus:ring-2 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
        className
      )}
    />
  );
}

export default Input;

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/helpers";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  ...rest
}: ButtonProps) {
  const variants = {
    primary:
      "bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-hover)] hover:shadow-md active:translate-y-px",
    secondary:
      "border border-[var(--border)] bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
    danger: "bg-[var(--danger)] text-white hover:bg-red-700 shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100/80",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-semibold tracking-tight transition duration-200 disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;

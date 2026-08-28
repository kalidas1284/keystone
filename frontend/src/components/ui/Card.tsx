import type { ReactNode } from "react";
import { cn } from "../../utils/helpers";

type CardProps = {
  children: ReactNode;
  className?: string;
  glass?: boolean;
};

function Card({ children, className = "", glass = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border p-5 md:p-6",
        glass
          ? "border-white/40 bg-white/75 shadow-[var(--shadow)] backdrop-blur-md"
          : "border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Card;

type LogoProps = {
  variant?: "light" | "dark";
  compact?: boolean;
  className?: string;
};

function Logo({ variant = "dark", compact = false, className = "" }: LogoProps) {
  const isLight = variant === "light";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl shadow-md ${
          isLight ? "bg-teal-400/20 ring-1 ring-teal-300/40" : "bg-[var(--ink)] ring-1 ring-teal-700/30"
        }`}
        aria-hidden
      >
        <svg viewBox="0 0 40 40" className="h-7 w-7">
          <path
            d="M20 4L32 11V25L20 32L8 25V11L20 4Z"
            fill={isLight ? "#5EEAD4" : "#14B8A6"}
          />
          <path d="M20 11L26 14.5V22.5L20 26L14 22.5V14.5L20 11Z" fill={isLight ? "#0B1220" : "#0B1220"} />
          <path d="M17.5 20.5h5v8.5H20v-5.8h-2.5v-2.7Z" fill={isLight ? "#ECFDF5" : "#F8FAFC"} />
        </svg>
      </div>

      {!compact && (
        <div className="min-w-0 leading-tight">
          <h1
            className={`font-display text-lg font-semibold tracking-tight ${
              isLight ? "text-white" : "text-[var(--ink)]"
            }`}
          >
            Keystone
          </h1>
          <p className={`text-[11px] font-medium uppercase tracking-[0.14em] ${isLight ? "text-teal-200/80" : "text-slate-500"}`}>
            Field Operations
          </p>
        </div>
      )}
    </div>
  );
}

export default Logo;

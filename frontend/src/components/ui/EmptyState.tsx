function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-100">
        <span className="text-sm font-bold">·</span>
      </div>
      <p className="font-display text-base font-semibold text-slate-800">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export default EmptyState;

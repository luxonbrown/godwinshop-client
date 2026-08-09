export default function StatCard({ icon: Icon, label, value, accent = 'text-accent', sub }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-2 ${accent}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="truncate text-xs uppercase tracking-wide text-muted">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-muted/70">{sub}</p>}
      </div>
    </div>
  );
}
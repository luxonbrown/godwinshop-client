import { PackageOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'Nothing here yet',
  description,
  action,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-divider py-16 text-center ${className}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-accent">
        <Icon size={26} />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
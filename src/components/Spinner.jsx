import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-muted ${className}`} role="status">
      <Loader2 size={28} className="animate-spin text-accent" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function Pagination({ page, pages, limit, onPageChange, className = '' }) {
  if (pages <= 1) return null;

  const numbers = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) numbers.push(p);
  }

  const clickable = (p) => (
    <button
      key={p}
      onClick={() => onPage(p)}
      disabled={p === page}
      aria-current={p === page ? 'page' : undefined}
      className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition-colors ${
        p === page
          ? 'bg-accent text-black'
          : 'text-muted hover:bg-surface-2 hover:text-white'
      }`}
    >
      {p}
    </button>
  );

  return (
    <nav aria-label="Pagination" className={`flex items-center justify-center gap-1.5 ${className}`}>
<button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="btn-ghost h-9 w-9 !px-0"
      >
        <ChevronLeft size={18} />
      </button>
      {numbers.map((p, i) => {
        if (i > 0 && p - numbers[i - 1] > 1) {
          return (
            <span key={`gap-${p}`} className="px-1 text-sm text-muted">
              …
            </span>
          );
        }
        return clickable(p);
      })}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
        className="btn-ghost h-9 w-9 !px-0"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
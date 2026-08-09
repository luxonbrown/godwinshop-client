import { Check, Circle } from 'lucide-react';
import { ORDER_FLOW, ORDER_STATUS_LABELS } from '../utils/constants';

/**
 * Vertical journey timeline for an order. For cancelled orders, shows
 * the stages reached so far plus a cancelled marker.
 */
export default function OrderTimeline({ status }) {
  const currentIndex = ORDER_FLOW.indexOf(status);
  const cancelled = status === 'cancelled';

  if (cancelled && currentIndex === -1) {
    return (
      <ol className="flex flex-col gap-0">
        {ORDER_FLOW.map((s, i) => (
          <TimelineItem key={s} label={ORDER_STATUS_LABELS[s]} reached={false} last={i === ORDER_FLOW.length - 1} />
        ))}
        <li className="flex items-center gap-3 pt-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 text-red-600 dark:border-red-800/60 dark:bg-red-950 dark:text-red-400">
            <XIcon />
          </span>
          <span className="text-sm font-semibold text-red-500 dark:text-red-400">Cancelled</span>
        </li>
      </ol>
    );
  }

  return (
    <ol className="flex flex-col gap-0">
      {ORDER_FLOW.map((s, i) => (
        <TimelineItem
          key={s}
          label={ORDER_STATUS_LABELS[s]}
          reached={currentIndex >= i}
          current={currentIndex === i}
          last={i === ORDER_FLOW.length - 1}
        />
      ))}
    </ol>
  );
}

function TimelineItem({ label, reached, current, last }) {
  return (
    <li className="relative">
      <div className={`flex items-center gap-3 ${!last ? 'pb-5' : ''}`}>
        <span
          className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
            reached
              ? 'border-accent bg-accent text-black'
              : 'border-divider bg-surface-2 text-muted'
          }`}
        >
          {reached && !current ? <Check size={14} /> : current ? <span className="h-2.5 w-2.5 rounded-full bg-black" /> : <Circle size={11} />}
        </span>
        <div>
          <span className={`text-sm font-semibold ${reached ? 'text-white' : 'text-muted'}`}>{label}</span>
          {current && <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">Current stage</span>}
        </div>
        {!last && (
          <span className={`absolute left-3.5 top-7 h-5 w-px -translate-x-1/2 ${reached && !current ? 'bg-accent/60' : 'bg-divider'}`} />
        )}
      </div>
    </li>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
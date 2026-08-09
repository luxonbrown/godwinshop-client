import { Link } from 'react-router-dom';
import {
  Users, Package, ClipboardList, ShoppingCart, Loader2, TrendingUp,
  Clock, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '../../utils/constants';
import { formatDateTime, formatMoney } from '../../utils/format';

export default function AdminDashboard() {
  useDocumentTitle('Admin Dashboard');
  const { data, loading, reload } = useApi('/admin/dashboard');

  if (loading) return <Spinner label="Loading dashboard…" />;

  const s = data.stats;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <button onClick={reload} className="btn-outline">
          <Loader2 size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Customers" value={s.users} sub={`${s.active_customers} active`} />
        <StatCard icon={Package} label="Products" value={s.products} accent="text-violet-400" sub="in store" />
<StatCard icon={ShoppingCart} label="Orders" value={s.orders} accent="text-accent" sub={`${s.today_orders} today`} />
        <StatCard icon={TrendingUp} label="Revenue (excl. cancelled)" value={formatMoney(s.revenue)} accent="text-accent" />
        <StatCard icon={CheckCircle2} label="Delivered" value={s.delivered_orders} accent="text-accent" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-divider px-5 py-4">
            <h2 className="font-bold text-white">Recent orders</h2>
            <Link to="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
              All orders <ArrowRight size={14} />
            </Link>
          </div>
          {data.recent_orders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-divider">
              {data.recent_orders.map((o) => (
                <li key={o.id}>
                  <Link to={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2/60">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{o.order_number}</p>
                      <p className="truncate text-xs text-muted">{o.customer_name} · {formatDateTime(o.created_at)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_STYLES[o.status] || ''}`}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                      <span className="text-sm font-bold text-accent">{formatMoney(o.total_amount)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Low stock */}
        <section className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-divider px-5 py-4">
            <AlertTriangle size={17} className="text-accent" />
            <h2 className="font-bold text-white">Low stock (≤ 5)</h2>
          </div>
          {data.low_stock.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-divider">
              {data.low_stock.map((p) => (
                <li key={p.id}>
                  <Link to={`/admin/products/${p.id}/edit`} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2/60">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{p.name}</p>
                      <p className="text-xs text-muted">{p.sku}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${p.stock_quantity === 0 ? 'border-red-500/40 bg-red-500/10 text-red-600 dark:border-red-800/60 dark:bg-red-950/60 dark:text-red-400' : 'border-accent/40 bg-accent/10 text-accent'}`}>
                      {p.stock_quantity} left
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Status breakdown */}
      <section className="card mt-6 p-5">
        <h2 className="font-bold text-white">Orders by status</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {ORDER_STATUSES_LABELS.map(([status, label]) => {
            const count = data.status_breakdown.find((b) => b.status === status)?.count || 0;
            const max = Math.max(1, ...data.status_breakdown.map((b) => b.count));
            return (
              <div key={status} className="w-[calc(50%-0.5rem)] sm:w-[calc(25%-0.5rem)] xl:w-[14.2%] xl:min-w-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate text-muted">{label}</span>
                  <span className="font-bold text-white">{count}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const ORDER_STATUSES_LABELS = [
  ['pending', 'Pending'],
  ['confirmed', 'Confirmed'],
  ['processing', 'Processing'],
  ['ready_for_delivery', 'Ready'],
  ['out_for_delivery', 'Out for delivery'],
  ['delivered', 'Delivered'],
  ['cancelled', 'Cancelled']
];
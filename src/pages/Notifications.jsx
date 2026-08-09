import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Check, Trash2, PackageOpen, ArrowRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import client from '../api/client';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../utils/format';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const TYPE_ICONS = {
  order: { icon: PackageOpen, color: 'text-accent' },
  account: { icon: Bell, color: 'text-accent' },
  product: { icon: Bell, color: 'text-violet-400' },
  system: { icon: Bell, color: 'text-muted' }
};

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'unread', label: 'Unread' }
];

export default function Notifications() {
  useDocumentTitle('Notifications');
  const { refreshUnread } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const { data, loading, reload } = useApi(`/notifications?page=${page}&limit=12${filter ? `&filter=${filter}` : ''}`, { deps: [page, filter] });

  async function markRead(id) {
    await client.put(`/notifications/${id}/read`);
    refreshUnread();
    reload();
  }

  async function markAll() {
    await client.put('/notifications/read-all');
    toast.success('All notifications marked as read.');
    refreshUnread();
    reload();
  }

  async function remove(id) {
    await client.delete(`/notifications/${id}`);
    refreshUnread();
    reload();
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold sm:text-3xl">Notifications</h1>
        {data?.unread_count > 0 && (
          <button onClick={markAll} className="btn-outline">
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1); }}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? 'border-accent bg-accent text-black'
                : 'border-divider text-muted hover:text-white'
            }`}
          >
            {f.label}
            {f.value === 'unread' && data ? ` (${data.unread_count})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Loading notifications…" className="mt-8" />
      ) : data?.notifications?.length ? (
        <>
          <ul className="mt-6 space-y-3">
            {data.notifications.map((n) => {
              const meta = TYPE_ICONS[n.type] || TYPE_ICONS.system;
              return (
                <li
                  key={n.id}
                  className={`card flex items-start gap-4 p-5 transition-colors ${n.is_read ? 'opacity-70' : 'border-accent/40'}`}
                >
                  <meta.icon size={19} className={`mt-0.5 shrink-0 ${meta.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{n.title}</p>
                      {!n.is_read && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-black">New</span>}
                    </div>
                    <p className="mt-1 text-sm text-muted">{n.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted/70">
                      <span>{formatDateTime(n.created_at)}</span>
                      {n.related_order_id && (
                        <Link to={`/orders/${n.related_order_id}`} className="flex items-center gap-1 font-semibold text-accent hover:underline">
                          Order {n.order_number || `#${n.related_order_id}`} <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    {!n.is_read && (
                      <button onClick={() => markRead(n.id)} aria-label="Mark as read" className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-white">
                        <CheckCheck size={16} />
                      </button>
                    )}
                    <button onClick={() => remove(n.id)} aria-label="Delete notification" className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} className="mt-8" />
        </>
      ) : (
        <EmptyState
          title="No notifications"
          description={filter === 'unread' ? 'You have no unread notifications.' : 'Order updates and delivery-date changes will appear here.'}
          className="mt-8"
        />
      )}
    </div>
  );
}
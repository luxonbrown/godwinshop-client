import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellRing, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import client from '../../api/client';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { formatDateTime } from '../../utils/format';

export default function AdminNotifications() {
  useDocumentTitle('Notifications | Admin');
  const { refreshUnread } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const { data, loading, reload } = useApi(`/notifications?page=${page}&limit=25`, { deps: [page] });

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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {data?.unread_count > 0 && (
          <button onClick={markAll} className="btn-outline"><CheckCheck size={16} /> Mark all read</button>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">New orders, cancellations and important events land here instantly.</p>

      {loading ? (
        <Spinner label="Loading notifications…" className="mt-8" />
      ) : data?.notifications?.length ? (
        <>
          <ul className="mt-6 space-y-3">
            {data.notifications.map((n) => (
              <li key={n.id} className={`card flex items-start gap-4 p-4 ${n.is_read ? 'opacity-70' : 'border-accent/40'}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <BellRing size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{n.title}</p>
                    {!n.is_read && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-black">New</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted">{n.message}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted/70">
                    <span>{formatDateTime(n.created_at)}</span>
                    {n.related_order_id && (
                      <Link to={`/admin/orders/${n.related_order_id}`} className="flex items-center gap-1 font-semibold text-accent hover:underline">
                        Open order <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
                <button onClick={() => remove(n.id)} aria-label="Delete notification" className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
          <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} className="mt-8" />
        </>
      ) : (
        <EmptyState title="No notifications" description="New orders and system events will appear here." className="mt-8" />
      )}
    </div>
  );
}
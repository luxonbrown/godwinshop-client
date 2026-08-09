import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PackageOpen } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '../utils/constants';
import { formatDate, formatDeliveryDate, formatMoney } from '../utils/format';

export default function MyOrders() {
  useDocumentTitle('My Orders');
  const [page, setPage] = useState(1);
  const { data, loading } = useApi(`/orders/mine?page=${page}&limit=8`, { deps: [page] });

  return (
    <div className="container-page py-8 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">My Orders</h1>

      {loading ? (
        <Spinner label="Loading your orders…" className="min-h-[40vh]" />
      ) : data?.orders?.length ? (
        <>
          <div className="mt-8 space-y-4">
            {data.orders.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="card block p-5 transition-colors hover:border-accent/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{o.order_number}</p>
                    <p className="mt-0.5 text-xs text-muted">Placed {formatDate(o.created_at)}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${ORDER_STATUS_STYLES[o.status] || 'border-divider text-muted'}`}>
                    {ORDER_STATUS_LABELS[o.status] || o.status}
                  </span>
                  <p className="text-lg font-extrabold text-accent">{formatMoney(o.total_amount)}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-divider pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <PackageOpen size={15} className="text-accent" />
                    Expected delivery:{' '}
                    <span className={o.expected_delivery_date ? 'font-semibold text-accent' : 'text-muted'}>
                      {formatDeliveryDate(o.expected_delivery_date) || 'to be assigned'}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-accent">
                    View order <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} className="mt-10" />
        </>
      ) : (
        <EmptyState
          title="You don't have any orders yet"
          description="Once you place an order it will show up here with its status and delivery date."
          action={<Link to="/products" className="btn-accent">Start shopping</Link>}
        />
      )}
    </div>
  );
}
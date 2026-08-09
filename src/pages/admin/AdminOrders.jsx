import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '../../utils/constants';
import { formatDateTime, formatDeliveryDate, formatMoney } from '../../utils/format';

export default function AdminOrders() {
  useDocumentTitle('Orders | Admin');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 350);

  const query = new URLSearchParams({
    page,
    limit: 12,
    ...(status ? { status } : {}),
    ...(search ? { search } : {})
  });
  const { data, loading } = useApi(`/orders?${query}`, { deps: [page, status, search] });

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Orders</h1>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search orders</span>
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="input pl-10" placeholder="Search order number, customer, email or phone…" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="input w-full lg:w-56">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading orders…" className="mt-8" />
      ) : data?.orders?.length ? (
        <>
          <div className="table-wrap mt-6">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Total</th>
                  <th>Expected delivery</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/admin/orders/${o.id}`} className="font-semibold text-accent hover:underline">{o.order_number}</Link>
                      <p className="text-xs text-muted">{formatDateTime(o.created_at)}</p>
                    </td>
                    <td className="font-medium text-white">{o.customer_name}</td>
                    <td className="text-muted">{o.delivery_phone}</td>
                    <td className="font-bold text-accent">{formatMoney(o.total_amount)}</td>
                    <td>
                      <span className={o.expected_delivery_date ? 'text-white' : 'text-muted'}>
                        {formatDeliveryDate(o.expected_delivery_date) || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_STYLES[o.status] || ''}`}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link to={`/admin/orders/${o.id}`} className="btn-outline !px-3 !py-1.5 text-xs">Manage</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} className="mt-6" />
        </>
      ) : (
        <EmptyState title="No orders found" description="Orders will appear here as customers place them." className="mt-8" />
      )}
    </div>
  );
}
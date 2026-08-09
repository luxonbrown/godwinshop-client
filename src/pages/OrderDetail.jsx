import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Phone, ClipboardList } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import client from '../api/client';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import OrderTimeline from '../components/OrderTimeline';
import ConfirmDialog from '../components/ConfirmDialog';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, PLACEHOLDER_IMAGE } from '../utils/constants';
import { formatDateTime, formatDeliveryDate, formatMoney } from '../utils/format';

export default function OrderDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi(`/orders/${id}`);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useDocumentTitle(data?.order?.order_number || 'Order');

  if (loading) return <Spinner label="Loading order…" className="min-h-[60vh]" />;
  if (error || !data?.order) {
    return (
      <div className="container-page py-16">
        <EmptyState title="Order not found" description={error || 'This order may have been removed.'} />
      </div>
    );
  }

  const order = data.order;

  async function cancelOrder() {
    setCancelling(true);
    try {
      await client.post(`/orders/${order.id}/cancel`);
      toast.success('Order cancelled. Stock was returned to inventory.');
      reload();
    } catch (err) {
      toast.error(err.message || 'Could not cancel this order.');
    } finally {
      setCancelling(false);
      setCancelOpen(false);
    }
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <Link to={isAdmin ? '/admin/orders' : '/orders'} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent">
        <ArrowLeft size={15} /> {isAdmin ? 'Back to orders' : 'Back to my orders'}
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{order.order_number}</h1>
          <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.created_at)}</p>
        </div>
        <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${ORDER_STATUS_STYLES[order.status] || 'border-divider text-muted'}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Delivery date banner */}
      <div className={`mt-6 flex items-center gap-4 rounded-xl border p-5 ${order.expected_delivery_date ? 'border-accent/40 bg-accent/10' : 'border-divider bg-surface'}`}>
        <CalendarDays size={26} className={order.expected_delivery_date ? 'text-accent' : 'text-muted'} />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Expected delivery</p>
          <p className={`text-lg font-bold ${order.expected_delivery_date ? 'text-accent' : 'text-white'}`}>
            {formatDeliveryDate(order.expected_delivery_date) || 'To be assigned'}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Timeline */}
        <section className="card p-6">
          <h2 className="mb-5 text-lg font-bold text-white">Order status</h2>
          <OrderTimeline status={order.status} />
        </section>

        {/* Details */}
        <div className="space-y-6 lg:col-span-2">
          <section className="card overflow-hidden">
            <h2 className="border-b border-divider px-6 py-4 text-lg font-bold text-white">Items</h2>
            <ul className="divide-y divide-divider">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 p-5">
                  <img
                    src={item.image_url || PLACEHOLDER_IMAGE}
                    alt={item.product_name}
                    className="h-16 w-16 rounded-xl border border-divider bg-base-2 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${item.product_id}`} className="truncate font-semibold text-white hover:text-accent">
                      {item.product_name}
                    </Link>
                    <p className="text-xs text-muted">{item.quantity} × {formatMoney(item.unit_price)}</p>
                  </div>
                  <p className="font-bold text-white">{formatMoney(item.subtotal)}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-divider bg-base-2 px-6 py-4 text-sm">
              <p className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatMoney(order.subtotal)}</span></p>
              <p className="flex justify-between"><span className="text-muted">Delivery fee</span><span>{order.delivery_fee === 0 ? 'Free' : formatMoney(order.delivery_fee)}</span></p>
              <p className="flex justify-between border-t border-divider pt-2 text-base font-bold">
                <span className="text-white">Total</span><span className="text-accent">{formatMoney(order.total_amount)}</span>
              </p>
            </div>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section className="card p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white"><MapPin size={17} className="text-accent" /> Delivery</h2>
              <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
                <p className="font-semibold text-white">{order.customer_name}</p>
                <p>{order.delivery_address}</p>
                {order.delivery_city && <p>{order.delivery_city}</p>}
                <p>{order.delivery_phone}</p>
                {order.delivery_instructions && <p className="mt-2 italic">“{order.delivery_instructions}”</p>}
              </address>
            </section>
            <section className="card p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white"><ClipboardList size={17} className="text-accent" /> Reference</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted">Order number</dt><dd className="font-semibold text-white">{order.order_number}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Order ID</dt><dd className="font-semibold text-white">#{order.id}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Status</dt><dd className="font-semibold text-white">{ORDER_STATUS_LABELS[order.status]}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Updated</dt><dd className="font-semibold text-white">{formatDateTime(order.updated_at)}</dd></div>
              </dl>
            </section>
          </div>

          {order.status === 'pending' && !isAdmin && (
            <div className="flex justify-end">
              <button onClick={() => setCancelOpen(true)} className="btn-danger">Cancel order</button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={cancelOrder}
        loading={cancelling}
        title="Cancel this order?"
        message={`Order ${order.order_number} is still pending. Cancelling returns every item to stock.`}
        confirmText="Yes, cancel order"
      />
    </div>
  );
}
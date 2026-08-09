import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, Clock, Truck, Loader2, Check,
  Phone, MapPin, ClipboardList
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import client from '../../api/client';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import OrderTimeline from '../../components/OrderTimeline';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, PLACEHOLDER_IMAGE } from '../../utils/constants';
import { formatDateTime, formatDeliveryDate, formatMoney, toInputDate } from '../../utils/format';

const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['ready_for_delivery'],
  ready_for_delivery: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: []
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  useDocumentTitle('Order | Admin');
  const toast = useToast();
  const { data, loading, error, reload } = useApi(`/orders/${id}`);
  const [savingStatus, setSavingStatus] = useState(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [dateValue, setDateValue] = useState('');
  const [dateSaving, setDateSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelSaving, setCancelSaving] = useState(false);

  if (loading) return <Spinner label="Loading order…" className="min-h-[50vh]" />;
  if (error || !data?.order) {
    return <div className="container-page py-16"><EmptyState title="Order not found" description={error || 'This order does not exist.'} /></div>;
  }

  const order = data.order;
  const nextStatuses = TRANSITIONS[order.status] || [];

  async function updateStatus(next) {
    setSavingStatus(next);
    try {
      await client.put(`/orders/${order.id}/status`, { status: next });
      toast.success(`Order marked as ${ORDER_STATUS_LABELS[next].toLowerCase()}. Customer notified.`);
      reload();
    } catch (err) {
      toast.error(err.message || 'Could not update status.');
    } finally {
      setSavingStatus(null);
    }
  }

  function openDateModal() {
    setDateValue(order.expected_delivery_date ? toInputDate(order.expected_delivery_date) : '');
    setDateOpen(true);
  }

  async function saveDate(e) {
    e.preventDefault();
    if (!dateValue) {
      toast.error('Choose a delivery date first.');
      return;
    }
    setDateSaving(true);
    try {
      await client.put(`/orders/${order.id}/delivery-date`, { date: dateValue });
      toast.success(dateOpen ? 'Delivery date updated. Customer notified.' : 'Delivery date assigned. Customer notified.');
      setDateOpen(false);
      reload();
    } catch (err) {
      toast.error(err.message || 'Could not set the delivery date.');
    } finally {
      setDateSaving(false);
    }
  }

  async function cancelOrder() {
    setCancelSaving(true);
    try {
      await client.put(`/orders/${order.id}/status`, { status: 'cancelled' });
      toast.success('Order cancelled. Stock was restored.');
      setCancelOpen(false);
      reload();
    } catch (err) {
      toast.error(err.message || 'Could not cancel the order.');
    } finally {
      setCancelSaving(false);
    }
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent">
        <ArrowLeft size={15} /> All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Order {order.order_number}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <ClipboardList size={14} /> #{order.id} · placed {formatDateTime(order.created_at)}
          </p>
        </div>
        <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${ORDER_STATUS_STYLES[order.status] || 'border-divider text-muted'}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Date banner */}
      <div className={`mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 ${order.expected_delivery_date ? 'border-accent/40 bg-accent/10' : 'border-divider bg-surface'}`}>
        <div className="flex items-center gap-4">
          <CalendarDays size={26} className={order.expected_delivery_date ? 'text-accent' : 'text-muted'} />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Expected delivery date</p>
            <p className={`text-lg font-bold ${order.expected_delivery_date ? 'text-accent' : 'text-white'}`}>
              {formatDeliveryDate(order.expected_delivery_date) || 'Not assigned yet'}
            </p>
          </div>
        </div>
        {(order.status !== 'cancelled' && order.status !== 'delivered') && (
          <button onClick={openDate} className="btn-accent"><CalendarDays size={15} /> {order.expected_delivery_date ? 'Update delivery date' : 'Set delivery date'}</button>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Timeline + status controls */}
        <section className="card p-6">
          <h2 className="mb-5 text-lg font-bold text-white">Order status</h2>
          <OrderTimeline status={order.status} />

          <div className="mt-6 space-y-2 border-t border-divider pt-5">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted">Advance status</p>
            {nextStatuses.length === 0 ? (
              <p className="text-sm text-muted">
                {order.status === 'delivered' ? 'This order has been delivered. ✓' : order.status === 'cancelled' ? 'This order was cancelled.' : 'No further moves available.'}
              </p>
            ) : (
              nextStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={savingStatus !== null}
                  className={`btn w-full justify-start ${s === 'cancelled' ? 'btn-danger' : 'btn-outline'}`}
                >
                  {savingStatus === s ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Mark as {ORDER_STATUS_LABELS[s]}
                </button>
              ))
            )}
          </div>
        </section>

        {/* Details */}
        <div className="space-y-6 lg:col-span-2">
          <section className="card overflow-hidden">
            <h2 className="border-b border-divider px-6 py-4 text-lg font-bold text-white">Items</h2>
            <ul className="divide-y divide-divider">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 p-5">
                  <img src={item.image_url || PLACEHOLDER_IMAGE} alt={item.product_name} className="h-14 w-14 rounded-xl border border-divider bg-base-2 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{item.product_name}</p>
                    <p className="text-xs text-muted">{item.sku} · {item.quantity} × {formatMoney(item.unit_price)}</p>
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
              <p className="flex justify-between text-xs text-muted">Last updated: {formatDateTime(order.updated_at)}</p>
            </div>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section className="card p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Truck size={17} className="text-accent" /> Delivery</h2>
              <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
                <p className="font-semibold text-white">{order.customer_name}</p>
                <p className="flex items-center gap-1.5"><MapPin size={14} /> {order.delivery_address}</p>
                {order.delivery_city && <p>{order.delivery_city}</p>}
                <p className="flex items-center gap-1.5"><Phone size={14} /> {order.delivery_phone}</p>
                {order.delivery_instructions && <p className="mt-2 italic">“{order.delivery_instructions}”</p>}
              </address>
            </section>
            <section className="card p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Clock size={17} className="text-accent" /> Customer</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted">Name</dt><dd className="font-semibold text-white">{order.customer_name}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Email</dt><dd className="truncate font-semibold text-white">{order.customer_email}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Phone</dt><dd className="font-semibold text-white">{order.customer_phone || '—'}</dd></div>
              </dl>
              <Link to="/contact" className="btn-outline mt-4 w-full !py-2 text-xs">Contact customer</Link>
            </section>
          </div>

          {nextStatuses.includes('cancelled') && (
            <div className="flex justify-end">
              <button onClick={() => setCancelOpen(true)} className="btn-danger">Cancel this order</button>
            </div>
          )}
        </div>
      </div>

      {/* Delivery date modal */}
      <Modal open={dateOpen} onClose={() => !dateSaving && setDateOpen(false)} title={order.expected_delivery_date ? 'Update delivery date' : 'Set expected delivery date'}>
        <form onSubmit={saveDelivery} className="space-y-5">
          <div>
            <label htmlFor="delivery-date" className="label">Expected delivery date *</label>
            <input
              id="delivery-date"
              type="date"
              min={toInputDate(new Date())}
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="input"
              required
            />
            <p className="mt-2 text-xs text-muted">
              Your customer will be notified automatically as soon as the date is saved.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setDateOpen(false)} disabled={dateSaving} className="btn-outline">Cancel</button>
            <button type="submit" disabled={dateSaving} className="btn-accent">
              {dateSaving ? <Loader2 size={15} className="animate-spin" /> : <CalendarDays size={15} />}
              {dateSaving ? 'Saving…' : 'Save delivery date'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={cancelOrder}
        loading={cancelSaving}
        title="Cancel this order?"
        message={`This cancels order ${order.order_number}. Every item is returned to stock and the customer is notified.`}
        confirmText="Yes, cancel order"
      />
    </div>
  );
}
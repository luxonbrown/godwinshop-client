import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import client from '../api/client';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { formatMoney } from '../utils/format';
import { PLACEHOLDER_IMAGE } from '../utils/constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Checkout() {
  useDocumentTitle('Checkout');
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user, refreshUnread } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    instructions: ''
  });
  const [placing, setPlacing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <h1 className="text-2xl font-bold sm:text-3xl">Checkout</h1>
        <EmptyState
          title="Nothing to check out"
          description="Your cart is empty — add a product first."
          action={<Link to="/products" className="btn-accent">Browse products</Link>}
        />
      </div>
    );
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function validate() {
    if (!form.full_name.trim()) return 'Delivery name is required';
    if (!form.phone.trim()) return 'Phone number is required';
    if (!form.address.trim()) return 'Delivery address is required';
    if (!form.city.trim()) return 'City / location is required';
    return null;
  }

  function openConfirm() {
    const invalid = validate();
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setConfirmOpen(true);
  }

  async function placeOrder() {
    setPlacing(true);
    try {
      const { data } = await client.post('/orders', {
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        delivery_address: form.address,
        delivery_city: form.city,
        delivery_phone: form.phone,
        delivery_instructions: form.instructions
      });
      clearCart();
      refreshUnread();
      toast.success(`Order ${data.order.order_number} placed successfully!`);
      navigate(`/orders/${data.order.id}`);
    } catch (err) {
      toast.error(err.message || 'Order creation failed. Please try again.');
    } finally {
      setPlacing(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Delivery form */}
        <form
          onSubmit={(e) => { e.preventDefault(); openConfirm(); }}
          className="card space-y-5 p-6 sm:p-8 lg:col-span-2"
        >
          <h2 className="text-lg font-bold text-white">Delivery information</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="co-name" className="label">Full name *</label>
              <input id="co-name" name="full_name" value={form.full_name} onChange={handleChange} className="input" placeholder="Your full name" disabled={placing} />
            </div>
            <div>
              <label htmlFor="co-phone" className="label">Phone *</label>
              <input id="co-phone" name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="+1 555 000 0000" disabled={placing} />
            </div>
          </div>
          <div>
            <label htmlFor="co-address" className="label">Delivery address *</label>
            <input id="co-address" name="address" value={form.address} onChange={handleChange} className="input" placeholder="Street, house number, landmark" disabled={placing} />
          </div>
          <div>
            <label htmlFor="co-city" className="label">City / location *</label>
            <input id="co-city" name="city" value={form.city} onChange={handleChange} className="input" placeholder="City, region" disabled={placing} />
          </div>
          <div>
            <label htmlFor="co-instructions" className="label">Additional delivery instructions</label>
            <textarea
              id="co-instructions"
              name="instructions"
              rows={3}
              value={form.instructions}
              onChange={handleChange}
              className="input resize-y"
              placeholder="e.g. call on arrival, leave with the security desk…"
              disabled={placing}
            />
          </div>

          <h2 className="pt-2 text-lg font-bold text-white">Items</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.product_id} className="flex items-center gap-4 rounded-lg border border-divider bg-base-2 p-3">
                <img src={item.image_url || PLACEHOLDER_IMAGE} alt={item.name} className="h-14 w-14 rounded-lg border border-divider bg-surface object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-muted">{item.quantity} × {formatMoney(item.price)}</p>
                </div>
                <p className="text-sm font-bold text-accent">{formatMoney(Number(item.price) * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </form>

        {/* Summary */}
        <aside className="card h-fit p-6">
          <h2 className="text-lg font-bold text-white">Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold">{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="flex items-center gap-1.5 text-muted"><Truck size={14} /> Delivery</dt>
              <dd className={`font-semibold ${deliveryFee === 0 ? 'text-accent' : ''}`}>
                {deliveryFee === 0 ? 'Free' : formatMoney(deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-divider pt-3 text-base">
              <dt className="font-bold text-white">Total</dt>
              <dd className="font-extrabold text-accent">{formatMoney(total)}</dd>
            </div>
          </dl>
          <button onClick={openConfirm} disabled={placing} className="btn-accent mt-6 w-full">
            {placing ? 'Placing order…' : 'Place order'} <ArrowRight size={16} />
          </button>
          <Link to="/cart" className="btn-ghost mt-2 w-full">
            <ShoppingBag size={15} /> Back to cart
          </Link>
        </aside>
      </div>

      {/* Final confirmation dialog */}
      <Modal open={confirmOpen} onClose={() => !placing && setConfirmOpen(false)} title="Confirm your order">
        <div className="space-y-4">
          <div className="rounded-lg border border-divider bg-base-2 p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold text-white"><ShoppingBag size={15} className="text-accent" /> {items.length} product line(s)</p>
            <p className="mt-1 text-muted">Deliver to: <span className="text-white">{form.full_name}</span>, {form.address}, {form.city}</p>
            <p className="mt-1 text-muted">Phone: <span className="text-white">{form.phone}</span></p>
          </div>
          <p className="text-sm text-muted">
            Prices and availability are re-checked from our catalogue just before your order is created.
            You will be notified at every step after that.
          </p>
          <div className="flex justify-between rounded-lg border border-accent/30 bg-accent/5 p-4">
            <span className="text-sm font-semibold text-white">Total</span>
            <span className="text-lg font-extrabold text-accent">{formatMoney(total)}</span>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmOpen(false)} disabled={placing} className="btn-outline">Go back</button>
            <button onClick={placeOrder} disabled={placing} className="btn-accent">
              {placing ? 'Placing…' : 'Confirm & place order'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
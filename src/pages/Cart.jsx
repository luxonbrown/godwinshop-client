import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatMoney } from '../utils/format';
import EmptyState from '../components/EmptyState';
import { PLACEHOLDER_IMAGE } from '../utils/constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Cart() {
  useDocumentTitle('Your Cart');
  const { items, subtotal, deliveryFee, total, updateQuantity, removeItem } = useCart();
  const toast = useToast();

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <h1 className="text-2xl font-bold sm:text-3xl">Your Cart</h1>
        <EmptyState
          title="Your cart is empty"
          description="Browse the catalogue and add a few products before checking out."
          action={<Link to="/products" className="btn-accent">Browse products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">Your Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div key={item.product_id} className="card flex gap-4 p-4 sm:gap-5">
              <Link to={`/products/${item.product_id}`} className="shrink-0">
                <img
                  src={item.image_url || PLACEHOLDER_IMAGE}
                  alt={item.name}
                  className="h-20 w-20 rounded-lg border border-divider bg-base-2 object-cover sm:h-24 sm:w-24"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/products/${item.product_id}`} className="truncate font-semibold text-white hover:text-accent">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => { removeItem(item.product_id); toast.info(`${item.name} removed from cart`); }}
                    aria-label={`Remove ${item.name} from cart`}
                    className="p-1 text-muted transition-colors hover:text-red-400"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <p className="mt-1 text-sm font-bold text-accent">{formatMoney(item.price)}</p>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-lg border border-divider bg-surface">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="p-2 text-muted hover:text-accent"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      title={item.quantity >= item.stock ? `Only ${item.stock} available` : undefined}
                      disabled={item.quantity >= item.stock}
                      className="p-2 text-muted hover:text-accent disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {formatMoney(Number(item.price) * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="card h-fit p-6">
          <h2 className="text-lg font-bold text-white">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-white">{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="flex items-center gap-1.5 text-muted">
                <Truck size={14} /> Delivery fee
              </dt>
              <dd className={`font-semibold ${deliveryFee === 0 ? 'text-accent' : 'text-white'}`}>
                {deliveryFee === 0 ? 'Free' : formatMoney(deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-divider pt-3 text-base">
              <dt className="font-bold text-white">Total</dt>
              <dd className="font-extrabold text-accent">{formatMoney(total)}</dd>
            </div>
          </dl>
          {deliveryFee > 0 && (
            <p className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs text-muted">
              Add {formatMoney(50000 - subtotal)} more to get free delivery.
            </p>
          )}
          <Link to="/checkout" className="btn-accent mt-6 w-full">
            Proceed to checkout <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn-ghost mt-2 w-full">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
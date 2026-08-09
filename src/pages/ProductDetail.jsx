import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingCart, Minus, Plus, ChevronRight, Truck,
  ShieldCheck, CalendarCheck
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { effectivePrice, isOutOfStock, PLACEHOLDER_IMAGE } from '../utils/constants';
import { formatMoney } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useApi(`/products/${id}`);
  const { addItem } = useCart();
  const toast = useToast();
  const { status } = useAuth();
  const [quantity, setQuantity] = useState(1);
  useDocumentTitle(data?.product?.name || 'Product');

  if (loading) return <Spinner label="Loading product…" className="min-h-[60vh]" />;
  if (error) {
    return (
      <div className="container-page py-20">
        <EmptyState title="Product not available" description={error} />
      </div>
    );
  }
  if (!data?.product) return null;

  const product = data.product;
  const out = isOutOfStock(product);
  const price = effectivePrice(product);
  const hasDiscount = Number(product.discount_price || 0) > 0;

  function handleAdd() {
    if (status !== 'authenticated') {
      toast.info('Please sign in to add products to your cart.');
      navigate('/login');
      return;
    }
    addItem(product, quantity);
    toast.success(`Added ${quantity} × ${product.name} to cart`);
  }

  function handleBuyNow() {
    if (status !== 'authenticated') {
      toast.info('Please sign in to continue.');
      navigate('/login');
      return;
    }
    addItem(product, quantity);
    navigate('/checkout');
  }

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
        <Link to="/" className="hover:text-accent">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-accent">Products</Link>
        <ChevronRight size={14} />
        {product.category_name && (
          <>
            <Link to={`/categories/${product.category_id}`} className="hover:text-accent">{product.category_name}</Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="truncate text-white">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative overflow-hidden rounded-2xl border border-divider bg-base-2">
          <img
            src={product.image_url || PLACEHOLDER_IMAGE}
            alt={product.name}
            className="aspect-square w-full object-cover"
            onError={(e) => { if (e.currentTarget.src !== PLACEHOLDER_IMAGE) e.currentTarget.src = PLACEHOLDER_IMAGE; }}
          />
          {hasDiscount && (
            <span className="absolute left-4 top-4 rounded-md bg-accent px-2.5 py-1 text-sm font-bold text-black">
              SAVE {formatMoney(Number(product.price) - price)}
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{product.category_name}</p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{product.name}</h1>
          <p className="mt-1 text-xs text-muted">SKU: {product.sku}</p>

          <div className="mt-5 flex items-end gap-3">
            <p className="text-3xl font-extrabold text-accent">{formatMoney(price)}</p>
            {hasDiscount && <p className="pb-1 text-lg text-muted line-through">{formatMoney(product.price)}</p>}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {out ? (
              <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 font-semibold text-red-600 dark:border-red-800/60 dark:bg-red-950/60 dark:text-red-400">Out of stock</span>
            ) : product.stock_quantity <= 5 ? (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-semibold text-accent">
                Low stock — only {product.stock_quantity} left
              </span>
            ) : (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-semibold text-accent">
                In stock ({product.stock_quantity})
              </span>
            )}
            {hasDiscount && (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-semibold text-accent">
                −{Math.round((1 - price / Number(product.price)) * 100)}% off
              </span>
            )}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted">{product.description || 'No description provided for this product.'}</p>

          {/* Quantity + actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border border-divider bg-surface">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                disabled={out}
                className="p-3 text-muted hover:text-accent disabled:opacity-40"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center text-sm font-bold text-white">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                aria-label="Increase quantity"
                disabled={out}
                className="p-3 text-muted hover:text-accent disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
            </div>
            <button onClick={handleAdd} disabled={out} className="btn-accent flex-1 sm:flex-none">
              <ShoppingCart size={17} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={out} className="btn-outline flex-1 sm:flex-none">
              Buy Now
            </button>
          </div>
          {out && <p className="mt-3 text-sm text-red-500 dark:text-red-400">This product is temporarily unavailable. Please check back soon.</p>}

          {/* Trust row */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, label: 'Real delivery dates', text: 'Assigned by our team' },
              { icon: ShieldCheck, label: 'Verified orders', text: 'Server-side validation' },
              { icon: CalendarCheck, label: 'Full tracking', text: 'Status updates at every stage' }
            ].map((t) => (
              <div key={t.label} className="card p-4">
                <t.icon size={18} className="text-accent" />
                <p className="mt-2 text-sm font-semibold text-white">{t.label}</p>
                <p className="mt-0.5 text-xs text-muted">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {data.related_products?.length > 0 && (
        <section className="mt-16" aria-labelledby="related">
          <h2 id="related" className="text-xl font-bold text-white">You may also like</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {data.related_products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
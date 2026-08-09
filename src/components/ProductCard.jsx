import { Link } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Eye } from 'lucide-react';
import { effectivePrice, isOutOfStock, productImage, PLACEHOLDER_IMAGE } from '../utils/constants';
import { formatMoney } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product, showAdd = true }) {
  const { addItem } = useCart();
  const toast = useToast();
  const out = isOutOfStock(product);
  const price = effectivePrice(product);
  const hasDiscount = Number(product.discount_price || 0) > 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (out) return;
    addItem(product, 1);
    toast.success(`"${product.name}" added to cart`);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-glow"
    >
      <div className="relative aspect-square overflow-hidden bg-base-2">
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== PLACEHOLDER_IMAGE) e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-black">
            −{Math.round((1 - price / Number(product.price)) * 100)}%
          </span>
        )}
        {out && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-600 dark:border-red-800/60 dark:bg-red-950/70 dark:text-red-300">
              Out of Stock
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-accent">
          {product.category_name || 'GodwinShop'}
        </span>
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-white group-hover:text-accent">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="text-base font-extrabold text-accent" style={{ color: '#F5C400' }}>{formatMoney(price)}</p>
            {hasDiscount && (
              <p className="text-xs text-muted line-through">{formatMoney(product.price)}</p>
            )}
          </div>
          {showAdd && !out && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(e); }}
              aria-label={`Add ${product.name} to cart`}
              className="rounded-lg border border-accent/40 p-2 text-accent transition-colors hover:bg-accent hover:text-black"
            >
              <ShoppingCart size={16} />
            </button>
          )}
          {out && (
            <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
              <Eye size={13} /> Details
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
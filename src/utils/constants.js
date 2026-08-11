export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready_for_delivery', label: 'Ready for Delivery' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

export const ORDER_STATUS_LABELS = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.value, s.label])
);

export const ORDER_FLOW = ORDER_STATUSES
  .filter((s) => s.value !== 'cancelled')
  .map((s) => s.value);

export const ORDER_STATUS_STYLES = {
  pending: 'bg-yellow-950/60 text-yellow-400 border-yellow-800/60',
  confirmed: 'bg-sky-950/60 text-sky-400 border-sky-800/60',
  processing: 'bg-violet-950/60 text-violet-400 border-violet-800/60',
  ready_for_delivery: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60',
  out_for_delivery: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/60',
  delivered: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
  cancelled: 'bg-red-950/60 text-red-400 border-red-800/60'
};

export const PRODUCT_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  out_of_stock: 'Out of Stock'
};

export const DELIVERY_FEE = 2500;
export const FREE_DELIVERY_THRESHOLD = 50000;

/** Reflection of the server-side rule in server/src/config/env.js → delivery. */
export function computeDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

const isDesktop = typeof window !== 'undefined' && !!window.godwinshopDesktop?.isDesktop;

// Root of the API server (no trailing /api), used to resolve /uploads/... paths.
// In the browser the Vite proxy (dev) or the hosting setup serves them; on the
// desktop (file://, no proxy) they must be absolute HTTPS URLs.
const DESKTOP_API_ROOT = import.meta.env.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '')
  : 'https://godwinshop-api.onrender.com';

export function resolveImageUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (isDesktop && path.startsWith('/')) return `${DESKTOP_API_ROOT}${path}`;
  return path;
}

export const PLACEHOLDER_IMAGE = isDesktop
  ? `${DESKTOP_API_ROOT}/uploads/placeholder.svg`
  : '/uploads/placeholder.svg';

export function productImage(product) {
  return resolveImageUrl(product?.image_url || PLACEHOLDER_IMAGE);
}

export function effectivePrice(product) {
  const discount = Number(product?.discount_price || 0);
  const price = Number(product?.price || 0);
  return discount > 0 ? discount : price;
}

export function isOutOfStock(product) {
  return (
    product?.status === 'out_of_stock' ||
    product?.status === 'inactive' ||
    Number(product?.stock_quantity || 0) <= 0
  );
}
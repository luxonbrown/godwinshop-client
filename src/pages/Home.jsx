import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShoppingBag, Truck, BellRing, ShieldCheck,
  Search, PackageCheck, CalendarCheck, Store, UserPlus, ListChecks, Sparkles,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { formatMoney } from '../utils/format';
import { productImage, effectivePrice } from '../utils/constants';

const FEATURES = [
  { icon: PackageCheck, title: 'Order in minutes', text: 'Browse, add to cart and check out without the friction.' },
  { icon: CalendarCheck, title: 'Real delivery dates', text: 'Your expected delivery date is assigned by our team — and updated for you automatically.' },
  { icon: BellRing, title: 'Track everything', text: 'Notifications at every stage: placed, confirmed, out for delivery, delivered.' },
  { icon: ShieldCheck, title: 'Verified accounts', text: 'Account verification keeps every order secure and traceable.' }
];

const STEPS = [
  { icon: UserPlus, title: 'Create your account', text: 'Register in under a minute and verify your email to unlock ordering.' },
  { icon: ListChecks, title: 'Pick your products', text: 'Search, filter and open any product, then add quantity to your cart.' },
  { icon: ShoppingBag, title: 'Checkout', text: 'Confirm your delivery details, review your order and place it.' },
  { icon: CalendarCheck, title: 'Get delivered', text: 'Track the status and see your expected delivery date as it updates.' }
];

const LIFECYCLE = [
  { label: 'Next delivery', value: 'Tracked live' },
  { label: 'Order status', value: 'Confirmed' },
  { label: 'Package update', value: 'Out for delivery' },
  { label: 'Final stage', value: 'Delivered' }
];

export default function Home() {
  useDocumentTitle('Shop Smarter. Order Easily. Get It Delivered.');
  const { user, status } = useAuth();
  const { addItem } = useCart();
  const { data, loading } = useApi('/products?limit=8&sort=newest');

  const products = data?.products || [];

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (!products.length) return;
    const t = setInterval(() => setSlide((s) => s + 1), 3500);
    return () => clearInterval(t);
  }, [products.length]);

  const productIdx = products.length ? slide % products.length : 0;
  const lifecycleIdx = slide % LIFECYCLE.length;
  const current = products[productIdx];

  const heroAction = (product) => {
    if (!product) return;
    addItem(product, 1);
  };

  const goToSlide = (i, n) => setSlide(((i % n) + n) % n);

  return (
    <div>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden border-b border-divider bg-base-2">
        <div className="container-page grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
          <div className="animate-fade-in">
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              <Sparkles size={14} /> Premium commerce platform
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Shop Smarter. Order Easily.{' '}
              <span className="text-accent">Get It Delivered.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              GodwinShop lets you discover products, place orders and follow every
              step of delivery — always knowing exactly when to expect your package.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn-accent text-base">
                Explore Products <ArrowRight size={18} />
              </Link>
              {status !== 'authenticated' ? (
                <Link to="/register" className="btn-outline text-base">
                  Create Account
                </Link>
              ) : (
                <Link to={user?.is_verified ? '/orders' : '/verify'} className="btn-outline text-base">
                  {user?.is_verified ? 'Track Your Orders' : 'Verify Your Account'}
                </Link>
              )}
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-divider pt-6 text-center sm:max-w-md sm:gap-6 sm:text-left">
              <div>
                <p className="text-2xl font-bold text-accent sm:text-3xl">100%</p>
                <p className="mt-1 text-xs text-muted">Order confirmation</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent sm:text-3xl">24/7</p>
                <p className="mt-1 text-xs text-muted">Status tracking</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent sm:text-3xl">1–7</p>
                <p className="mt-1 text-xs text-muted">Days to delivery*</p>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-2xl border border-divider bg-surface shadow-card">
              {current ? (
                <div key={current.id} className="animate-slide">
                  <img
                    src={productImage(current)}
                    alt={current.name}
                    className="h-[420px] w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-accent">Trending now</p>
                      <Link to={`/products/${current.id}`} className="mt-1 block text-lg font-bold text-white hover:text-accent">
                        {current.name}
                      </Link>
                      <p className="text-sm font-semibold text-accent">{formatMoney(effectivePrice(current))}</p>
                    </div>
                    <button onClick={() => heroAction(current)} className="btn-accent shrink-0">
                      Add to Cart <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-[420px] items-center justify-center bg-gradient-to-b from-base-2 to-surface px-8 text-center">
                  <p className="text-sm text-muted">
                    Featured products will appear here as soon as they are published.
                  </p>
                </div>
              )}

              {products.length > 1 && (
                <>
                  <button
                    onClick={() => goToSlide(productIdx - 1, products.length)}
                    aria-label="Previous product"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-accent hover:text-black"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => goToSlide(productIdx + 1, products.length)}
                    aria-label="Next product"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-accent hover:text-black"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute right-4 top-4 flex gap-1.5">
                    {products.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => goToSlide(i, products.length)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === productIdx ? 'w-5 bg-accent' : 'w-1.5 bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="absolute -left-6 -top-6 w-44 rounded-xl border border-accent/40 bg-base-2 px-4 py-3 shadow-glow">
              <div key={slide} className="animate-slide">
                <p className="text-xs uppercase tracking-wide text-muted">{LIFECYCLE[lifecycleIdx].label}</p>
                <p className="text-sm font-bold text-accent">{LIFECYCLE[lifecycleIdx].value}</p>
              </div>
              <div className="mt-2 flex gap-1.5">
                {LIFECYCLE.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === lifecycleIdx ? 'w-3.5 bg-accent' : 'w-1.5 bg-divider'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 transition-colors duration-200 hover:border-accent/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <f.icon size={22} />
              </div>
              <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== NEW ARRIVALS ===================== */}
      <section className="container-page py-16 sm:py-20" aria-labelledby="new-arrivals">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 id="new-arrivals" className="text-2xl font-bold text-white sm:text-3xl">
              New arrivals
            </h2>
            <p className="mt-1 text-sm text-muted">Fresh stock, ready to order.</p>
          </div>
          <Link to="/products" className="btn-outline shrink-0">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <Spinner label="Loading products…" />
        ) : data?.products?.length ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
            {data.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="No products yet" description="New products will appear here as soon as they are published." />
        )}
      </section>

      {/* ===================== HOW DOES ORDERING WORK ===================== */}
      <section className="border-t border-divider bg-base-2">
        <div className="container-page py-16 sm:py-20">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">How ordering works</p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">From cart to doorstep</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="card relative p-6">
                <span className="absolute right-5 top-5 text-3xl font-black text-base-2">{i + 1}</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-black">
                  <s.icon size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/how-it-works" className="btn-accent">
              See the full guide <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
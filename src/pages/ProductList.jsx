import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import client from '../api/client';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' }
];

export default function ProductList() {
  const { id: categoryId } = useParams();
  const [params, setParams] = useSearchParams();
  useDocumentTitle(categoryId ? `Browse Category` : 'Products');

  const page = Math.max(parseInt(params.get('page') || '1', 10), 1);
  const [searchInput, setSearchInput] = useState(params.get('q') || '');
  const search = useDebounce(searchInput, 350);
  const [sort, setSort] = useState(params.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(params.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('max_price') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryName, setCategoryName] = useState(null);

  const query = new URLSearchParams({
    page,
    sort,
    limit: 12,
    ...(categoryId ? { category_id: categoryId } : {}),
    ...(search ? { search } : {}),
    ...(minPrice ? { min_price: minPrice } : {}),
    ...(maxPrice ? { max_price: maxPrice } : {})
  });

  const { data, loading } = useApi(`/products?${query}`);

  useEffect(() => {
    if (!categoryId) return;
    client.get(`/categories/${categoryId}`).then(({ data }) => setCategoryName(data.category?.name || null)).catch(() => {});
  }, [categoryId]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    next.set('page', String(page));
    if (search) next.set('search', search); else next.delete('search');
    next.set('sort', sort);
    if (minPrice) next.set('min_price', minPrice); else next.delete('min_price');
    if (maxPrice) next.set('max_price', maxPrice); else next.delete('max_price');
    setParams(next, { replace: true });
  }, [page, search, sort, minPrice, maxPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToPage(p) {
    setParams({ ...Object.fromEntries(params), page: p > 1 ? String(p) : undefined });
    window.scrollTo({ top: 0 });
  }

  const hasFilters = Boolean(search || minPrice || maxPrice);

  return (
    <div>
      <PageHeader
        eyebrow={categoryId ? 'Category' : 'Catalog'}
        title={categoryName || (categoryId ? 'Products' : 'Browse Products')}
        description="Search, filter and sort the full GodwinShop catalogue."
      />

      <div className="container-page py-8">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search products</span>
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setParams((p) => { const n = new URLSearchParams(p); if (e.target.value.trim()) n.set('search', e.target.value.trim()); else n.delete('search'); n.delete('page'); return n; });
              }}
              placeholder="Search by name, description or SKU…"
              className="input pl-10"
            />
          </label>
          <div className="flex gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" className="input w-auto">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button
              onClick={() => setShowFilters((f) => !f)}
              aria-expanded={showFilters}
              className={`btn-outline ${showFilters ? 'border-accent text-accent' : ''}`}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Price filter */}
        {showFilters && (
          <div className="animate-fade-in mt-4 rounded-xl border border-divider bg-surface p-4">
            <label htmlFor="price-range" className="label">Price range</label>
            <div className="flex flex-wrap items-center gap-3">
              <input placeholder="Min" inputMode="decimal" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input w-32" aria-label="Minimum price" />
              <span className="text-muted">—</span>
              <input placeholder="Max" inputMode="decimal" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input w-32" aria-label="Maximum price" />
              {(minPrice || maxPrice) && (
                <button
                  onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                  className="flex items-center gap-1 text-sm text-accent hover:underline"
                >
                  <X size={14} /> Clear price filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="mt-8">
          {loading ? (
            <Spinner label="Loading products…" />
          ) : data?.products?.length ? (
            <>
              <p className="mb-4 text-sm text-muted">{data.total} product{data.total !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {data.products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination page={data.page} pages={data.pages} total={data.total} onPage={goToPage} className="mt-10" />
            </>
          ) : (
            <EmptyState
              title="No products found"
              description={hasFilters ? 'Try adjusting your search or price filters.' : 'No products match this category yet.'}
              action={<button onClick={() => { setSearchInput(''); setMinPrice(''); setMaxPrice(''); }} className="btn-outline">Clear filters</button>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
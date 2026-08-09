import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import client from '../../api/client';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import { PRODUCT_STATUS_LABELS, PLACEHOLDER_IMAGE, effectivePrice } from '../../utils/constants';
import { formatDate, formatMoney } from '../../utils/format';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';

export default function AdminProducts() {
  useDocumentTitle('Manage Products');
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(params.get('page') || '1', 10));
  const [status, setStatus] = useState(params.get('status') || '');
  const [searchInput, setSearchInput] = useState(params.get('search') || '');
  const search = useDebounce(searchInput, 350);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showRestore, setShowRestore] = useState(false);

  const query = new URLSearchParams({
    page,
    limit: 10,
    include_inactive: 'true',
    sort: 'newest',
    ...(status ? { status } : {}),
    ...(search ? { search } : {})
  });

  const { data, loading, reload } = useApi(`/products?${query}`, { deps: [page, status, search] });

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  useEffect(() => {
    setParams({ page: page > 1 ? String(page) : '', ...(status ? { status } : {}) }, { replace: true });
  }, [page, status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function deleteProduct() {
    setDeleting(true);
    try {
      await client.delete(`/products/${deleteId}`);
      toast.success('Product deleted.');
      setDeleteId(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Link to="/admin/products/new" className="btn-accent">
          <Plus size={16} /> Add product
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search products (admin)</span>
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="input pl-10" placeholder="Search name, description or SKU…" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="input w-full sm:w-48">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading products…" className="mt-8" />
      ) : data?.products?.length ? (
        <>
          <div className="table-wrap mt-6">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={p.image_url || '/uploads/placeholder.svg'} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-divider bg-base-2 object-cover" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{p.name}</p>
                          <p className="text-xs text-muted">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{p.category_name || '—'}</td>
                    <td>
                      <p className="font-bold text-accent">{formatMoney(effectivePrice(p))}</p>
                      {Number(p.discount_price) > 0 && <p className="text-xs text-muted line-through">{formatMoney(p.price)}</p>}
                    </td>
                    <td>
                      <span className={Number(p.stock_quantity) === 0 ? 'font-bold text-red-500 dark:text-red-400' : 'font-semibold text-white'}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        p.status === 'active' ? 'border-accent/40 bg-accent/10 text-accent'
                          : p.status === 'inactive' ? 'border-divider bg-surface-2 text-muted'
                          : 'border-red-500/40 bg-red-500/10 text-red-600 dark:border-red-800/60 dark:bg-red-950/60 dark:text-red-400'
                      }`}>
                        {PRODUCT_STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1.5">
                        <Link to={`/admin/products/${p.id}/edit`} aria-label={`Edit ${p.name}`} className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-accent">
                          <Pencil size={16} />
                        </Link>
                        <button onClick={() => setDeleteId(p.id)} aria-label={`Delete ${p.name}`} className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} className="mt-6" />
        </>
      ) : (
        <EmptyState
          title="No products found"
          description="Add products to start selling, or adjust your search."
          action={<Link to="/admin/products/new" className="btn-accent"><Plus size={15} /> Add product</Link>}
          className="mt-8"
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteProduct}
        loading={deleting}
        title="Delete this product?"
        message="If this product has order history it cannot be deleted (you would set it to inactive instead)."
        confirmText="Delete product"
      />
    </div>
  );
}
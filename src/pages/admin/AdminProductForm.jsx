import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, X, Loader2, Save } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import client from '../../api/client';
import Spinner from '../../components/Spinner';
import { productImage } from '../../utils/constants';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const EMPTY = {
  name: '',
  description: '',
  price: '',
  discount_price: '',
  category_id: '',
  sku: '',
  stock_quantity: '',
  status: 'active'
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? 'Edit Product' : 'New Product');
  const navigate = useNavigate();
  const toast = useToast();

  const { data: categoriesData, loading: catsLoading } = useApi('/categories');
  const { data: productData, loading: prodLoading } = useApi(isEdit ? `/products/${id}` : null, { deps: [] });

  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit || !productData?.product) return;
    const p = productData.product;
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price,
      discount_price: p.discount_price || '',
      category_id: String(p.category_id),
      sku: p.sku || '',
      stock_quantity: p.stock_quantity,
      status: p.status || 'active'
    });
    setPreview(productImage(p) || '/uploads/placeholder.svg');
  }, [isEdit, productData]);

  if (catsLoading || (isEdit && prodLoading)) return <Spinner label="Loading…" />;

  const categories = categoriesData?.categories || [];

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const price = parseFloat(form.price);
    const discount = form.discount_price === '' ? null : parseFloat(form.discount_price);
    const stock = parseInt(form.stock_quantity, 10);

    if (Number.isNaN(price)|| price <= 0) return setError('Price must be greater than zero.');
    if (discount !== null && (Number.isNaN(discount) || discount < 0)) return setError('Discount price must be a positive number.');
    if (discount !== null && discount >= price) return setError('Discount price must be lower than the regular price.');
    if (!form.category_id) return setError('Please select a category.');
    if (!form.name.trim()) return setError('Product name is required.');
    if (!form.sku.trim()) return setError('SKU is required.');
    if (Number.isNaN(stock) || stock < 0) return setError('Stock must be a whole number.');

    const data = new FormData();
    data.append('name', form.name.trim());
    data.append('description', form.description);
    data.append('price', price);
    if (discount !== null) data.append('discount_price', discount);
    data.append('category_id', form.category_id);
    data.append('sku', form.sku.trim());
    data.append('stock_quantity', stock);
    data.append('status', form.status);
    if (imageFile) data.append('image', imageFile);

    setSaving(true);
    try {
      if (isEdit) {
        await client.put(`/products/${id}`, data);
        toast.success('Product updated.');
      } else {
        await client.post('/products', data);
        toast.success('Product created.');
      }
      navigate('/admin/products');
    } catch (err) {
      if (err.errors && err.errors.length) {
        setError(err.errors.map((er) => er.message).join('. '));
      } else {
        setError(err.message || 'Could not save product.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent">
        <ArrowLeft size={15} /> Back to products
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-white">{isEdit ? 'Edit product' : 'Add product'}</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Image */}
        <div className="card h-fit p-6 lg:col-span-1">
          <label className="label">Product image</label>
          <div className="relative overflow-hidden rounded-xl border border-dashed border-divider bg-base-2">
            <img src={preview || '/uploads/placeholder.svg'} alt="Product preview" className="aspect-square w-full object-cover" />
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100" htmlFor="img-input">
              <span className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-black">
                <ImagePlus size={16} /> {preview && preview !== '/uploads/placeholder.svg' ? 'Replace image' : 'Upload image'}
              </span>
            </label>
            <input id="img-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImage} />
          </div>
          <p className="mt-2 text-xs text-muted">JPG, PNG, WebP or GIF · max 5MB. Old images are cleaned up automatically.</p>
        </div>

        {/* Fields */}
        <div className="card space-y-5 p-6 lg:col-span-2">
          {error && (
            <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="p-name" className="label">Product name *</label>
            <input id="p-name" name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. Aurus Smartwatch X2" />
          </div>

          <div>
            <label htmlFor="p-desc" className="label">Description</label>
            <textarea id="p-desc" name="description" rows={4} value={form.description} onChange={handleChange} className="input resize-y" placeholder="What makes this product great?" />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="p-price" className="label">Price (RWF) *</label>
              <input id="p-price" name="price" type="number" inputMode="decimal" min="0.01" step="0.01" value={form.price} onChange={handleChange} className="input" placeholder="25000" />
            </div>
            <div>
              <label htmlFor="p-discount" className="label">Discount price (RWF)</label>
              <input id="p-discount" name="discount_price" type="number" inputMode="decimal" min="0" step="0.01" value={form.discount_price} onChange={handleChange} className="input" placeholder="Optional" />
            </div>
            <div>
              <label htmlFor="p-sku" className="label">SKU *</label>
              <input id="p-sku" name="sku" value={form.sku} onChange={handleChange} className="input" placeholder="GS-1001" />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="p-category" className="label">Category *</label>
              <select id="p-category" name="category_id" value={form.category_id} onChange={handleChange} className="input">
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="p-stock" className="label">Stock quantity *</label>
              <input id="p-stock" name="stock_quantity" type="number" inputMode="numeric" min="0" value={form.stock_quantity} onChange={handleChange} className="input" placeholder="0" />
            </div>
            <div>
              <label htmlFor="p-status" className="label">Status</label>
              <select id="p-status" name="status" value={form.status} onChange={handleChange} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </div>
          </div>

          <p className="rounded-lg border border-divider bg-base-2 p-3 text-xs text-muted">
            Tip: stock of 0 always sets the product to “Out of stock” automatically.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-accent">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
            </button>
            <Link to="/admin/products" className="btn-outline">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
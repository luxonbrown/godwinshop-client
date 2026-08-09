import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import client from '../../api/client';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';

export default function AdminCategories() {
  useDocumentTitle('Categories | Admin');
  const toast = useToast();
  const { data, loading, reload } = useApi('/categories');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '' });
    setError(null);
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setError(null);
    setModalOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Category name is required.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await client.put(`/categories/${editing.id}`, form);
        toast.success('Category updated.');
      } else {
        await client.post('/categories', form);
        toast.success('Category created.');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await client.delete(`/categories/${deleteId}`);
      toast.success('Category deleted.');
      setDeleteId(null);
      reload();
    } catch (err) {
      setDeleteError(err.message);
      if (!err.message.includes('Cannot delete')) setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <button onClick={openCreate} className="btn-accent"><Plus size={16} /> Add category</button>
      </div>

      {loading ? (
        <Spinner label="Loading categories…" className="mt-8" />
      ) : data?.categories?.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.categories.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">{c.name}</h2>
                  <p className="mt-0.5 text-xs text-muted">{c.product_count} product{c.product_count !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`} className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-accent">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteId(c.id)} aria-label={`Delete ${c.name}`} className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-red-400">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {c.description && <p className="mt-2 line-clamp-2 text-sm text-muted">{c.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No categories yet"
          description="Categories organize your products — create the first one."
          action={<button onClick={openCreate} className="btn-accent"><Plus size={15} /> Add category</button>}
          className="mt-8"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit category' : 'Add category'}>
        <form onSubmit={save} className="space-y-5">
          {error && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
          <div>
            <label htmlFor="cat-name" className="label">Name *</label>
            <input id="cat-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" placeholder="e.g. Electronics" />
          </div>
          <div>
            <label htmlFor="cat-desc" className="label">Description</label>
            <textarea id="cat-desc" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input resize-y" placeholder="Short description of the category" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} disabled={saving} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-accent">{saving ? <Loader2 size={16} className="animate-spin" /> : null} {saving ? 'Saving…' : editing ? 'Save changes' : 'Create category'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => { setDeleteId(null); setDeleteError(null); }}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete this category?"
        message="Categories with products cannot be deleted. Move the products to another category first."
        confirmText="Delete category"
      />
      {deleteError && (
        <Modal open onClose={() => setDeleteError(null)} title="Cannot delete">
          <p className="text-sm text-muted">{deleteError}</p>
          <div className="mt-5 flex justify-end">
            <button onClick={() => setDeleteError(null)} className="btn-accent">Got it</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
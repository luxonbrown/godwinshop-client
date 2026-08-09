import { useEffect, useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, Hand, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import client from '../../api/client';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/format';

export default function AdminCustomers() {
  useDocumentTitle('Customers | Admin');
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 350);
  const [role, setRole] = useState('');
  const [toggle, setToggle] = useState(null);
  const [toggling, setToggling] = useState(false);

  const query = new URLSearchParams({
    page,
    limit: 12,
    ...(role ? { role } : {}),
    ...(search ? { search } : {})
  });
  const { data, loading, reload } = useApi(`/users?${query}`, { deps: [page, role, search] });

  useEffect(() => {
    setPage(1);
  }, [role, search]);

  async function doToggleStatus() {
    setToggling(true);
    try {
      const targetStatus = toggle.status === 'active' ? 'disabled' : 'active';
      const { data: res } = await client.put(`/users/${toggle.id}/status`, { status: targetStatus });
      toast.success(res.message);
      setToggle(null);
      reload();
    } catch (err) {
      toast.error(err.message || 'Could not update account status.');
    } finally {
      setToggling(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Customers</h1>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search customers</span>
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input pl-10"
            placeholder="Search by name, email or phone…"
          />
        </label>
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role" className="input w-full lg:w-48">
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading users…" className="mt-8" />
      ) : data?.users?.length ? (
        <>
          <div className="table-wrap mt-6">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Verification</th>
                  <th>Orders</th>
                  <th>Account status</th>
                  <th>Joined</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-black text-black">
                          {u.full_name ? u.full_name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() : 'U'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{u.full_name}</p>
                          <p className="text-xs text-muted">{u.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">
                      <p className="truncate">{u.email}</p>
                      <p className="text-xs">{u.phone || '—'}</p>
                    </td>
                    <td>
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                          <ShieldCheck size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-600 dark:border-red-800/60 dark:bg-red-950/60 dark:text-red-400">
                          <ShieldAlert size={12} /> Not verified
                        </span>
                      )}
                    </td>
                    <td className="font-semibold text-white">{u.order_count}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        u.status === 'active'
                          ? 'border-accent/40 bg-accent/10 text-accent'
                          : 'border-red-500/40 bg-red-500/10 text-red-600 dark:border-red-800/60 dark:bg-red-950/60 dark:text-red-400'
                      }`}>
                        {u.status === 'active' ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        {u.status === 'active' ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="text-muted">{formatDate(u.created_at)}</td>
                    <td className="text-right">
                      {u.role !== 'admin' && (
                        <button onClick={() => setToggle(u)} className="btn-outline !px-3 !py-1.5 text-xs">
                          {u.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} className="mt-6" />
        </>
      ) : (
        <EmptyState title="No customers found" description="Registered customers will appear here." className="mt-8" />
      )}

      <ConfirmDialog
        open={Boolean(toggle)}
        onClose={() => setToggle(null)}
        onConfirm={doToggleStatus}
        loading={toggling}
        title={toggle?.status === 'disabled' ? 'Enable this customer?' : 'Disable this customer?'}
        message={
          toggle?.status === 'disabled'
            ? `Re-enabling ${toggle?.full_name} restores their access to the store.`
            : `Disabling ${toggle?.full_name} signs them out immediately and blocks them from shopping.`
        }
        confirmText={toggle?.status === 'disabled' ? 'Enable account' : 'Disable account'}
      />
    </div>
  );
}
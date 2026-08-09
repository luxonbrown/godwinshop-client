import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, ShieldCheck, ShieldAlert, Camera, Lock, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import client from '../api/client';
import { useApi } from '../hooks/useApi';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { formatDate } from '../utils/format';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Profile() {
  useDocumentTitle('My Profile');
  const { user, setUser, refreshUnread } = useAuth();
  const toast = useToast();
  const { data, loading, reload } = useApi('/users/profile');
  const fileInput = useRef(null);

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const profile = data?.user || user;

  if (loading) return <Spinner label="Loading profile…" className="min-h-[60vh]" />;

  function startEdit() {
    setForm({
      full_name: profile.full_name,
      phone: profile.phone || '',
      address: profile.address || '',
      city: profile.city || ''
    });
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    const body = new FormData();
    body.append('full_name', form.full_name);
    body.append('phone', form.phone);
    body.append('address', form.address);
    body.append('city', form.city);
    try {
      const { data: res } = await client.put('/users/profile', body);
      setUser((prev) => ({ ...prev, ...res.user }));
      reload();
      toast.success('Profile updated.');
      setForm(null);
    } catch (err) {
      toast.error(err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.');
      return;
    }
    setUploading(true);
    const body = new FormData();
    body.append('profileImage', file);
    try {
      const { data: res } = await client.put('/users/profile', body);
      setUser((prev) => ({ ...prev, ...res.user }));
      reload();
      toast.success('Profile picture updated.');
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('New passwords do not match.');
      return;
    }
    setPwSaving(true);
    try {
      await client.put('/auth/password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password
      });
      toast.success('Password changed. Other devices were signed out.');
      setPwOpen(false);
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Could not change password.');
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">My Profile</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left card */}
        <aside className="card h-fit overflow-hidden">
          <div className="flex flex-col items-center border-b border-divider bg-base-2 p-6">
            <div className="relative">
              <img
                src={profile.profile_image || '/uploads/placeholder.svg'}
                alt={`${profile.full_name} profile picture`}
                className="h-24 w-24 rounded-full border-2 border-accent object-cover"
              />
              <button
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                aria-label="Change profile picture"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                <Camera size={15} />
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => uploadPhoto(e.target.files?.[0])}
              />
            </div>
            {uploading && <p className="mt-2 text-xs text-muted">Uploading…</p>}
            <h2 className="mt-3 text-lg font-bold text-white">{profile.full_name}</h2>
            <p className="text-xs text-muted">Member since {formatDate(profile.created_at)}</p>
            <span
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                profile.is_verified
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-red-500/40 bg-red-500/10 text-red-600 dark:border-red-800/60 dark:bg-red-950/60 dark:text-red-400'
              }`}
            >
              {profile.is_verified ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
              {profile.is_verified ? 'Verified Account' : 'Account Not Verified'}
            </span>
            {!profile.is_verified && (
              <Link to="/verify" className="mt-2 text-xs font-semibold text-accent hover:underline">
                Verify your account →
              </Link>
            )}
          </div>
          <div className="space-y-3 p-5 text-sm">
            <p className="flex items-center gap-2.5 text-muted"><Mail size={15} className="text-accent" /> <span className="truncate">{profile.email}</span></p>
            <p className="flex items-center gap-2.5 text-muted"><Phone size={15} className="text-accent" /> {profile.phone || 'No phone'}</p>
            <p className="flex items-center gap-2.5 text-muted"><MapPin size={15} className="text-accent" /> {profile.city || '—'}</p>
            <p className="flex items-center gap-2.5 text-muted"><Calendar size={15} className="text-accent" /> Joined {formatDate(profile.created_at)}</p>
            <p className="flex items-center gap-2.5 text-muted"><User size={15} className="text-accent" /> Role: {profile.role}</p>
          </div>
        </aside>

        {/* Right content */}
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Account information</h2>
              {!form && <button onClick={startEdit} className="btn-outline">Edit profile</button>}
            </div>

            {form ? (
              <form onSubmit={saveProfile} className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="pf-name" className="label">Full name</label>
                  <input id="pf-name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className="input" />
                </div>
                <div>
                  <label htmlFor="pf-phone" className="label">Phone</label>
                  <input id="pf-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input" />
                </div>
                <div>
                  <label htmlFor="pf-address" className="label">Address</label>
                  <input id="pf-address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="input" />
                </div>
                <div>
                  <label htmlFor="pf-city" className="label">City</label>
                  <input id="pf-city" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="input" />
                </div>
                <div className="flex gap-3 sm:col-span-2">
                  <button type="submit" disabled={saving} className="btn-accent">{saving ? 'Saving…' : 'Save changes'}</button>
                  <button type="button" onClick={() => setForm(null)} disabled={saving} className="btn-outline">Cancel</button>
                </div>
              </form>
            ) : (
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="label !mb-1">Full name</dt>
                  <dd className="text-sm font-semibold text-white">{profile.full_name}</dd>
                </div>
                <div>
                  <dt className="label !mb-1">Email (protected)</dt>
                  <dd className="text-sm font-semibold text-white">{profile.email}</dd>
                </div>
                <div>
                  <dt className="label !mb-1">Phone</dt>
                  <dd className="text-sm font-semibold text-white">{profile.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="label !mb-1">Address</dt>
                  <dd className="text-sm font-semibold text-white">{profile.address || '—'}</dd>
                </div>
                <div>
                  <dt className="label !mb-1">City</dt>
                  <dd className="text-sm font-semibold text-white">{profile.city || '—'}</dd>
                </div>
                <div>
                  <dt className="label !mb-1">Orders placed</dt>
                  <dd className="text-sm font-semibold text-white">{profile.order_count || 0}</dd>
                </div>
              </dl>
            )}
          </section>

          <section className="card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Lock size={17} className="text-accent" /> Password & security</h2>
              <button onClick={() => setPwOpen(true)} className="btn-outline">Change password</button>
            </div>
            <p className="mt-3 text-sm text-muted">
              Your password is stored as a bcrypt hash. Changing it signs out all other devices automatically.
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/orders" className="card p-6 transition-colors hover:border-accent/50">
              <h3 className="font-semibold text-white">My orders</h3>
              <p className="mt-1 text-sm text-muted">Review order history, status and delivery dates.</p>
            </Link>
            <Link to="/notifications" className="card p-6 transition-colors hover:border-accent/50">
              <h3 className="font-semibold text-white">Notifications</h3>
              <p className="mt-1 text-sm text-muted">Stay up to date on your orders.</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Password modal */}
      <Modal open={pwOpen} onClose={() => !pwSaving && setPwOpen(false)} title="Change password">
        <form onSubmit={changePassword} className="space-y-5">
          <div>
            <label htmlFor="pw-current" className="label">Current password</label>
            <input id="pw-current" type="password" autoComplete="current-password" value={pwForm.current_password} onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))} className="input" required />
          </div>
          <div>
            <label htmlFor="pw-new" className="label">New password (min. 8 characters)</label>
            <input id="pw-new" type="password" autoComplete="new-password" value={pwForm.new_password} onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))} className="input" required minLength={8} />
          </div>
          <div>
            <label htmlFor="pw-confirm" className="label">Confirm new password</label>
            <input id="pw-confirm" type="password" autoComplete="new-password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} className="input" required />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setPwOpen(false)} disabled={pwSaving} className="btn-outline">Cancel</button>
            <button type="submit" disabled={pwSaving} className="btn-accent">
              <KeyRound size={15} /> {pwSaving ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
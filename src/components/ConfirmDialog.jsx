import { useState } from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  danger = true,
  loading = false
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <AlertTriangle size={20} />
          </div>
          <p className="pt-1 text-sm text-muted">{message || 'This action cannot be undone.'}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="btn-outline">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger">
            {loading ? 'Working…' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
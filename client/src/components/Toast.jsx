import { useEffect, useRef } from 'react';

/**
 * Toast — a short-lived, accessible notification.
 *
 * Props:
 *   toasts  — array of { id, message, type? } where type is 'success'|'error'|undefined
 *   onDismiss(id) — called after auto-dismiss or on manual close
 */
export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="false" role="status">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), 2800);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, onDismiss]);

  const typeClass = toast.type === 'error' ? ' toast-error' : toast.type === 'success' ? ' toast-success' : '';

  return (
    <div className={`toast-item${typeClass}`} role="alert">
      <span className="toast-message">{toast.message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

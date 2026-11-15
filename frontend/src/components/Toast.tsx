
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
}

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function Toast({
  message,
  type = 'info',
  onClose,
}: ToastProps) {
  const Icon = toastIcons[type];

  return (
    <div
      className={`toast toast--${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <Icon className="toast__icon" size={21} />

      <p className="toast__message">{message}</p>

      {onClose && (
        <button
          type="button"
          className="toast__close"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

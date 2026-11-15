
import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  closeOnOverlayClick?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (
          closeOnOverlayClick &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        className={`modal-dialog modal-dialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={
          description ? 'modal-description' : undefined
        }
      >
        <header className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>

            {description && (
              <p id="modal-description">{description}</p>
            )}
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </header>

        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}


import type {
  InputHTMLAttributes,
  ReactNode,
} from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId =
    id || props.name || `input-${props.type || 'text'}`;

  return (
    <div className="form-field">
      {label && (
        <label className="form-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div
        className={[
          'form-field__control',
          error ? 'form-field__control--error' : '',
          leftIcon ? 'form-field__control--icon' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {leftIcon && (
          <span className="form-field__icon" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <input
          {...props}
          id={inputId}
          className={`form-field__input ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
        />
      </div>

      {error && (
        <p
          className="form-field__error"
          id={`${inputId}-error`}
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p
          className="form-field__helper"
          id={`${inputId}-helper`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

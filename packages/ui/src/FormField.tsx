import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, required, hint, children }: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  return (
    <div className="yk-field">
      <label className="yk-field__label" htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="yk-field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="yk-field__hint">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} className="yk-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

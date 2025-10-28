import type { PropsWithChildren, ReactNode } from 'react';
import './ui.css';

type FieldProps = PropsWithChildren<{
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}>;

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="ui-field">
      <span className="ui-field__label">{label}</span>
      <div className="ui-field__control">{children}</div>
      {hint && <span className="ui-field__hint">{hint}</span>}
      {error && <span className="ui-field__error">{error}</span>}
    </label>
  );
}

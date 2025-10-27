import type { ReactNode } from 'react';
import clsx from 'clsx';
import './ui.css';

type SnackbarProps = {
  message: ReactNode;
  visible: boolean;
  variant?: 'info' | 'success' | 'warning' | 'error';
};

export function Snackbar({ message, visible, variant = 'info' }: SnackbarProps) {
  return (
    <div className={clsx('ui-snackbar', `ui-snackbar--${variant}`, visible && 'ui-snackbar--visible')} role="status">
      <span>{message}</span>
    </div>
  );
}

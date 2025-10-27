import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import clsx from 'clsx';
import './ui.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    block?: boolean;
  }
>;

export function Button({ variant = 'primary', block, className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={clsx('ui-button', `ui-button--${variant}`, block && 'ui-button--block', className)}
      {...props}
    >
      {children}
    </button>
  );
}

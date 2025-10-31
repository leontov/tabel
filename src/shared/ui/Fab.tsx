import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import clsx from 'clsx';
import './ui.css';

type FabProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Fab({ className, children, ...props }: FabProps) {
  return (
    <button type="button" className={clsx('ui-fab', className)} {...props}>
      {children}
    </button>
  );
}

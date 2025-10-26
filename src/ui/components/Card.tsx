import { PropsWithChildren } from 'react';
import { cn } from '../../utils/cn';

type CardProps = PropsWithChildren<{
  title?: string;
  actions?: React.ReactNode;
  className?: string;
}>;

export const Card = ({ children, title, actions, className }: CardProps) => (
  <section className={cn('rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/40', className)}>
    {(title || actions) && (
      <header className="mb-3 flex items-center justify-between text-sm text-slate-300">
        <h2 className="font-semibold text-slate-100">{title}</h2>
        {actions}
      </header>
    )}
    <div className="space-y-2 text-sm text-slate-300">{children}</div>
  </section>
);

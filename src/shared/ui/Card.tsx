import type { PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';
import './ui.css';

type CardProps = PropsWithChildren<{
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
}>;

export function Card({ title, actions, className, children }: CardProps) {
  return (
    <section className={clsx('ui-card', className)}>
      {(title || actions) && (
        <header className="ui-card__header">
          <h2 className="ui-card__title">{title}</h2>
          {actions && <div className="ui-card__actions">{actions}</div>}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
    </section>
  );
}

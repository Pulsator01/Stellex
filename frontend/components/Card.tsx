import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}>;

export default function Card({ title, subtitle, actions, children }: Props) {
  return (
    <section className="card p-5">
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title ? <h3 className="font-semibold">{title}</h3> : null}
            {subtitle ? <p className="text-xs text-gray-500">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}



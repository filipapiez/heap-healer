import type { ReactNode } from "react";

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      {actions}
    </header>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-10 text-center">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[var(--color-ink-700)]/60">{body}</p>
    </div>
  );
}
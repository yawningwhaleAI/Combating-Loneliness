'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('rounded-2xl border border-slate-200 bg-white shadow-card', className)} {...rest}>{children}</div>;
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-deep disabled:bg-slate-300',
  secondary: 'bg-white text-ink border border-slate-300 hover:bg-slate-50 disabled:text-slate-400',
  ghost: 'text-ink-soft hover:bg-slate-100',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300',
};

export function Button({ variant = 'primary', size = 'md', className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition disabled:cursor-not-allowed',
        size === 'sm' && 'h-8 px-3 text-sm', size === 'md' && 'h-10 px-4 text-sm', size === 'lg' && 'h-12 px-5 text-base',
        VARIANT[variant], className,
      )}
      {...rest}
    />
  );
}

export function LinkButton({ href, children, variant = 'primary', className }: { href: string; children: ReactNode; variant?: Variant; className?: string }) {
  return (
    <Link href={href} className={clsx('inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-medium transition', VARIANT[variant], className)}>
      {children}
    </Link>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', className ?? 'bg-slate-100 text-ink-soft')}>{children}</span>;
}

export function Stat({ label, value, sub, tone, icon }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'red' | 'blue' | 'green' | 'amber' | 'brand'; icon?: ReactNode }) {
  const toneCls = { red: 'text-red-700', blue: 'text-blue-700', green: 'text-emerald-700', amber: 'text-amber-700', brand: 'text-brand' }[tone ?? 'brand'];
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-ink-mute">{label}{icon}</div>
      <div className={clsx('mt-1 text-2xl font-semibold tabular-nums', toneCls)}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-mute">{sub}</div>}
    </Card>
  );
}

export function SectionTitle({ title, sub, right }: { title: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {sub && <p className="text-sm text-ink-mute">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children && <div className="mt-1 text-sm text-ink-mute">{children}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-white px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={clsx('whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition', value === t.id ? 'bg-white text-ink shadow-sm' : 'text-ink-mute hover:text-ink')}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 99999, step = 1, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; label?: string }) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white">
      <button type="button" aria-label={`Decrease ${label ?? ''}`} className="h-10 w-10 text-lg text-ink-soft hover:bg-slate-50" onClick={() => onChange(clamp(value - step))}>−</button>
      <input aria-label={label} inputMode="numeric" className="h-10 w-16 border-x border-slate-200 text-center text-base font-semibold tabular-nums outline-none"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => { const n = Number(e.target.value.replace(/[^0-9.]/g, '')); onChange(clamp(Number.isFinite(n) ? n : 0)); }} />
      <button type="button" aria-label={`Increase ${label ?? ''}`} className="h-10 w-10 text-lg text-ink-soft hover:bg-slate-50" onClick={() => onChange(clamp(value + step))}>+</button>
    </div>
  );
}

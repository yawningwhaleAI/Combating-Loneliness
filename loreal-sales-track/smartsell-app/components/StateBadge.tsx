import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Clock, MoonStar, PackageX, TrendingDown } from 'lucide-react';
import type { RiskState } from '@/lib/types';

export const STATE_META: Record<RiskState, { label: string; short: string; cls: string; dot: string; hex: string; Icon: typeof Clock }> = {
  NEAR_EXPIRY: { label: 'Near-expiry', short: 'Near-expiry', cls: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500', hex: '#dc2626', Icon: AlertTriangle },
  AGEING_RISK: { label: 'Ageing risk', short: 'Ageing', cls: 'bg-orange-50 text-orange-700 ring-orange-200', dot: 'bg-orange-500', hex: '#ea580c', Icon: Clock },
  STOCKOUT_RISK: { label: 'Stock-out risk', short: 'Stock-out', cls: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-blue-500', hex: '#2563eb', Icon: PackageX },
  DORMANT: { label: 'Dormant', short: 'Dormant', cls: 'bg-slate-100 text-slate-700 ring-slate-300', dot: 'bg-slate-500', hex: '#64748b', Icon: MoonStar },
  OVERSTOCK: { label: 'Slow / overstock', short: 'Overstock', cls: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-400', hex: '#d97706', Icon: TrendingDown },
  HEALTHY: { label: 'Healthy', short: 'Healthy', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500', hex: '#059669', Icon: CheckCircle2 },
};

export function StateBadge({ state, size = 'md' }: { state: RiskState; size?: 'sm' | 'md' }) {
  const m = STATE_META[state];
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset', m.cls, size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs')}>
      <m.Icon size={size === 'sm' ? 11 : 13} aria-hidden />
      {m.label}
    </span>
  );
}

export function ConfidenceBadge({ band }: { band: 'High' | 'Medium' | 'Low' }) {
  const cls = band === 'High' ? 'text-emerald-700 bg-emerald-50' : band === 'Medium' ? 'text-amber-800 bg-amber-50' : 'text-red-700 bg-red-50';
  return <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', cls)}>Data: {band}</span>;
}

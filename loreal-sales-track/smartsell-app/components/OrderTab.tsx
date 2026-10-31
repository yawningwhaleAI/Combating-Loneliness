'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useEvals, useStore } from '@/store/useStore';
import { inr, num } from '@/lib/format';
import { Button, Card } from './ui';
import { StateBadge } from './StateBadge';
import { SKU_BY_ID } from '@/data/seed';
import type { OrderLine, Position } from '@/lib/types';

const OVERRIDE_REASONS = ['Retailer insists (scheme commitment)', 'Upcoming local event / festival', 'Known new demand (new salon, college)', 'Other'];

export function OrderTab({ outletId, positions, visitId }: { outletId: string; positions: Position[]; visitId?: string }) {
  const evals = useEvals();
  const placeOrder = useStore((s) => s.placeOrder);
  const startVisit = useStore((s) => s.startVisit);
  const visits = useStore((s) => s.visits);
  const existing = visits.find((v) => v.id === visitId)?.orderLines;
  const [showAll, setShowAll] = useState(false);

  const initial = useMemo(() => positions.map((p) => {
    const e = evals[p.id];
    const requested = p.requestedQty ?? (e.suggestedOrder > 0 ? p.habitQty : 0);
    const prev = existing?.find((l) => l.positionId === p.id);
    return { skuId: p.skuId, positionId: p.id, requested, suggested: e.suggestedOrder, final: prev?.final ?? e.suggestedOrder, overrideReason: prev?.overrideReason } as OrderLine;
  }), [positions, evals, existing]);
  const [lines, setLines] = useState<OrderLine[]>(initial);

  const rows = lines.map((l) => ({ l, p: positions.find((x) => x.id === l.positionId)!, e: evals[l.positionId], sku: SKU_BY_ID[l.skuId] }));
  const visible = rows.filter(({ l, e }) => showAll || e.state !== 'HEALTHY' || l.requested > 0 || l.suggested > 0);

  const needsReason = (l: OrderLine) => {
    const e = evals[l.positionId];
    return (e.blocking && l.final > 0) || ((e.state === 'OVERSTOCK' || e.state === 'DORMANT') && l.final > Math.max(l.suggested, 0) * 1.5 && l.final > 0);
  };
  const errors = rows.filter(({ l }) => needsReason(l) && !l.overrideReason);
  const notCase = rows.filter(({ l, sku }) => l.final % sku.casePack !== 0);

  const reqValue = rows.reduce((s, { l, sku }) => s + l.requested * sku.ptr, 0);
  const finalValue = rows.reduce((s, { l, sku }) => s + l.final * sku.ptr, 0);
  const riskAvoided = rows.reduce((s, { l, e, sku }) => s + ((e.blocking || e.state === 'OVERSTOCK' || e.state === 'DORMANT') ? Math.max(0, l.requested - l.final) * sku.ptr : 0), 0);
  const salesProtected = rows.reduce((s, { l, e, sku }) => s + (e.state === 'STOCKOUT_RISK' ? Math.max(0, l.final - l.requested) * sku.ptr : 0), 0);

  const update = (id: string, patch: Partial<OrderLine>) => setLines((ls) => ls.map((l) => (l.positionId === id ? { ...l, ...patch } : l)));

  const reason = (l: OrderLine) => {
    const e = evals[l.positionId];
    if (e.blocking) return `At-risk batch: ${num(e.unsold)} units won't sell in time. Don't add more.`;
    if (e.state === 'STOCKOUT_RISK') return `Runs out in ${num(e.doc)} days at ${num(e.monthly, 1)}/mo. Tops up to 30 days + lead time.`;
    if (e.state === 'OVERSTOCK' || e.state === 'DORMANT') return `${Number.isFinite(e.doc) ? num(e.doc) : '∞'} days of cover already.`;
    if (l.suggested > 0) return 'Tops up to 30 days of cover + lead time.';
    return 'Enough stock until the next visit.';
  };

  return (
    <div className="space-y-4">
      <Card className="flex items-start gap-3 bg-brand-soft/50 p-4">
        <ShieldCheck className="mt-0.5 shrink-0 text-brand" />
        <div className="text-sm">
          <p className="font-semibold">Order guardrail: order what will sell, not &quot;same as last time&quot;</p>
          <p className="text-ink-soft">Suggested = velocity × (30 days of cover + 7 days lead) − stock, rounded to case packs. Zero when a batch is already at risk. Overrides need a reason.</p>
        </div>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-mute">
            <tr><th className="px-3 py-2">SKU</th><th className="px-3 py-2">Stock · cover</th><th className="px-3 py-2 text-right">Retailer asks</th><th className="px-3 py-2 text-right">Suggested</th><th className="px-3 py-2">Why</th><th className="px-3 py-2 text-right">Final order</th></tr>
          </thead>
          <tbody>
            {visible.map(({ l, e, sku }) => (
              <tr key={l.positionId} className="border-t border-slate-100 align-top">
                <td className="px-3 py-2"><div className="font-medium">{sku.brand} {sku.name}</div><StateBadge state={e.state} size="sm" /></td>
                <td className="px-3 py-2 tabular-nums">{e.qty} · {Number.isFinite(e.doc) ? `${num(e.doc)} d` : '∞'}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <input aria-label={`Retailer asks ${sku.name}`} inputMode="numeric" value={l.requested} onChange={(ev) => update(l.positionId, { requested: Math.max(0, Number(ev.target.value.replace(/\D/g, '')) || 0) })} className="h-8 w-16 rounded-lg border border-slate-200 px-2 text-right" />
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-brand">{l.suggested}</td>
                <td className="max-w-[240px] px-3 py-2 text-xs text-ink-soft">{reason(l)}</td>
                <td className="px-3 py-2 text-right">
                  <input aria-label={`Final order ${sku.name}`} inputMode="numeric" value={l.final} onChange={(ev) => update(l.positionId, { final: Math.max(0, Number(ev.target.value.replace(/\D/g, '')) || 0) })}
                    className={clsx('h-8 w-16 rounded-lg border px-2 text-right font-semibold', needsReason(l) && !l.overrideReason ? 'border-red-400 bg-red-50' : 'border-slate-300')} />
                  {l.final % sku.casePack !== 0 && <button className="mt-1 block w-full text-right text-[11px] text-amber-700 underline" onClick={() => update(l.positionId, { final: Math.max(sku.casePack, Math.round(l.final / sku.casePack) * sku.casePack) })}>Round to case of {sku.casePack}</button>}
                  {needsReason(l) && (
                    <select aria-label="Override reason" value={l.overrideReason ?? ''} onChange={(ev) => update(l.positionId, { overrideReason: ev.target.value || undefined })} className="mt-1 h-8 w-44 rounded-lg border border-slate-300 text-xs">
                      <option value="">Override reason (required)</option>
                      {OVERRIDE_REASONS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="text-sm font-medium text-brand" onClick={() => setShowAll((s) => !s)}>{showAll ? 'Show flagged and ordered SKUs only' : `Show all ${rows.length} SKUs`}</button>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="p-3"><p className="text-xs text-ink-mute">Retailer asked for</p><p className="text-lg font-semibold">{inr(reqValue, false)}</p></Card>
        <Card className="p-3"><p className="text-xs text-ink-mute">Final order</p><p className="text-lg font-semibold">{inr(finalValue, false)}</p></Card>
        <Card className="p-3"><p className="text-xs text-ink-mute">New at-risk stock avoided</p><p className="text-lg font-semibold text-emerald-700">{inr(riskAvoided, false)}</p></Card>
        <Card className="p-3"><p className="text-xs text-ink-mute">Extra availability on stock-out SKUs</p><p className="text-lg font-semibold text-blue-700">{inr(salesProtected, false)}</p></Card>
      </div>
      {notCase.length > 0 && <p className="text-xs text-amber-700">{notCase.length} line(s) aren&apos;t full case packs. The distributor may round them.</p>}
      <div className="flex justify-end">
        <Button size="lg" disabled={errors.length > 0} onClick={() => { const vid = visitId ?? startVisit(outletId); placeOrder(vid, lines); }}>
          {existing?.length ? 'Update order' : 'Place order'}
        </Button>
      </div>
      {errors.length > 0 && <p className="text-right text-xs text-red-700">Add an override reason for {errors.length} line(s) that go against the guardrail.</p>}
    </div>
  );
}

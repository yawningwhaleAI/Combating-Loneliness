'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { FlaskConical, History, RotateCcw, Save } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { evaluate } from '@/lib/engine';
import { recommend } from '@/lib/recommend';
import { evalAll } from '@/lib/kpis';
import { addDays, daysBetween, fmtDate } from '@/lib/dates';
import { inr, num } from '@/lib/format';
import { Button, Card } from './ui';
import { StateBadge } from './StateBadge';
import { BatchTimeline } from './BatchTimeline';
import { SKU_BY_ID } from '@/data/seed';
import type { Position } from '@/lib/types';

export function WhatIfLab({ p }: { p: Position }) {
  const simDate = useStore((s) => s.simDate);
  const positions = useStore((s) => s.smart.positions);
  const applyWhatIf = useStore((s) => s.applyWhatIf);
  const markGuide = useStore((s) => s.markGuide);
  const sku = SKU_BY_ID[p.skuId];
  const sorted = useMemo(() => [...p.batches].sort((a, b) => a.expiry.localeCompare(b.expiry)), [p.batches]);
  const oldest = sorted[0];
  const baseQty = oldest?.qty ?? 0;
  const baseDte = oldest ? daysBetween(simDate, oldest.expiry) : 365;

  const [qty, setQty] = useState(baseQty);
  const [monthly, setMonthly] = useState(p.monthlySales);
  const [dte, setDte] = useState(baseDte);
  const [early, setEarly] = useState(false);

  const touch = () => markGuide('whatif');
  const shift = early ? 150 : 0;
  const draft: Position = useMemo(() => {
    const bs = sorted.map((b, i) => (i === 0 ? { ...b, qty, expiry: addDays(simDate, dte + shift) } : { ...b, expiry: addDays(b.expiry, shift) }));
    return { ...p, batches: bs, monthlySales: monthly };
  }, [sorted, qty, dte, shift, monthly, p, simDate]);

  const now = evaluate(p, sku, simDate);
  const what = evaluate(draft, sku, simDate);
  const recs = useMemo(() => {
    const ps = { ...positions, [p.id]: draft };
    const ev = evalAll(ps, simDate);
    return recommend(draft, { positions: ps, simDate, evalOf: (id) => ev[id] }).slice(0, 3);
  }, [positions, draft, p.id, simDate]);

  const changed = qty !== baseQty || monthly !== p.monthlySales || dte !== baseDte || early;
  const reset = () => { setQty(baseQty); setMonthly(p.monthlySales); setDte(baseDte); setEarly(false); };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold"><FlaskConical size={18} className="text-brand" /> What-if lab</h2>
        <span className="text-xs text-ink-mute">Change the inputs and watch the risk, ₹ and recommendations recalculate instantly</span>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <Slider label={`Units in oldest batch${oldest ? ` (${oldest.code})` : ''}`} value={qty} min={0} max={Math.max(60, baseQty * 3)} step={1} onChange={(v) => { setQty(v); touch(); }} fmt={(v) => `${v} units`} />
          <Slider label="Monthly sell-out" value={monthly} min={0} max={Math.max(30, Math.ceil(p.monthlySales * 3))} step={p.monthlySales < 5 ? 0.5 : 1} onChange={(v) => { setMonthly(v); touch(); }} fmt={(v) => `${v} / month`} />
          <Slider label="Days until oldest batch expires" value={dte} min={0} max={Math.max(720, baseDte + 200)} step={5} onChange={(v) => { setDte(v); touch(); }} fmt={(v) => `${v} days · ${fmtDate(addDays(simDate, v + shift))}`} />
          <label className={clsx('flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm', early ? 'border-brand bg-brand-soft/60' : 'border-slate-200')}>
            <input type="checkbox" className="mt-1" checked={early} onChange={(e) => { setEarly(e.target.checked); touch(); }} />
            <span><b className="flex items-center gap-1"><History size={14} /> Caught 150 days earlier</b><span className="text-ink-mute">Same shelf, same stock, but spotted 5 months sooner. See how much cheaper the problem is.</span></span>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={reset} disabled={!changed}><RotateCcw size={14} /> Reset</Button>
            <Button size="sm" disabled={!changed || early} onClick={() => applyWhatIf(p.id, { batches: draft.batches, monthlySales: monthly })} title={early ? 'Turn off "caught earlier" to save' : undefined}><Save size={14} /> Apply to stock record</Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Compare label="Now" e={now} />
            <Compare label={early ? 'If caught 150 days earlier' : 'What-if'} e={what} highlight={changed} />
          </div>
          <div className="rounded-xl bg-slate-50 p-3"><BatchTimeline e={what} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">Top recommendations for the what-if</p>
            <ol className="mt-1 space-y-1 text-sm">
              {recs.length === 0 ? <li className="text-ink-mute">No action needed.</li> : recs.map((r, i) => <li key={r.key + i}><span className="font-medium">{i + 1}. {r.title}</span> <span className="text-xs text-ink-mute">({r.level}{r.locked ? ', locked until verified' : ''})</span></li>)}
            </ol>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Compare({ label, e, highlight }: { label: string; e: ReturnType<typeof evaluate>; highlight?: boolean }) {
  return (
    <div className={clsx('rounded-xl border p-3', highlight ? 'border-brand bg-brand-soft/30' : 'border-slate-200')}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">{label}</p>
      <div className="mt-1"><StateBadge state={e.state} size="sm" /></div>
      <p className="mt-2 text-xl font-semibold tabular-nums text-red-700">{inr(e.valueAtRisk, false)}</p>
      <p className="text-[11px] text-ink-mute">at risk · {num(e.unsold)} units</p>
      <p className="mt-1 text-xs text-ink-soft">{e.window !== null ? `${e.window} days to act` : e.state === 'STOCKOUT_RISK' ? `${num(e.doc)} days cover` : 'no expiry risk'}</p>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, fmt }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt: (v: number) => string }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between text-sm"><span className="font-medium">{label}</span><span className="tabular-nums text-ink-soft">{fmt(value)}</span></div>
      <input type="range" className="mt-1 w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

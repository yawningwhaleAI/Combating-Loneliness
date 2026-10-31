'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info, Plus, ScanLine, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { evaluate, totalQty } from '@/lib/engine';
import { SIGNALS, SOURCE_LABEL } from '@/lib/params';
import { addDays, daysBetween, fmtDate } from '@/lib/dates';
import { inr, num } from '@/lib/format';
import { Button, Stepper } from './ui';
import { ConfidenceBadge, StateBadge } from './StateBadge';
import { ScanSheet } from './ScanSheet';
import { SKUS, SKU_BY_ID } from '@/data/seed';
import type { Batch, Position, SignalCode, Source } from '@/lib/types';

export function CountRow({ p, defaultOpen, counted }: { p: Position; defaultOpen?: boolean; counted: boolean }) {
  const simDate = useStore((s) => s.simDate);
  const saveCount = useStore((s) => s.saveCount);
  const showToast = useStore((s) => s.showToast);
  const sku = SKU_BY_ID[p.skuId];
  const [open, setOpen] = useState(!!defaultOpen);
  const [batches, setBatches] = useState<Batch[]>(() => p.batches.map((b) => ({ ...b })));
  const [count, setCount] = useState(totalQty(p));
  const [signals, setSignals] = useState<SignalCode[]>(p.signals);
  const [source, setSource] = useState<Source>(p.source === 'dms' ? 'manual_count' : p.source);
  const [scanOpen, setScanOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const expected = totalQty(p);
  const batchSum = batches.reduce((s, b) => s + (Number.isFinite(b.qty) ? b.qty : 0), 0);
  const draft: Position = useMemo(() => ({ ...p, batches, signals, source: touched ? source : p.source, countedAt: touched ? simDate : p.countedAt }), [p, batches, signals, source, touched, simDate]);
  const live = evaluate(draft, sku, simDate);

  const errors: string[] = [];
  const warnings: string[] = [];
  if (!Number.isInteger(count) || count < 0) errors.push('Count must be a whole number of 0 or more.');
  if (batchSum !== count) errors.push(`Batches add up to ${batchSum}, but the count is ${count}.`);
  batches.forEach((b, i) => {
    if (!b.code.trim()) errors.push(`Batch ${i + 1}: enter the batch code.`);
    if (!b.expiry) errors.push(`Batch ${i + 1}: enter the expiry date.`);
    else if (b.expiry <= simDate) warnings.push(`Batch ${b.code || i + 1} is already expired. It will be flagged for return.`);
    else if (daysBetween(simDate, b.expiry) > sku.shelfLifeMonths * 30 + 60) warnings.push(`Batch ${b.code || i + 1}: expiry is later than this product's shelf life. Please check.`);
  });
  if (expected > 0 && Math.abs(count - expected) / expected > 0.5) warnings.push(`Big difference from the expected ${expected}. Recount? (Saving will update the sell-out estimate.)`);

  const setBatch = (i: number, patch: Partial<Batch>) => { setTouched(true); setBatches((bs) => bs.map((b, j) => (j === i ? { ...b, ...patch } : b))); };
  const fixDiff = () => {
    const diff = count - batchSum;
    if (!batches.length) { setBatches([{ code: '', expiry: addDays(simDate, 365), qty: count }]); return; }
    setBatches((bs) => bs.map((b, j) => (j === 0 ? { ...b, qty: Math.max(0, b.qty + diff) } : b)));
  };
  const toggleSignal = (c: SignalCode) => { setTouched(true); setSignals((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c])); };

  const save = () => {
    if (errors.length) return;
    const note = saveCount(p.id, { batches, signals, source });
    showToast(note ?? `${sku.brand} ${sku.name}: count saved (${SOURCE_LABEL[source]})`);
    setTouched(false);
    setOpen(false);
  };

  return (
    <div className={clsx('rounded-2xl border bg-white', counted ? 'border-emerald-200' : 'border-slate-200')}>
      <button className="flex w-full items-center gap-3 p-4 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{sku.brand} {sku.name}</span>
            <StateBadge state={live.state} size="sm" />
            {counted && <span className="text-[11px] font-medium text-emerald-700">✓ counted</span>}
          </div>
          <p className="mt-0.5 text-xs text-ink-mute">Expected {expected} · {num(live.monthly, 1)}/mo · {Number.isFinite(live.doc) ? `${num(live.doc)} days cover` : 'no sales'} · {live.valueAtRisk > 0 ? <b className="text-red-700">{inr(live.valueAtRisk)} at risk</b> : live.state === 'STOCKOUT_RISK' ? <b className="text-blue-700">stock-out in {num(live.doc)} days</b> : 'no expiry risk'}</p>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-100 p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-mute">Units counted (shelf + back room)</label>
              <div className="mt-1"><Stepper value={count} onChange={(n) => { setTouched(true); setCount(n); if (batches.length === 1) setBatches([{ ...batches[0], qty: n }]); }} label="units counted" /></div>
            </div>
            <Button variant="secondary" onClick={() => setScanOpen(true)}><ScanLine size={16} /> Scan barcode & batch</Button>
            <div className="text-xs text-ink-mute">Source: <b className="text-ink">{SOURCE_LABEL[touched ? source : p.source]}</b> <ConfidenceBadge band={live.confBand} /></div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-ink-mute">Batches (printed on every pack: batch code + expiry)</span>
              <button className="flex items-center gap-1 text-xs font-medium text-brand" onClick={() => { setTouched(true); setBatches((b) => [...b, { code: '', expiry: addDays(simDate, 365), qty: 0 }]); }}><Plus size={13} /> Add batch</button>
            </div>
            <div className="space-y-2">
              {batches.map((b, i) => {
                const be = live.batches.find((x) => x.code === b.code && x.expiry === b.expiry);
                return (
                  <div key={i} className="grid grid-cols-12 items-center gap-2">
                    <input aria-label="Batch code" value={b.code} onChange={(e) => setBatch(i, { code: e.target.value.toUpperCase() })} placeholder="B2502" className="col-span-3 h-9 rounded-lg border border-slate-300 px-2 text-sm" />
                    <input aria-label="Expiry date" type="date" value={b.expiry} onChange={(e) => setBatch(i, { expiry: e.target.value })} className="col-span-4 h-9 rounded-lg border border-slate-300 px-2 text-sm" />
                    <input aria-label="Batch quantity" inputMode="numeric" value={b.qty} onChange={(e) => setBatch(i, { qty: Math.max(0, Math.round(Number(e.target.value.replace(/\D/g, '')) || 0)) })} className="col-span-2 h-9 rounded-lg border border-slate-300 px-2 text-right text-sm" />
                    <span className="col-span-2 text-[11px] text-ink-mute">{be ? (be.unsold > 0.5 ? <b className="text-red-700">{num(be.unsold)} at risk</b> : `${be.daysToExpiry} d left`) : ''}</span>
                    <button aria-label="Remove batch" className="col-span-1 text-ink-mute hover:text-red-600" onClick={() => { setTouched(true); setBatches((bs) => bs.filter((_, j) => j !== i)); }}><Trash2 size={15} /></button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-ink-mute">What do you see? (simple signals)</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {SIGNALS.map((s) => (
                <button key={s.code} title={s.hint} onClick={() => toggleSignal(s.code)}
                  className={clsx('rounded-full px-2.5 py-1 text-xs ring-1 ring-inset', signals.includes(s.code) ? 'bg-ink text-white ring-ink' : 'bg-white text-ink-soft ring-slate-200 hover:bg-slate-50')}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className={clsx('rounded-xl p-3 text-sm', live.state === 'HEALTHY' ? 'bg-emerald-50' : live.state === 'STOCKOUT_RISK' ? 'bg-blue-50' : 'bg-red-50/70')}>
            <div className="flex items-center gap-2"><StateBadge state={live.state} /><span className="text-xs text-ink-mute">updates live as you type</span></div>
            <p className="mt-1 text-ink-soft">{live.headline}</p>
          </div>

          {errors.length > 0 && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-800">
              {errors.map((e) => <p key={e}>• {e}</p>)}
              {batchSum !== count && <button className="mt-1 font-semibold underline" onClick={fixDiff}>Put the difference in the oldest batch</button>}
            </div>
          )}
          {warnings.length > 0 && <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{warnings.map((w) => <p key={w} className="flex gap-1"><AlertTriangle size={12} className="mt-0.5 shrink-0" />{w}</p>)}</div>}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={`/rep/outlet/${p.nodeId}/sku/${p.skuId}`} className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"><Info size={14} /> Why flagged & what-if</Link>
            <Button onClick={save} disabled={errors.length > 0}>Save count</Button>
          </div>
        </div>
      )}

      <ScanSheet open={scanOpen} onClose={() => setScanOpen(false)} sku={sku} allSkus={SKUS}
        expectedBatch={[...p.batches].sort((a, b) => a.expiry.localeCompare(b.expiry))[0]}
        onScanned={(r) => {
          if (r.sku.id !== sku.id) { showToast(`Scanned ${r.sku.brand} ${r.sku.name}. That's a different SKU; open its row to count it.`, 'warn'); return; }
          setTouched(true); setSource('scan');
          if (r.batch && !batches.some((b) => b.code === r.batch!.code)) setBatches((bs) => [...bs, { ...r.batch!, qty: 0 }]);
          showToast(`Scan confirmed: batch ${r.batch?.code ?? ''} · EXP ${r.batch ? fmtDate(r.batch.expiry) : ''}`);
        }} />
    </div>
  );
}

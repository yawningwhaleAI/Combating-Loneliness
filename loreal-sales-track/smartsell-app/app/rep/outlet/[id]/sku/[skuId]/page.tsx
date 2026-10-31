'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BarChart2, Calculator, ShieldCheck } from 'lucide-react';
import { useEvals, useStore } from '@/store/useStore';
import { NODE_PARAMS, SOURCE_LABEL, SIGNALS } from '@/lib/params';
import { daysBetween, fmtDate } from '@/lib/dates';
import { inr, num } from '@/lib/format';
import { peerBenchmark } from '@/lib/views';
import { posId, OUTLET_BY_ID, SKU_BY_ID, DISTRIBUTOR_BY_ID } from '@/data/seed';
import { Card, Empty, Pill } from '@/components/ui';
import { ConfidenceBadge, StateBadge } from '@/components/StateBadge';
import { BatchTimeline } from '@/components/BatchTimeline';
import { WhatIfLab } from '@/components/WhatIfLab';
import { RecCard, StatusPill } from '@/components/RecCard';
import { useRecommender } from '@/components/useRecs';

export default function SkuDetail() {
  const { id, skuId } = useParams<{ id: string; skuId: string }>();
  const positions = useStore((s) => s.smart.positions);
  const actions = useStore((s) => s.actions);
  const simDate = useStore((s) => s.simDate);
  const evals = useEvals();
  const recommender = useRecommender();
  const p = positions[posId(id, skuId)];
  const sku = SKU_BY_ID[skuId];
  const nodeName = OUTLET_BY_ID[id]?.name ?? DISTRIBUTOR_BY_ID[id]?.name;
  if (!p || !sku) return <Empty title="SKU not found at this outlet"><Link className="text-brand underline" href={`/rep/outlet/${id}`}>Back</Link></Empty>;

  const e = evals[p.id];
  const cfg = NODE_PARAMS[p.nodeType];
  const recs = recommender.forPosition(p.id);
  const peers = peerBenchmark(p, positions, evals);
  const history = actions.filter((a) => a.positionId === p.id || a.transfer?.fromId === p.id || a.transfer?.toId === p.id);
  const age = daysBetween(p.countedAt, simDate);
  const backHref = p.nodeType === 'retailer' ? `/rep/outlet/${id}` : '/distributor';

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-ink-mute hover:text-ink"><ArrowLeft size={14} /> {nodeName}</Link>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-mute">{sku.division} · {sku.category} · {sku.tier}</p>
            <h1 className="text-xl font-bold">{sku.brand} {sku.name}</h1>
            <p className="text-sm text-ink-mute">at {nodeName} · EAN {sku.ean} · case pack {sku.casePack} · {inr(e.unitValue, false)}/unit</p>
          </div>
          <div className="flex flex-wrap items-center gap-2"><StateBadge state={e.state} /><ConfidenceBadge band={e.confBand} /></div>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Why it&apos;s flagged</p>
          <p className="mt-1 text-base leading-relaxed text-ink">{e.headline}</p>
          {e.chips.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{e.chips.map((c) => <Pill key={c}>{c}</Pill>)}</div>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Metric label="Stock on hand" value={`${num(e.qty)}`} sub={`${e.batches.length} batch${e.batches.length === 1 ? '' : 'es'}`} />
          <Metric label="Sell-out" value={`${num(e.monthly, 1)}/mo`} sub={e.monthly !== p.monthlySales ? `base ${p.monthlySales}, adjusted` : 'stock-flow estimate'} />
          <Metric label="Days of cover" value={Number.isFinite(e.doc) ? num(e.doc) : '∞'} sub={`norm ${cfg.targetCover} d · reorder ≤ ${e.rop} d`} />
          <Metric label="Projected unsold" value={num(e.unsold)} sub="units, FEFO" tone={e.unsold > 0.5 ? 'red' : undefined} />
          <Metric label="₹ at risk" value={inr(e.valueAtRisk)} sub={e.window !== null ? `${e.window} days to act` : '—'} tone={e.valueAtRisk > 0 ? 'red' : undefined} />
          <Metric label="Suggested order" value={`${e.suggestedOrder}`} sub={e.blocking ? 'paused: at-risk batch' : 'cover-based'} />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><BarChart2 size={18} className="text-brand" /> Batch-by-batch projection (FEFO)</h2>
          <BatchTimeline e={e} />
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-2 flex items-center gap-2 font-semibold"><Calculator size={18} className="text-brand" /> How we calculated it</h2>
          <ol className="space-y-1.5 text-sm text-ink-soft">
            <li>1. Velocity v = {num(e.monthly, 1)} ÷ 30 = <b>{num(e.v, 2)}/day</b>{e.monthly !== p.monthlySales && ' (adjusted for signals or active interventions)'}.</li>
            <li>2. Each batch can only sell until expiry − {cfg.msb} days (minimum sellable buffer at a {p.nodeType}).</li>
            {e.batches.map((b) => <li key={b.code} className="pl-3">• {b.code}: window {b.window} d → sells <b>{num(b.sold)}</b>, unsold <b className={b.unsold > 0.5 ? 'text-red-700' : ''}>{num(b.unsold)}</b></li>)}
            <li>3. ₹ at risk = {num(e.unsold)} × {inr(e.unitValue, false)} = <b>{inr(e.valueAtRisk, false)}</b></li>
            <li>4. Data confidence = {SOURCE_LABEL[p.source]} × recency ({age} days old) = <b>{num(e.confidence, 2)} ({e.confBand})</b></li>
            <li>5. Priority = ₹ at stake × urgency {num(e.urgency, 1)} × (0.5 + 0.5 × confidence) = <b>{inr(e.priority, false)}</b></li>
          </ol>
          <Link href="/method" className="mt-3 inline-block text-xs font-medium text-brand hover:underline">Full methodology & assumptions →</Link>
        </Card>
      </div>

      <WhatIfLab key={`${p.id}-${simDate}-${p.countedAt}-${p.monthlySales}`} p={p} />

      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><ShieldCheck size={18} className="text-brand" /> Recommended actions</h2>
        {recs.length === 0 ? <p className="text-sm text-ink-mute">Healthy. No action needed beyond the cover-based order.</p> : (
          <div className="space-y-2.5">{recs.map((r, i) => <RecCard key={r.key + i} rec={r} rank={i + 1} action={recommender.actionFor(r)} />)}</div>
        )}
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold">Context</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
            {peers && <li>Peer outlets ({peers.count}): median <b>{num(peers.median, 1)}/mo</b>, best <b>{num(peers.top, 1)}/mo</b>. This outlet: {num(e.monthly, 1)}/mo.</li>}
            <li>Last counted {fmtDate(p.countedAt)} via {SOURCE_LABEL[p.source]}.</li>
            <li>Signals: {p.signals.length ? p.signals.map((s) => SIGNALS.find((x) => x.code === s)?.label).join(', ') : 'none recorded'}.</li>
            {p.requestedQty !== undefined && <li>Retailer is asking for <b>{p.requestedQty}</b> more; habitual re-order is {p.habitQty}.</li>}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold">Action history</h3>
          {history.length === 0 ? <p className="mt-2 text-sm text-ink-mute">No actions yet.</p> : (
            <ul className="mt-2 space-y-2 text-sm">
              {history.map((a) => (
                <li key={a.id} className="rounded-lg border border-slate-100 p-2">
                  <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{a.title}</span><StatusPill status={a.status} /></div>
                  <ul className="mt-1 text-xs text-ink-mute">{a.log.map((l, i) => <li key={i}>{fmtDate(l.at)}: {l.text}</li>)}</ul>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'red' }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-mute">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold tabular-nums ${tone === 'red' ? 'text-red-700' : 'text-ink'}`}>{value}</p>
      {sub && <p className="text-[11px] text-ink-mute">{sub}</p>}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { Truck } from 'lucide-react';
import { useEvals, useStore } from '@/store/useStore';
import { computeKpis } from '@/lib/kpis';
import { daysBetween } from '@/lib/dates';
import { inr, num } from '@/lib/format';
import { distributorOf, nodeName } from '@/lib/recommend';
import { Button, Card, Empty, Pill, SectionTitle, Stat } from '@/components/ui';
import { StateBadge } from '@/components/StateBadge';
import { RecCard, StatusPill } from '@/components/RecCard';
import { useRecommender } from '@/components/useRecs';
import { DISTRIBUTORS, DISTRIBUTOR_BY_ID, SKU_BY_ID } from '@/data/seed';

const BUCKETS = [
  { id: '>12m', min: 365, color: '#059669' },
  { id: '6–12m', min: 180, color: '#84cc16' },
  { id: '3–6m', min: 90, color: '#f59e0b' },
  { id: '<3m', min: -9999, color: '#dc2626' },
];

export default function DistributorView() {
  const distributorId = useStore((s) => s.distributorId);
  const setDistributor = useStore((s) => s.setDistributor);
  const positions = useStore((s) => s.smart.positions);
  const actions = useStore((s) => s.actions);
  const simDate = useStore((s) => s.simDate);
  const executeNow = useStore((s) => s.executeNow);
  const evals = useEvals();
  const recommender = useRecommender();
  const dist = DISTRIBUTOR_BY_ID[distributorId];

  const own = useMemo(() => Object.values(positions).filter((p) => p.nodeId === distributorId).sort((a, b) => evals[b.id].priority - evals[a.id].priority || evals[b.id].qty * evals[b.id].unitValue - evals[a.id].qty * evals[a.id].unitValue), [positions, distributorId, evals]);
  const k = computeKpis(positions, evals, (p) => p.nodeId === distributorId);
  const buckets = BUCKETS.map((b, i) => ({ name: b.id, color: b.color, value: Math.round(own.reduce((s, p) => s + p.batches.filter((x) => { const d = daysBetween(simDate, x.expiry); return d >= b.min && (i === 0 || d < BUCKETS[i - 1].min); }).reduce((t, x) => t + x.qty, 0) * SKU_BY_ID[p.skuId].distPrice, 0)) }));
  const tasks = actions.filter((a) => a.transfer && a.owner === 'distributor' && [a.transfer.fromId, a.transfer.toId].some((id) => positions[id] && distributorOf(positions[id]) === distributorId) && a.status !== 'rejected');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1 text-sm text-ink-mute"><Truck size={14} /> Distributor view (read and confirm; no extra data entry)</p>
          <h1 className="text-2xl font-bold">{dist.name}</h1>
          <p className="text-sm text-ink-mute">{dist.area} · serves the {nodeName(dist.territoryId)} beat and ~150 other outlets (modelled as network demand)</p>
        </div>
        <select aria-label="Distributor" value={distributorId} onChange={(e) => setDistributor(e.target.value)} className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm">
          {DISTRIBUTORS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Godown stock value" value={inr(k.stockValue)} />
        <Stat label="₹ at risk (old batches)" value={inr(k.atRisk)} tone="red" sub="won't sell before 120-day buffer" />
        <Stat label="Stock-out risks" value={k.stockouts} tone="blue" />
        <Stat label="Transfer tasks" value={tasks.filter((t) => t.status === 'in_progress').length} sub={`${tasks.filter((t) => t.status === 'awaiting_approval').length} awaiting ASM`} tone="amber" />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle title="Monthly ageing review" sub="Stock value by remaining shelf life" />
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="name" /><YAxis tickFormatter={(v) => inr(v)} width={70} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => inr(v, false)} />
                <Bar dataKey="value">{buckets.map((b) => <Cell key={b.name} fill={b.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-ink-mute">Totals hide old batches: a SKU can show &quot;210 days of cover&quot; while one batch is about to become unsellable. Hair Colour Burgundy at Western Suburbs is the example.</p>
        </Card>
        <Card className="p-5 lg:col-span-3">
          <SectionTitle title="Transfer tasks" sub="Rebalancing requests to execute (pick, deliver, issue credit note)" />
          {tasks.length === 0 ? <Empty title="No transfer tasks">They appear when a rep accepts a transfer involving this distributor&apos;s outlets.</Empty> : (
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{t.title}</span><StatusPill status={t.status} />
                  </div>
                  <p className="text-xs text-ink-mute">{SKU_BY_ID[positions[t.positionId]?.skuId]?.name} · from {nodeName(positions[t.transfer!.fromId]?.nodeId)} → {nodeName(positions[t.transfer!.toId]?.nodeId)}</p>
                  {t.status === 'in_progress' && <Button className="mt-2" size="sm" variant="success" onClick={() => executeNow(t.id)}>Mark picked & delivered</Button>}
                  {t.status === 'awaiting_approval' && <p className="mt-1 text-xs text-amber-700">Waiting for ASM approval before dispatch.</p>}
                  {t.outcome && <p className="mt-1 text-xs text-emerald-700">{t.outcome.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle title="Return claims & evidence" sub="Disputes over claims usually come down to evidence. SMARTSELL attaches batch, quantity, reason and date to every return automatically." />
        {(() => {
          const claims = actions.filter((a) => (a.code === 'RETURN' || a.code === 'END_OF_LIFE') && positions[a.positionId] && distributorOf(positions[a.positionId]) === distributorId);
          return claims.length === 0 ? <p className="text-sm text-ink-mute">No returns raised. With SMARTSELL, most at-risk stock is moved or sold before it needs one.</p> : (
            <ul className="space-y-2 text-sm">{claims.map((c) => <li key={c.id} className="rounded-xl border border-slate-200 p-3"><div className="flex flex-wrap justify-between gap-2"><span className="font-medium">{c.title} · {nodeName(positions[c.positionId].nodeId)}</span><StatusPill status={c.status} /></div><p className="text-xs text-ink-mute">{c.outcome?.note ?? 'Evidence will be attached on execution (batch codes, quantity, reason code, date, photo).'}</p></li>)}</ul>
          );
        })()}
      </Card>

      <Card className="p-5">
        <SectionTitle title="Godown positions & suggested primary order" sub="Requested vs suggested primary order from L'Oréal, by SKU" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-mute">
              <tr><th className="px-3 py-2">SKU</th><th className="px-3 py-2">State</th><th className="px-3 py-2 text-right">Stock</th><th className="px-3 py-2 text-right">Cover</th><th className="px-3 py-2 text-right">Oldest batch left</th><th className="px-3 py-2 text-right">₹ at risk</th><th className="px-3 py-2 text-right">Requested</th><th className="px-3 py-2 text-right">Suggested</th></tr>
            </thead>
            <tbody>
              {own.map((p) => {
                const e = evals[p.id];
                const oldest = e.batches[0];
                return (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{SKU_BY_ID[p.skuId].brand} {SKU_BY_ID[p.skuId].name}</td>
                    <td className="px-3 py-2"><StateBadge state={e.state} size="sm" />{(() => { const n = Object.values(positions).filter((q) => q.nodeType === 'retailer' && q.skuId === p.skuId && distributorOf(q) === distributorId && evals[q.id].shift.active).length; return n ? <Pill className="ml-1 bg-violet-50 text-violet-700">{n} outlet{n > 1 ? 's' : ''} shifting to q-comm</Pill> : null; })()}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{num(e.qty)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{Number.isFinite(e.doc) ? `${num(e.doc)} d` : '∞'}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{oldest ? `${oldest.daysToExpiry} d` : '—'}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{e.valueAtRisk > 0 ? inr(e.valueAtRisk) : '—'}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{p.requestedQty ?? '—'}</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums text-brand">{e.suggestedOrder}{e.blocking && <Pill className="ml-1 bg-red-50 text-red-700">hold</Pill>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {own.filter((p) => evals[p.id].state !== 'HEALTHY').map((p) => {
        const recs = recommender.forPosition(p.id);
        if (!recs.length) return null;
        return (
          <Card key={p.id} className="p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2"><span className="font-semibold">{SKU_BY_ID[p.skuId].brand} {SKU_BY_ID[p.skuId].name}</span><StateBadge state={evals[p.id].state} size="sm" /></div>
            <p className="mb-3 text-sm text-ink-soft">{evals[p.id].headline}</p>
            <div className="space-y-2.5">{recs.slice(0, 3).map((r, i) => <RecCard key={r.key + i} rec={r} rank={i + 1} action={recommender.actionFor(r)} />)}</div>
          </Card>
        );
      })}
      <p className="text-xs text-ink-mute">Want the outlet view? <Link className="underline" href="/rep">Switch to the rep</Link>.</p>
    </div>
  );
}

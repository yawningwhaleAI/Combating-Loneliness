'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertOctagon, Megaphone } from 'lucide-react';
import { useEvals, useStore } from '@/store/useStore';
import { actionStats, computeKpis, territoryOf } from '@/lib/kpis';
import { inr, num, pct } from '@/lib/format';
import { nodeName } from '@/lib/recommend';
import { Button, Card, LinkButton, Pill, SectionTitle, Stat } from '@/components/ui';
import { STATE_META, StateBadge } from '@/components/StateBadge';
import { SKU_BY_ID, TERRITORIES, REP_BY_ID } from '@/data/seed';
import type { RiskState, Tier } from '@/lib/types';

export default function ManagerHome() {
  const positions = useStore((s) => s.smart.positions);
  const actions = useStore((s) => s.actions);
  const history = useStore((s) => s.history);
  const notifyBrand = useStore((s) => s.notifyBrand);
  const evals = useEvals();
  const [terr, setTerr] = useState<string>('ALL');
  const [state, setState] = useState<RiskState | 'FLAGGED'>('FLAGGED');
  const [tier, setTier] = useState<Tier | 'ALL'>('ALL');
  const [node, setNode] = useState<'ALL' | 'retailer' | 'distributor'>('ALL');

  const inTerr = (p: Parameters<typeof territoryOf>[0]) => terr === 'ALL' || territoryOf(p) === terr;
  const k = useMemo(() => computeKpis(positions, evals, (p) => inTerr(p)), [positions, evals, terr]); // eslint-disable-line react-hooks/exhaustive-deps
  const st = actionStats(actions, (a) => terr === 'ALL' || (positions[a.positionId] && territoryOf(positions[a.positionId]) === terr));

  const byTerritory = TERRITORIES.map((t) => {
    const kk = computeKpis(positions, evals, (p) => territoryOf(p) === t.id);
    return { name: t.name, 'Retail ₹ at risk': Math.round(kk.atRiskRetail), 'Distributor ₹ at risk': Math.round(kk.atRiskDist), 'Sales at stake (OOS)': Math.round(kk.lostSalesRisk) };
  });
  const trend = history.map((h) => ({ day: h.day, label: h.day < 0 ? `D${h.day}` : `D+${h.day}`, 'Pre-pilot (synthetic)': h.synthetic || h.day === 0 ? Math.round(h.atRisk) : undefined, 'With SMARTSELL': h.day >= 0 ? Math.round(h.atRisk) : undefined }));

  const rows = useMemo(() => Object.values(positions)
    .filter((p) => inTerr(p))
    .filter((p) => (node === 'ALL' ? true : p.nodeType === node))
    .filter((p) => (tier === 'ALL' ? true : SKU_BY_ID[p.skuId].tier === tier))
    .filter((p) => (state === 'FLAGGED' ? evals[p.id].state !== 'HEALTHY' : evals[p.id].state === state))
    .sort((a, b) => evals[b.id].priority - evals[a.id].priority || evals[b.id].rsAtStake - evals[a.id].rsAtStake), [positions, evals, terr, state, tier, node]); // eslint-disable-line react-hooks/exhaustive-deps

  const repeat = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const p of Object.values(positions)) {
      if (p.nodeType !== 'retailer') continue;
      const s = evals[p.id].state;
      if (s === 'HEALTHY' || s === 'STOCKOUT_RISK') continue;
      (m[p.skuId] ??= []).push(p.nodeId);
    }
    return Object.entries(m).filter(([, v]) => v.length >= 3).sort((a, b) => b[1].length - a[1].length);
  }, [positions, evals]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-ink-mute">Meera · Area Sales Manager, Mumbai</p>
          <h1 className="text-2xl font-bold">Territory overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <select value={terr} onChange={(e) => setTerr(e.target.value)} className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm" aria-label="Territory filter">
            <option value="ALL">All territories</option>
            {TERRITORIES.map((t) => <option key={t.id} value={t.id}>{t.name} ({REP_BY_ID[t.repId].name})</option>)}
          </select>
          {st.awaiting > 0 && <LinkButton href="/manager/approvals">Approvals ({st.awaiting})</LinkButton>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="₹ at risk" value={inr(k.atRisk)} sub={`retail ${inr(k.atRiskRetail)} · dist ${inr(k.atRiskDist)}`} tone="red" />
        <Stat label="Near-expiry % of stock" value={pct(k.nearExpiryPct)} sub={`${k.byState.NEAR_EXPIRY} SKU-locations`} tone="red" />
        <Stat label="Stock-out risks" value={k.stockouts} sub={`${inr(k.lostSalesRisk)} sales at stake`} tone="blue" />
        <Stat label="Slow stock (cash tied)" value={inr(k.overstockValue)} sub={`${k.byState.OVERSTOCK + k.byState.DORMANT} SKU-locations`} tone="amber" />
        <Stat label="Action completion" value={`${Math.round(st.completionRate * 100)}%`} sub={`${st.completed}/${st.accepted} · ${st.awaiting} awaiting`} />
        <Stat label="₹ rescued (verified)" value={inr(st.rescued)} sub={`+ ${inr(st.avoided)} new risk avoided`} tone="green" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="₹ at risk over time" sub="Synthetic pre-pilot trend, then live simulation (use Fast-forward)" />
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ left: 8, right: 8, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => inr(v)} tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={(v: number) => inr(v, false)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line isAnimationActive={false} dataKey="Pre-pilot (synthetic)" stroke="#94a3b8" strokeDasharray="5 4" dot={false} connectNulls />
                <Line isAnimationActive={false} dataKey="With SMARTSELL" stroke="#3b2f8f" strokeWidth={2.5} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Where the risk sits" sub="By territory: expiry risk at outlets and distributors, plus sales at stake from stock-outs" />
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={byTerritory} margin={{ left: 8, right: 8, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => inr(v)} tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={(v: number) => inr(v, false)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Retail ₹ at risk" stackId="a" fill="#dc2626" />
                <Bar dataKey="Distributor ₹ at risk" stackId="a" fill="#f97316" />
                <Bar dataKey="Sales at stake (OOS)" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {repeat.length > 0 && (
        <Card className="p-5">
          <SectionTitle title={<span className="flex items-center gap-2"><AlertOctagon size={18} className="text-orange-600" /> Repeat offenders</span>} sub="Same SKU slow in 3+ outlets: probably a range or shade issue, not an execution issue" />
          <div className="space-y-2">
            {repeat.map(([skuId, outlets]) => {
              const sku = SKU_BY_ID[skuId];
              const done = actions.some((a) => a.recKey === `brand::${skuId}`);
              return (
                <div key={skuId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="font-medium">{sku.brand} {sku.name}</p>
                    <p className="text-xs text-ink-mute">Slow or ageing at {outlets.map((o) => nodeName(o)).join(', ')}</p>
                  </div>
                  <Button size="sm" variant={done ? 'secondary' : 'primary'} disabled={done} onClick={() => notifyBrand(skuId, outlets.length)}><Megaphone size={14} /> {done ? 'Escalated to brand team' : 'Escalate to brand & demand planning'}</Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <SectionTitle title="Risk register" sub={`${rows.length} SKU-locations · ranked by priority (₹ at stake × urgency × data confidence)`}
          right={
            <div className="flex flex-wrap gap-2 text-sm">
              <select value={state} onChange={(e) => setState(e.target.value as RiskState | 'FLAGGED')} className="h-8 rounded-lg border border-slate-300 bg-white px-2" aria-label="State filter">
                <option value="FLAGGED">All flagged</option>
                {(Object.keys(STATE_META) as RiskState[]).map((s) => <option key={s} value={s}>{STATE_META[s].label}</option>)}
              </select>
              <select value={tier} onChange={(e) => setTier(e.target.value as Tier | 'ALL')} className="h-8 rounded-lg border border-slate-300 bg-white px-2" aria-label="Tier filter">
                <option value="ALL">All tiers</option><option value="MASS">Mass</option><option value="PRO">Professional</option><option value="DERMA">Derma</option><option value="LUXE">Luxe</option>
              </select>
              <select value={node} onChange={(e) => setNode(e.target.value as 'ALL' | 'retailer' | 'distributor')} className="h-8 rounded-lg border border-slate-300 bg-white px-2" aria-label="Node filter">
                <option value="ALL">Outlets + distributors</option><option value="retailer">Outlets only</option><option value="distributor">Distributors only</option>
              </select>
            </div>
          } />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-mute">
              <tr><th className="px-3 py-2">Location</th><th className="px-3 py-2">SKU</th><th className="px-3 py-2">State</th><th className="px-3 py-2 text-right">Stock</th><th className="px-3 py-2 text-right">Cover</th><th className="px-3 py-2 text-right">₹ at stake</th><th className="px-3 py-2 text-right">Days to act</th><th className="px-3 py-2">Data</th><th className="px-3 py-2">Action</th></tr>
            </thead>
            <tbody>
              {rows.slice(0, 40).map((p) => {
                const e = evals[p.id];
                const sku = SKU_BY_ID[p.skuId];
                const act = [...actions].reverse().find((a) => a.positionId === p.id || a.transfer?.fromId === p.id);
                const href = p.nodeType === 'retailer' ? `/rep/outlet/${p.nodeId}/sku/${p.skuId}` : '/distributor';
                return (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2"><Link className="hover:text-brand" href={href}>{nodeName(p.nodeId)}</Link>{p.nodeType === 'distributor' && <Pill className="ml-1 bg-slate-100">dist.</Pill>}</td>
                    <td className="px-3 py-2">{sku.brand} {sku.name}</td>
                    <td className="px-3 py-2"><StateBadge state={e.state} size="sm" /></td>
                    <td className="px-3 py-2 text-right tabular-nums">{num(e.qty)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{Number.isFinite(e.doc) ? `${num(e.doc)} d` : '∞'}</td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums">{inr(e.rsAtStake)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{e.window ?? '—'}</td>
                    <td className="px-3 py-2 text-xs">{e.confBand}</td>
                    <td className="px-3 py-2 text-xs">{act ? <span className="text-emerald-700">{act.status.replace('_', ' ')}</span> : <span className="text-ink-mute">none yet</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

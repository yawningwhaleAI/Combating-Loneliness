'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useEvals, useStore } from '@/store/useStore';
import { actionStats, computeKpis, territoryOf } from '@/lib/kpis';
import { inr, pct } from '@/lib/format';
import { Card, SectionTitle } from '@/components/ui';
import { REPS, REP_TARGET_ATTAINMENT, TERRITORY_BY_ID } from '@/data/seed';

export default function Team() {
  const positions = useStore((s) => s.smart.positions);
  const actions = useStore((s) => s.actions);
  const visits = useStore((s) => s.visits);
  const evals = useEvals();

  const rows = REPS.map((r) => {
    const k = computeKpis(positions, evals, (p) => p.nodeType === 'retailer' && territoryOf(p) === r.territoryId);
    const st = actionStats(actions, (a) => a.createdBy === r.id);
    const retailCount = Object.values(positions).filter((p) => p.nodeType === 'retailer' && territoryOf(p) === r.territoryId).length;
    const sec = Math.min(100, REP_TARGET_ATTAINMENT[r.id] * 100);
    const health = Math.max(0, 100 - (k.atRiskRetail / Math.max(1, k.stockValue)) * 400);
    const avail = Math.max(0, 100 - (k.stockouts / Math.max(1, retailCount)) * 400);
    const exec = st.accepted ? st.completionRate * 100 : 50;
    const composite = 0.5 * sec + 0.2 * health + 0.15 * avail + 0.15 * exec;
    return { r, k, st, sec, health, avail, exec, composite, visits: visits.filter((v) => v.repId === r.id).length };
  });

  return (
    <div className="space-y-5">
      <SectionTitle title="Healthy Sales Scorecard" sub="Growth stays 50% of the score; sell-through health, availability and execution make up the rest. Pilot this as a shadow (unpaid) scorecard first." />
      <Card className="p-5">
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={rows.map((x) => ({ name: x.r.name, 'Secondary vs target': Math.round(x.sec), 'Sell-through health': Math.round(x.health), Availability: Math.round(x.avail), Execution: Math.round(x.exec) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Secondary vs target" fill="#3b2f8f" /><Bar dataKey="Sell-through health" fill="#059669" /><Bar dataKey="Availability" fill="#2563eb" /><Bar dataKey="Execution" fill="#b8902f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-mute">
            <tr><th className="px-3 py-2">Rep</th><th className="px-3 py-2 text-right">Secondary vs target (50%)</th><th className="px-3 py-2 text-right">Sell-through health (20%)</th><th className="px-3 py-2 text-right">Availability (15%)</th><th className="px-3 py-2 text-right">Execution (15%)</th><th className="px-3 py-2 text-right">Composite</th><th className="px-3 py-2 text-right">₹ at risk</th><th className="px-3 py-2 text-right">₹ rescued</th><th className="px-3 py-2 text-right">Visits</th></tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.r.id} className="border-t border-slate-100">
                <td className="px-3 py-2"><b>{x.r.name}</b><div className="text-xs text-ink-mute">{TERRITORY_BY_ID[x.r.territoryId].name}</div></td>
                <td className="px-3 py-2 text-right tabular-nums">{Math.round(x.sec)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{Math.round(x.health)} <span className="text-xs text-ink-mute">({pct(x.k.nearExpiryPct)} near-expiry)</span></td>
                <td className="px-3 py-2 text-right tabular-nums">{Math.round(x.avail)} <span className="text-xs text-ink-mute">({x.k.stockouts} OOS risks)</span></td>
                <td className="px-3 py-2 text-right tabular-nums">{Math.round(x.exec)} <span className="text-xs text-ink-mute">({x.st.completed}/{x.st.accepted})</span></td>
                <td className="px-3 py-2 text-right text-lg font-semibold tabular-nums text-brand">{Math.round(x.composite)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{inr(x.k.atRiskRetail)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-emerald-700">{inr(x.st.rescued)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{x.visits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-mute">Secondary-vs-target attainment is synthetic. Health, availability and execution are computed live from the simulated territory. Weights are assumptions to agree with L&apos;Oréal sales leadership.</p>
    </div>
  );
}

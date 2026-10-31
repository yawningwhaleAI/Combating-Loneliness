'use client';

import { useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FastForward, Leaf, Package, ShoppingCart, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { actionStats } from '@/lib/kpis';
import { PACKAGING_KG_PER_UNIT } from '@/lib/params';
import { inr, num } from '@/lib/format';
import { Button, Card, Empty, SectionTitle, Stat } from '@/components/ui';

export default function Outcomes() {
  const simDay = useStore((s) => s.simDay);
  const smart = useStore((s) => s.smart.counters);
  const bau = useStore((s) => s.bau.counters);
  const history = useStore((s) => s.history);
  const actions = useStore((s) => s.actions);
  const advance = useStore((s) => s.advance);
  const markGuide = useStore((s) => s.markGuide);
  useEffect(() => { markGuide('outcomes'); }, [markGuide]);

  const st = actionStats(actions.filter((a) => !a.synthetic));
  const live = history.filter((h) => h.day >= 0);
  const wasteAvoided = Math.max(0, bau.expiredValue - smart.expiredValue);
  const lostAvoided = Math.max(0, bau.lostValue - smart.lostValue);
  const unitsSaved = Math.max(0, bau.expiredUnits - smart.expiredUnits);
  const byCode = Object.entries(actions.filter((a) => a.outcome && !a.synthetic).reduce<Record<string, number>>((m, a) => { m[a.code] = (m[a.code] ?? 0) + (a.outcome?.rsRescued ?? 0) + (a.outcome?.riskAvoided ?? 0); return m; }, {}))
    .map(([code, v]) => ({ code: code.replace('_', ' ').toLowerCase(), value: Math.round(v) }));
  const funnel = [
    { stage: 'Accepted', n: st.accepted },
    { stage: 'Completed', n: st.completed },
    { stage: 'Verified', n: actions.filter((a) => a.status === 'verified' && !a.synthetic).length },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Outcomes: SMARTSELL vs business-as-usual" sub={`Same starting stock, simulated side by side. Day ${simDay} of the pilot.`}
        right={<div className="flex gap-2"><Button variant="secondary" onClick={() => advance(14)}><FastForward size={15} /> +14 days</Button><Button onClick={() => advance(91)}><FastForward size={15} /> +1 quarter</Button></div>} />

      {simDay === 0 ? (
        <Empty title="No simulated time has passed yet">
          Accept some actions as the rep, approve them as the manager, then fast-forward (try <b>+1 quarter</b>). Both worlds play out: SMARTSELL (guardrail orders, transfers, interventions) and business-as-usual (&quot;same as last time&quot; re-orders, no rebalancing).
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Returned / expired stock" value={inr(smart.expiredValue)} sub={`vs ${inr(bau.expiredValue)} business-as-usual`} tone="red" icon={<Trash2 size={14} />} />
            <Stat label="Lost sales from stock-outs" value={inr(smart.lostValue)} sub={`vs ${inr(bau.lostValue)} business-as-usual`} tone="blue" icon={<ShoppingCart size={14} />} />
            <Stat label="Waste avoided" value={inr(wasteAvoided)} sub={`${num(unitsSaved)} units not destroyed`} tone="green" icon={<Leaf size={14} />} />
            <Stat label="Sales protected" value={inr(lostAvoided)} sub="fewer empty shelves" tone="green" icon={<Package size={14} />} />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <SectionTitle title="Cumulative waste and lost sales" sub="Lower is better" />
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={live.map((h) => ({ day: `D+${h.day}`, 'Expired · SMARTSELL': Math.round(h.smartExpired ?? 0), 'Expired · BAU': Math.round(h.bauExpired ?? 0), 'Lost sales · SMARTSELL': Math.round(h.smartLost ?? 0), 'Lost sales · BAU': Math.round(h.bauLost ?? 0) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="day" tick={{ fontSize: 11 }} /><YAxis tickFormatter={(v) => inr(v)} width={70} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => inr(v, false)} /><Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line isAnimationActive={false} dataKey="Expired · SMARTSELL" stroke="#dc2626" strokeWidth={2.5} /><Line isAnimationActive={false} dataKey="Expired · BAU" stroke="#dc2626" strokeDasharray="5 4" />
                    <Line isAnimationActive={false} dataKey="Lost sales · SMARTSELL" stroke="#2563eb" strokeWidth={2.5} /><Line isAnimationActive={false} dataKey="Lost sales · BAU" stroke="#2563eb" strokeDasharray="5 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-5">
              <SectionTitle title="Value by intervention type" sub="₹ rescued + new risk avoided (some uplift effects are estimates)" />
              {byCode.length === 0 ? <p className="text-sm text-ink-mute">No completed actions yet.</p> : (
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={byCode} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis type="number" tickFormatter={(v) => inr(v)} tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="code" tick={{ fontSize: 11 }} width={110} />
                      <Tooltip formatter={(v: number) => inr(v, false)} /><Bar isAnimationActive={false} dataKey="value" fill="#059669" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Card className="p-5">
              <h3 className="font-semibold">Execution funnel</h3>
              <div className="mt-3 space-y-2">{funnel.map((f) => <div key={f.stage}><div className="flex justify-between text-sm"><span>{f.stage}</span><b>{f.n}</b></div><div className="mt-1 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-brand" style={{ width: `${funnel[0].n ? (f.n / funnel[0].n) * 100 : 0}%` }} /></div></div>)}</div>
            </Card>
            <Card className="p-5">
              <h3 className="flex items-center gap-2 font-semibold"><Leaf size={16} className="text-emerald-600" /> Sustainability (illustrative)</h3>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                <li>Units saved from destruction: <b>{num(unitsSaved)}</b></li>
                <li>Packaging not wasted: <b>{num(unitsSaved * PACKAGING_KG_PER_UNIT, 1)} kg</b> <span className="text-xs">(at 40 g/unit, assumed)</span></li>
                <li>Units rebalanced instead of reverse-shipped: <b>{num(st.unitsMoved)}</b></li>
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold">Revenue from recovered inventory</h3>
              <p className="mt-2 text-2xl font-semibold text-emerald-700">{inr(st.rescued)}</p>
              <p className="text-sm text-ink-mute">Verified value of stock that sold instead of expiring, plus {inr(st.avoided)} of new risk avoided through the order guardrail.</p>
            </Card>
          </div>
          <p className="text-xs text-ink-mute">Simulation assumptions: constant sell-out per SKU-outlet, 7-day replenishment lead time, intervention uplifts from the parameter file (visibility +20%, sampling +35%, bundle +50%, scheme +80%). Orders are placed on a fortnightly beat. Stock is returned when it crosses its sell-by buffer (30 days before expiry at outlets, 120 at distributors). Business-as-usual re-orders the retailer&apos;s habitual quantity when cover drops below 21 days and applies their current ask, including scheme loading. These are illustrative, synthetic results, not forecasts.</p>
        </>
      )}
    </div>
  );
}

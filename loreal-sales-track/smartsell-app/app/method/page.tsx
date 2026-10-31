'use client';

import { useMemo, useState } from 'react';
import { evaluate } from '@/lib/engine';
import { NODE_PARAMS, SOURCE_LABEL, SOURCE_WEIGHT, UPLIFT } from '@/lib/params';
import { addDays } from '@/lib/dates';
import { inr, num } from '@/lib/format';
import { Card, SectionTitle } from '@/components/ui';
import { StateBadge } from '@/components/StateBadge';
import { BatchTimeline } from '@/components/BatchTimeline';
import { useStore } from '@/store/useStore';
import { SKU_BY_ID } from '@/data/seed';
import type { Position, Source } from '@/lib/types';

const LADDER = [
  ['L0', 'Verify / diagnose', 'Rep time', 'None'], ['L1', 'Rotate & re-place (FEFO, eye level)', '₹0', 'None'],
  ['L2', 'Order guardrail (pause / cap this SKU)', '₹0, protects cash', 'Low'], ['L3', 'Rebalance to a faster authorised outlet', '~3% logistics', 'None'],
  ['L4', 'Activate demand (tester, sampling, advisor day)', 'Sampling budget', 'Positive'], ['L5', 'Approved bundle', 'Bundle cost', 'Low–medium'],
  ['L6', 'Time-boxed approved scheme (mass only)', 'Trade spend', 'Medium–high'], ['L7', 'Controlled end-of-life before expiry', '~50% margin', 'Controlled'],
  ['L8', 'Return and record the root cause', 'Full loss + handling', '—'],
];

export default function Method() {
  const simDate = useStore((s) => s.simDate);
  const [qty, setQty] = useState(120);
  const [monthly, setMonthly] = useState(20);
  const [dte, setDte] = useState(105);
  const [value, setValue] = useState(210);
  const [source, setSource] = useState<Source>('manual_count');
  const [node, setNode] = useState<'retailer' | 'distributor'>('retailer');
  const e = useMemo(() => {
    const p: Position = { id: 'calc', nodeId: 'calc', nodeType: node, skuId: 'lumea-shampoo', batches: [{ code: 'B-CALC', expiry: addDays(simDate, dte), qty }], monthlySales: monthly, source, countedAt: simDate, signals: [], habitQty: 6 };
    return evaluate(p, { ...SKU_BY_ID['lumea-shampoo'], ptr: value, distPrice: value }, simDate);
  }, [qty, monthly, dte, value, source, node, simDate]);
  const cfg = NODE_PARAMS[node];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SectionTitle title="How SMARTSELL decides" sub="Transparent rules, not a black-box AI score. Every number can be traced to its inputs. All parameters are assumptions to calibrate in a pilot." />

      <Card className="p-5">
        <h2 className="font-semibold">Try the calculator</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">{(['retailer', 'distributor'] as const).map((n) => <button key={n} onClick={() => setNode(n)} className={`rounded-lg px-3 py-1.5 ${node === n ? 'bg-brand text-white' : 'bg-slate-100'}`}>{n}</button>)}</div>
            <Range label="Units in stock" v={qty} set={setQty} min={0} max={600} />
            <Range label="Monthly sell-out" v={monthly} set={setMonthly} min={0} max={150} />
            <Range label="Days to expiry" v={dte} set={setDte} min={0} max={900} step={5} />
            <Range label="Unit value (₹)" v={value} set={setValue} min={50} max={2000} step={10} />
            <label className="block">Data source
              <select value={source} onChange={(ev) => setSource(ev.target.value as Source)} className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-2">
                {(Object.keys(SOURCE_WEIGHT) as Source[]).map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]} (weight {SOURCE_WEIGHT[s]})</option>)}
              </select>
            </label>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2"><StateBadge state={e.state} /><span className="text-sm text-ink-mute">confidence {num(e.confidence, 2)} ({e.confBand})</span></div>
            <p className="text-sm text-ink-soft">{e.headline}</p>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-red-50 p-2"><div className="text-lg font-semibold text-red-700">{inr(e.valueAtRisk)}</div><div className="text-[11px] text-ink-mute">₹ at risk</div></div>
              <div className="rounded-xl bg-slate-50 p-2"><div className="text-lg font-semibold">{e.window ?? '—'}</div><div className="text-[11px] text-ink-mute">days to act</div></div>
              <div className="rounded-xl bg-slate-50 p-2"><div className="text-lg font-semibold">{Number.isFinite(e.doc) ? num(e.doc) : '∞'}</div><div className="text-[11px] text-ink-mute">days of cover</div></div>
            </div>
            <BatchTimeline e={e} />
          </div>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-5 text-sm">
          <h2 className="font-semibold">1. Core calculations</h2>
          <ul className="mt-2 space-y-2 text-ink-soft">
            <li><b>Velocity</b> v = monthly sell-out ÷ 30. At outlets without POS, sell-out comes from <b>stock-flow</b>: last count + deliveries − today&apos;s count.</li>
            <li><b>Days of cover</b> = stock ÷ v.</li>
            <li><b>FEFO projected unsold</b>: batches sell oldest-first, and each can only sell until <i>expiry − minimum sellable buffer</i> ({NODE_PARAMS.retailer.msb} days at an outlet, {NODE_PARAMS.distributor.msb} at a distributor). Units left over are projected unsold.</li>
            <li><b>₹ at risk</b> = projected unsold × unit value. <b>Days to act</b> = days until the first at-risk batch hits its buffer.</li>
            <li><b>Stock-out risk</b> when cover ≤ lead {cfg.lead} + safety {cfg.safety} days. <b>Suggested order</b> = v × (target {cfg.targetCover} + lead) − sellable stock, rounded to case packs; 0 if a batch is at risk.</li>
            <li><b>Confidence</b> = source weight × recency (≤7 d: 1.0, ≤30 d: 0.8, older: 0.5). Low confidence locks costly actions until verified.</li>
            <li><b>Priority</b> = ₹ at stake × urgency (≤30 d: 1.0 · ≤60: 0.8 · ≤90: 0.6 · ≤180: 0.4) × (0.5 + 0.5 × confidence).</li>
          </ul>
        </Card>
        <Card className="p-5 text-sm">
          <h2 className="font-semibold">2. States (first match wins)</h2>
          <ul className="mt-2 space-y-2">
            <li className="flex gap-2"><StateBadge state="NEAR_EXPIRY" size="sm" /> projected unsold &gt; 0 and ≤ 90 days to act → <i>speed</i>: stop feeding, transfer, bundle, end-of-life</li>
            <li className="flex gap-2"><StateBadge state="DORMANT" size="sm" /> no sales with stock on hand → verify and diagnose</li>
            <li className="flex gap-2"><StateBadge state="AGEING_RISK" size="sm" /> projected unsold, &gt; 90 days to act → fix demand while options are cheap</li>
            <li className="flex gap-2"><StateBadge state="STOCKOUT_RISK" size="sm" /> cover ≤ reorder point → source from surplus first, then replenish</li>
            <li className="flex gap-2"><StateBadge state="OVERSTOCK" size="sm" /> cover &gt; 2× norm but sells before expiry → <i>diagnose</i>, don&apos;t discount</li>
            <li className="flex gap-2"><StateBadge state="HEALTHY" size="sm" /> otherwise</li>
          </ul>
          <p className="mt-3 text-ink-soft"><b>Transfer rule:</b> never send more than the recipient can sell before <i>its</i> buffer date (velocity × days left − its own older stock). That way waste is never pushed downstream.</p>
        </Card>
      </div>

      <Card className="p-5 text-sm">
        <h2 className="font-semibold">3. The intervention ladder (cheapest, least brand-risky first)</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead className="text-left text-xs uppercase text-ink-mute"><tr><th className="py-1">Level</th><th>Action</th><th>Typical cost</th><th>Brand risk</th></tr></thead>
            <tbody>{LADDER.map((r) => <tr key={r[0]} className="border-t border-slate-100"><td className="py-1.5 font-semibold text-brand">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="mt-2 text-ink-soft"><b>Brand guardrails:</b> Luxe and Derma never get price schemes (L6); Luxe gets no bundles; end-of-life only via L&apos;Oréal-controlled routes; never to unauthorised resellers. Approvals: transfers over ₹10,000, any scheme, sampling budget, end-of-life.</p>
      </Card>

      <Card className="p-5 text-sm">
        <h2 className="font-semibold">4. Quick commerce: channel shift</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
          <li><b>Detect:</b> a SKU is <i>shifting online</i> at an outlet when its sell-out fell 20%+ over three months while the brand&apos;s online (mostly quick-commerce) sales in the city grew 20%+, or when the rep ticks &quot;Shoppers say they buy it on quick commerce&quot;.</li>
          <li><b>Resize:</b> the order guardrail then uses a tighter cover norm (21 instead of 30 days), so general trade stops being stocked at old volumes. This is the root cause of the distributor overstock seen publicly in 2024.</li>
          <li><b>Hand off:</b> the rep sends a channel-shift flag to the quick-commerce key-account team and demand planning: move allocation online, don&apos;t push it into the shop.</li>
          <li><b>Route:</b> fresh stock follows demand online. Ageing stock is rebalanced within general trade, never dumped on quick commerce at a discount (platforms apply shelf-life acceptance norms, and distributors have publicly objected to near-expiry dumping).</li>
          <li>City online growth figures in this prototype are synthetic. In a pilot they come from L&apos;Oréal&apos;s quick-commerce account data.</li>
        </ul>
      </Card>

      <Card className="p-5 text-sm">
        <h2 className="font-semibold">5. Assumptions and limitations</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
          <li>Velocity assumed constant over the window; seasonality and launches break this (trend factor and ML forecasts are later phases).</li>
          <li>Stock-flow sell-out is noisy (shrinkage, unrecorded inflows), so anomalies are flagged and confidence is weighted.</li>
          <li>Buffer days ({NODE_PARAMS.retailer.msb}/{NODE_PARAMS.distributor.msb}), cover norms and approval thresholds are assumptions to calibrate with L&apos;Oréal&apos;s return terms.</li>
          <li>Intervention uplifts are assumed: visibility ×{UPLIFT.VISIBILITY.factor}, sampling ×{UPLIFT.SAMPLING.factor}, bundle ×{UPLIFT.BUNDLE.factor}, scheme ×{UPLIFT.PROMO.factor}. The pilot measures the real values.</li>
          <li>The engine recommends; people decide. Reject reasons and diagnoses are captured to tune the rules.</li>
          <li>All data in this prototype is synthetic. Case figures (~1.5% returns, ~1% handling) are from the L&apos;Oréal brief.</li>
        </ul>
      </Card>
    </div>
  );
}

function Range({ label, v, set, min, max, step = 1 }: { label: string; v: number; set: (n: number) => void; min: number; max: number; step?: number }) {
  return (
    <label className="block">
      <div className="flex justify-between"><span>{label}</span><b className="tabular-nums">{v}</b></div>
      <input type="range" className="w-full" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} />
    </label>
  );
}

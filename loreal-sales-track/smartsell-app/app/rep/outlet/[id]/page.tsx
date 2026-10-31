'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, MapPin, Play, User } from 'lucide-react';
import { useEvals, useStore } from '@/store/useStore';
import { positionsOf, sortByPriority, outletSummary } from '@/lib/views';
import { computeKpis, evalAll } from '@/lib/kpis';
import { projectWithActions } from '@/lib/simulate';
import { daysBetween, fmtDate } from '@/lib/dates';
import { inr, num } from '@/lib/format';
import { Button, Card, Empty, Pill, Tabs } from '@/components/ui';
import { ConfidenceBadge, StateBadge } from '@/components/StateBadge';
import { CountRow } from '@/components/CountRow';
import { RecCard, StatusPill } from '@/components/RecCard';
import { OrderTab } from '@/components/OrderTab';
import { useRecommender } from '@/components/useRecs';
import { DISTRIBUTOR_BY_ID, OUTLET_BY_ID, OUTLET_TYPE_LABEL, SKU_BY_ID } from '@/data/seed';

type Tab = 'brief' | 'count' | 'actions' | 'order' | 'summary';

function OutletInner() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const outlet = OUTLET_BY_ID[id];
  const positionsMap = useStore((s) => s.smart.positions);
  const visits = useStore((s) => s.visits);
  const actions = useStore((s) => s.actions);
  const simDate = useStore((s) => s.simDate);
  const startVisit = useStore((s) => s.startVisit);
  const completeVisit = useStore((s) => s.completeVisit);
  const evals = useEvals();
  const recommender = useRecommender();
  const [tab, setTabState] = useState<Tab>((search.get('tab') as Tab) || 'brief');
  const [showHealthy, setShowHealthy] = useState(false);
  const setTab = (t: Tab) => { setTabState(t); router.replace(`/rep/outlet/${id}?tab=${t}`, { scroll: false }); };

  const positions = useMemo(() => (outlet ? sortByPriority(positionsOf(positionsMap, outlet.id), evals) : []), [outlet, positionsMap, evals]);
  if (!outlet) return <Empty title="Outlet not found"><Link href="/rep" className="text-brand underline">Back to today&apos;s beat</Link></Empty>;

  const flagged = positions.filter((p) => evals[p.id].state !== 'HEALTHY');
  const visit = [...visits].reverse().find((v) => v.outletId === outlet.id && v.status === 'in_progress') ?? [...visits].reverse().find((v) => v.outletId === outlet.id);
  const inVisit = visit?.status === 'in_progress';
  const summary = outletSummary(outlet.id, positionsMap, evals, visits, actions);
  const outletActions = actions.filter((a) => a.positionId.startsWith(`${outlet.id}::`) || (a.transfer && (a.transfer.fromId.startsWith(`${outlet.id}::`) || a.transfer.toId.startsWith(`${outlet.id}::`))));
  const lastVisitDays = Math.min(...positions.map((p) => daysBetween(p.countedAt, simDate)));

  const steps: { id: Tab; label: string; done: boolean }[] = [
    { id: 'brief', label: 'Brief', done: !!visit },
    { id: 'count', label: 'Smart Count', done: !!visit && visit.countedPositionIds.length > 0 },
    { id: 'actions', label: 'Actions', done: outletActions.some((a) => a.createdAt === simDate && !a.synthetic) },
    { id: 'order', label: 'Order', done: !!visit && visit.orderLines.length > 0 },
    { id: 'summary', label: 'Summary', done: visit?.status === 'done' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/rep" className="inline-flex items-center gap-1 text-sm text-ink-mute hover:text-ink"><ArrowLeft size={14} /> Today&apos;s beat</Link>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{outlet.name}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-mute">
              <span className="flex items-center gap-1"><MapPin size={13} />{outlet.area}</span>
              <span>{OUTLET_TYPE_LABEL[outlet.type]}</span>
              <span className="flex items-center gap-1"><User size={13} />{outlet.owner}</span>
              <span>via {DISTRIBUTOR_BY_ID[outlet.distributorId].name}</span>
            </p>
          </div>
          <div className="text-right">
            {summary.atRisk > 0 || summary.lostRisk === 0 ? (
              <><p className={clsx('text-2xl font-semibold', summary.atRisk > 0 ? 'text-red-700' : 'text-emerald-700')}>{inr(summary.atRisk)}</p>
              <p className="text-xs text-ink-mute">expiry risk · {summary.counts.STOCKOUT_RISK} stock-out risk{summary.counts.STOCKOUT_RISK === 1 ? '' : 's'}</p></>
            ) : (
              <><p className="text-2xl font-semibold text-blue-700">{inr(summary.lostRisk)}</p>
              <p className="text-xs text-ink-mute">sales at stake · {summary.counts.STOCKOUT_RISK} stock-out risk{summary.counts.STOCKOUT_RISK === 1 ? '' : 's'}</p></>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {!inVisit && visit?.status !== 'done' && <Button onClick={() => { startVisit(outlet.id); setTab('count'); }}><Play size={15} /> Start visit</Button>}
          {inVisit && <Pill className="bg-amber-50 text-amber-800">Visit in progress · started {fmtDate(visit!.date)}</Pill>}
          {visit?.status === 'done' && <Pill className="bg-emerald-50 text-emerald-700"><CheckCircle2 size={12} /> Visited {fmtDate(visit.date)}</Pill>}
          <span className="text-xs text-ink-mute">Last stock record {Number.isFinite(lastVisitDays) ? `${lastVisitDays} days ago` : 'n/a'} · {positions.length} SKUs ranged · {flagged.length} flagged</span>
        </div>
        <div className="mt-4 flex items-center gap-1 overflow-x-auto">
          {steps.map((s, i) => (
            <button key={s.id} onClick={() => setTab(s.id)} className={clsx('flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium', tab === s.id ? 'bg-brand text-white' : s.done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-ink-soft')}>
              {s.done ? <CheckCircle2 size={13} /> : <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/70 text-[10px] text-ink">{i + 1}</span>}
              {s.label}
            </button>
          ))}
        </div>
      </Card>

      {tab === 'brief' && (
        <div className="space-y-3">
          <h2 className="font-semibold">Pre-visit brief: check these first</h2>
          <p className="text-sm text-ink-mute">Predicted from distributor invoices and the last count. Expected stock = last count + deliveries − estimated sales.</p>
          {flagged.length === 0 && <Empty title="No risks predicted here">Do a quick shelf walk and take the order. The guardrail sizes it for you.</Empty>}
          {flagged.slice(0, 6).map((p, i) => {
            const e = evals[p.id];
            const sku = SKU_BY_ID[p.skuId];
            return (
              <Link key={p.id} href={`/rep/outlet/${outlet.id}/sku/${p.skuId}`}>
                <Card className="mb-3 p-4 transition hover:border-brand/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-ink-mute">#{i + 1}</span><span className="font-semibold">{sku.brand} {sku.name}</span><StateBadge state={e.state} size="sm" /><ConfidenceBadge band={e.confBand} /></div>
                      <p className="mt-1 text-sm text-ink-soft">{e.headline}</p>
                      {e.chips.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{e.chips.map((c) => <Pill key={c}>{c}</Pill>)}</div>}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={clsx('font-semibold tabular-nums', e.valueAtRisk > 0 ? 'text-red-700' : e.state === 'STOCKOUT_RISK' ? 'text-blue-700' : 'text-amber-700')}>{inr(e.rsAtStake)}</div>
                      <div className="text-[11px] text-ink-mute">{e.valueAtRisk > 0 ? `${e.window} d to act` : e.state === 'STOCKOUT_RISK' ? 'sales at stake' : 'cash tied up'}</div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
          <button onClick={() => setShowHealthy((s) => !s)} className="text-sm font-medium text-brand">{showHealthy ? 'Hide' : 'Show'} all {positions.length} SKUs at this outlet</button>
          {showHealthy && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-ink-mute"><tr><th className="px-3 py-2">SKU</th><th className="px-3 py-2">State</th><th className="px-3 py-2 text-right">Stock</th><th className="px-3 py-2 text-right">Sales/mo</th><th className="px-3 py-2 text-right">Cover</th><th className="px-3 py-2 text-right">₹ at risk</th></tr></thead>
                <tbody>{positions.map((p) => { const e = evals[p.id]; const sku = SKU_BY_ID[p.skuId]; return (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50" onClick={() => router.push(`/rep/outlet/${outlet.id}/sku/${p.skuId}`)} style={{ cursor: 'pointer' }}>
                    <td className="px-3 py-2">{sku.brand} {sku.name}</td><td className="px-3 py-2"><StateBadge state={e.state} size="sm" /></td>
                    <td className="px-3 py-2 text-right tabular-nums">{e.qty}</td><td className="px-3 py-2 text-right tabular-nums">{num(e.monthly, 1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{Number.isFinite(e.doc) ? `${num(e.doc)} d` : '∞'}</td><td className="px-3 py-2 text-right tabular-nums">{e.valueAtRisk > 0 ? inr(e.valueAtRisk) : '—'}</td>
                  </tr>); })}</tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end"><Button onClick={() => { if (!inVisit) startVisit(outlet.id); setTab('count'); }}>{inVisit ? 'Continue to Smart Count' : 'Start visit & count'} <ArrowRight size={15} /></Button></div>
        </div>
      )}

      {tab === 'count' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-semibold">Smart Count: only the {flagged.length} flagged SKUs</h2>
              <p className="text-sm text-ink-mute">Count shelf + back room, confirm batch and expiry (scan or type), tick what you see. About 30 seconds per SKU.</p>
            </div>
            {!inVisit && <Button size="sm" onClick={() => startVisit(outlet.id)}><Play size={14} /> Start visit</Button>}
          </div>
          {flagged.map((p, i) => <CountRow key={p.id} p={p} defaultOpen={i === 0} counted={!!visit?.countedPositionIds.includes(p.id)} />)}
          <details className="rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-medium text-brand">Count an unflagged SKU ({positions.length - flagged.length} healthy)</summary>
            <div className="mt-3 space-y-3">{positions.filter((p) => evals[p.id].state === 'HEALTHY').map((p) => <CountRow key={p.id} p={p} counted={!!visit?.countedPositionIds.includes(p.id)} />)}</div>
          </details>
          <div className="flex justify-end"><Button onClick={() => setTab('actions')}>See recommended actions <ArrowRight size={15} /></Button></div>
        </div>
      )}

      {tab === 'actions' && (
        <div className="space-y-5">
          <div>
            <h2 className="font-semibold">Recommended actions</h2>
            <p className="text-sm text-ink-mute">Cheapest, least brand-risky step first. Discounts are a last resort and never offered for Luxe or Derma. Max 3 per SKU shown.</p>
          </div>
          {flagged.length === 0 && <Empty title="Nothing to fix here">Take the order and move on.</Empty>}
          {flagged.map((p) => {
            const e = evals[p.id];
            const sku = SKU_BY_ID[p.skuId];
            const recs = recommender.forPosition(p.id);
            return (
              <Card key={p.id} className="p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{sku.brand} {sku.name}</span><StateBadge state={e.state} size="sm" /><Pill>{sku.tier}</Pill></div>
                  <Link href={`/rep/outlet/${outlet.id}/sku/${p.skuId}`} className="text-xs font-medium text-brand hover:underline">Why flagged →</Link>
                </div>
                <p className="mb-3 text-sm text-ink-soft">{e.headline}</p>
                <div className="space-y-2.5">
                  {recs.slice(0, 3).map((r, i) => <RecCard key={r.key + i} rec={r} rank={i + 1} action={recommender.actionFor(r)} />)}
                  {recs.length > 3 && (
                    <details><summary className="cursor-pointer text-xs font-medium text-brand">{recs.length - 3} more option(s)</summary>
                      <div className="mt-2 space-y-2.5">{recs.slice(3).map((r, i) => <RecCard key={r.key + i} rec={r} rank={i + 4} action={recommender.actionFor(r)} />)}</div>
                    </details>
                  )}
                </div>
              </Card>
            );
          })}
          <div className="flex justify-end"><Button onClick={() => setTab('order')}>Go to order <ArrowRight size={15} /></Button></div>
        </div>
      )}

      {tab === 'order' && <OrderTab outletId={outlet.id} positions={positions} visitId={visit?.id} />}

      {tab === 'summary' && <SummaryTab outletId={outlet.id} visitId={visit?.id} onComplete={() => visit && completeVisit(visit.id)} outletActions={outletActions} />}
    </div>
  );
}

function SummaryTab({ outletId, visitId, onComplete, outletActions }: { outletId: string; visitId?: string; onComplete: () => void; outletActions: ReturnType<typeof useStore.getState>['actions'] }) {
  const positions = useStore((s) => s.smart.positions);
  const actions = useStore((s) => s.actions);
  const simDate = useStore((s) => s.simDate);
  const visit = useStore((s) => s.visits.find((v) => v.id === visitId));
  const router = useRouter();
  const nowK = computeKpis(positions, evalAll(positions, simDate), (p) => p.nodeId === outletId);
  const proj = projectWithActions(positions, actions, simDate);
  const projK = computeKpis(proj, evalAll(proj, simDate), (p) => p.nodeId === outletId);
  if (!visit) return <Empty title="No visit yet">Start the visit from the Brief tab.</Empty>;
  const before = visit.riskBefore;
  const after = projK.atRisk + projK.lostSalesRisk;
  const orderValue = visit.orderLines.reduce((s, l) => s + l.final * SKU_BY_ID[l.skuId].ptr, 0);
  const todays = outletActions.filter((a) => a.createdAt === visit.date && !a.synthetic);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4"><p className="text-xs text-ink-mute">₹ at stake when you arrived</p><p className="text-2xl font-semibold text-red-700">{inr(before)}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-mute">Projected after your actions</p><p className="text-2xl font-semibold text-emerald-700">{inr(after)}</p><p className="text-xs text-ink-mute">now: {inr(nowK.atRisk + nowK.lostSalesRisk)} (some actions await approval)</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-mute">Order placed</p><p className="text-2xl font-semibold">{inr(orderValue)}</p><p className="text-xs text-ink-mute">{visit.orderLines.filter((l) => l.final > 0).length} lines · {visit.countedPositionIds.length} SKUs counted</p></Card>
      </div>
      <Card className="p-4">
        <h3 className="mb-2 flex items-center gap-2 font-semibold"><ClipboardList size={16} /> Actions from this visit</h3>
        {todays.length === 0 ? <p className="text-sm text-ink-mute">No actions yet. Accept or reject recommendations in the Actions tab.</p> : (
          <ul className="divide-y divide-slate-100">
            {todays.map((a) => <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"><span>{a.title} <span className="text-xs text-ink-mute">· {SKU_BY_ID[positions[a.positionId]?.skuId ?? '']?.name ?? ''}</span></span><StatusPill status={a.status} /></li>)}
          </ul>
        )}
      </Card>
      <Card className="p-4 text-sm">
        <p className="font-semibold">Leave-behind for the retailer (preview)</p>
        <p className="mt-1 text-ink-soft">&quot;Today we freed up {inr(Math.max(0, before - after), false)} of stock that was unlikely to sell, planned {todays.length} action(s), and placed an order of {inr(orderValue, false)} sized to what your shop sells.&quot;</p>
      </Card>
      <div className="flex flex-wrap justify-end gap-2">
        {visit.status !== 'done' && <Button variant="success" size="lg" onClick={onComplete}><CheckCircle2 size={16} /> Complete visit</Button>}
        <Button variant="secondary" size="lg" onClick={() => router.push('/rep')}>Next outlet <ArrowRight size={16} /></Button>
      </div>
    </div>
  );
}

export default function OutletPage() {
  return <Suspense fallback={null}><OutletInner /></Suspense>;
}

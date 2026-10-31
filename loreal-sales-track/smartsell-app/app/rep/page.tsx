'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, MapPin, Truck } from 'lucide-react';
import { useEvals, useStore } from '@/store/useStore';
import { computeKpis, actionStats, territoryOf } from '@/lib/kpis';
import { outletSummary, outletsOfTerritory } from '@/lib/views';
import { inr } from '@/lib/format';
import { Card, Pill, SectionTitle, Stat } from '@/components/ui';
import { STATE_META, StateBadge } from '@/components/StateBadge';
import { DISTRIBUTOR_BY_ID, OUTLET_TYPE_LABEL, REP_BY_ID, REPS, TERRITORY_BY_ID } from '@/data/seed';
import type { RiskState } from '@/lib/types';

const FILTERS: (RiskState | 'ALL')[] = ['ALL', 'NEAR_EXPIRY', 'AGEING_RISK', 'STOCKOUT_RISK', 'OVERSTOCK', 'DORMANT'];

export default function RepHome() {
  const repId = useStore((s) => s.repId);
  const setRep = useStore((s) => s.setRep);
  const positions = useStore((s) => s.smart.positions);
  const visits = useStore((s) => s.visits);
  const actions = useStore((s) => s.actions);
  const evals = useEvals();
  const [sort, setSort] = useState<'priority' | 'beat'>('priority');
  const [filter, setFilter] = useState<RiskState | 'ALL'>('ALL');

  const rep = REP_BY_ID[repId];
  const territory = TERRITORY_BY_ID[rep.territoryId];
  const dist = DISTRIBUTOR_BY_ID[territory.distributorId];

  const kpi = useMemo(() => computeKpis(positions, evals, (p) => p.nodeType === 'retailer' && territoryOf(p) === territory.id), [positions, evals, territory.id]);
  const distKpi = useMemo(() => computeKpis(positions, evals, (p) => p.nodeId === dist.id), [positions, evals, dist.id]);
  const stats = actionStats(actions, (a) => a.createdBy === repId);

  const outlets = useMemo(() => {
    const list = outletsOfTerritory(territory.id).map((o) => ({ o, s: outletSummary(o.id, positions, evals, visits, actions) }));
    const filtered = filter === 'ALL' ? list : list.filter((x) => x.s.counts[filter] > 0);
    return filtered.sort((a, b) => (sort === 'beat' ? a.o.beatOrder - b.o.beatOrder : b.s.priority - a.s.priority || b.s.rsAtStake - a.s.rsAtStake));
  }, [territory.id, positions, evals, visits, actions, sort, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-ink-mute">Good morning,</p>
          <h1 className="text-2xl font-bold">{rep.name} · {territory.name}</h1>
          <p className="text-sm text-ink-mute">{rep.title} · 6 outlets on today&apos;s beat · served by {dist.name}</p>
        </div>
        <label className="text-sm text-ink-mute">
          Viewing as{' '}
          <select value={repId} onChange={(e) => setRep(e.target.value)} className="ml-1 h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-ink">
            {REPS.map((r) => <option key={r.id} value={r.id}>{r.name} ({TERRITORY_BY_ID[r.territoryId].name})</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="₹ at risk on beat" value={inr(kpi.atRiskRetail)} sub="projected unsold before buffer" tone="red" />
        <Stat label="Near-expiry SKUs" value={kpi.byState.NEAR_EXPIRY} sub={`${kpi.byState.AGEING_RISK} more ageing`} tone="red" />
        <Stat label="Stock-out risks" value={kpi.stockouts} sub={`${inr(kpi.lostSalesRisk)} sales at stake`} tone="blue" />
        <Stat label="My open actions" value={stats.open} sub={`${stats.completed} completed`} tone="amber" />
        <Stat label="₹ rescued by me" value={inr(stats.rescued)} sub={`${stats.unitsMoved} units moved`} tone="green" />
      </div>

      <Card className="flex flex-wrap items-center gap-3 p-4">
        <Truck className="text-brand" size={20} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{dist.name}</p>
          <p className="text-xs text-ink-mute">Distributor godown: {distKpi.flagged} flagged SKUs · {inr(distKpi.atRisk)} at risk · {distKpi.stockouts} stock-out risks</p>
        </div>
        <Link href="/distributor" onClick={() => { useStore.getState().setDistributor(dist.id); useStore.getState().setRole('distributor'); }} className="text-sm font-medium text-brand hover:underline">
          Monthly ageing review →
        </Link>
      </Card>

      <div>
        <SectionTitle title="Today's beat" sub="Ranked by rupees at stake × urgency × data confidence"
          right={
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ink-mute">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as 'priority' | 'beat')} className="h-8 rounded-lg border border-slate-300 bg-white px-2">
                <option value="priority">By priority</option>
                <option value="beat">By beat order</option>
              </select>
            </div>
          } />
        <div className="mb-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx('rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset', filter === f ? 'bg-brand text-white ring-brand' : 'bg-white text-ink-soft ring-slate-200 hover:bg-slate-50')}>
              {f === 'ALL' ? 'All outlets' : STATE_META[f].label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {outlets.map(({ o, s }, idx) => (
            <Link key={o.id} href={`/rep/outlet/${o.id}`} className="group">
              <Card className="h-full p-4 transition group-hover:border-brand/40 group-hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-ink-soft">{sort === 'beat' ? o.beatOrder : idx + 1}</span>
                      <h3 className="truncate font-semibold">{o.name}</h3>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-mute"><MapPin size={12} /> {o.area} · {OUTLET_TYPE_LABEL[o.type]}</p>
                  </div>
                  <div className="text-right">
                    {s.rsAtStake === 0 && s.flagged > 0 ? (
                      <><div className="text-sm font-semibold text-amber-700">Slow stock</div><div className="text-[11px] text-ink-mute">diagnose, don&apos;t discount</div></>
                    ) : (
                      <><div className={clsx('text-lg font-semibold tabular-nums', s.atRisk > 0 ? 'text-red-700' : s.lostRisk > 0 ? 'text-blue-700' : 'text-emerald-700')}>{inr(s.rsAtStake)}</div>
                      <div className="text-[11px] text-ink-mute">at stake</div></>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {s.flagged === 0 && <StateBadge state="HEALTHY" size="sm" />}
                  {(['NEAR_EXPIRY', 'AGEING_RISK', 'STOCKOUT_RISK', 'OVERSTOCK', 'DORMANT'] as RiskState[]).filter((st) => s.counts[st] > 0).map((st) => (
                    <span key={st} className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset', STATE_META[st].cls)}>
                      <span className={clsx('h-1.5 w-1.5 rounded-full', STATE_META[st].dot)} /> {s.counts[st]} {STATE_META[st].short}
                    </span>
                  ))}
                  {s.openActions > 0 && <Pill className="bg-amber-50 text-amber-800">{s.openActions} open action{s.openActions > 1 ? 's' : ''}</Pill>}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  {s.visit?.status === 'done' ? <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 size={14} /> Visited</span>
                    : s.visit?.status === 'in_progress' ? <span className="flex items-center gap-1 text-amber-700"><Clock3 size={14} /> Visit in progress</span>
                    : <span className="text-ink-mute">Not visited yet</span>}
                  <span className="flex items-center gap-1 font-medium text-brand opacity-0 transition group-hover:opacity-100">Open <ArrowRight size={13} /></span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

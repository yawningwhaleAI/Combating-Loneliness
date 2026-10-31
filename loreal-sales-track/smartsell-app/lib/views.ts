import type { Eval } from './engine';
import { STATE_ORDER } from './engine';
import type { Action, Position, RiskState, Visit } from './types';
import { OUTLETS, SKU_BY_ID } from '@/data/seed';

export function positionsOf(positions: Record<string, Position>, nodeId: string) {
  return Object.values(positions).filter((p) => p.nodeId === nodeId);
}

export function sortByPriority(ps: Position[], evals: Record<string, Eval>) {
  return [...ps].sort((a, b) => {
    const ea = evals[a.id];
    const eb = evals[b.id];
    const fa = ea.state === 'HEALTHY' && !ea.shift.active ? 1 : 0;
    const fb = eb.state === 'HEALTHY' && !eb.shift.active ? 1 : 0;
    return fa - fb || eb.priority - ea.priority || STATE_ORDER.indexOf(ea.state) - STATE_ORDER.indexOf(eb.state);
  });
}

export interface OutletSummary {
  outletId: string;
  counts: Record<RiskState, number>;
  atRisk: number;
  lostRisk: number;
  rsAtStake: number;
  priority: number;
  topState: RiskState;
  flagged: number;
  visit?: Visit;
  openActions: number;
  shift: number;
}

export function outletSummary(outletId: string, positions: Record<string, Position>, evals: Record<string, Eval>, visits: Visit[], actions: Action[]): OutletSummary {
  const counts: Record<RiskState, number> = { NEAR_EXPIRY: 0, AGEING_RISK: 0, STOCKOUT_RISK: 0, DORMANT: 0, OVERSTOCK: 0, HEALTHY: 0 };
  let atRisk = 0, lostRisk = 0, priority = 0, flagged = 0, shift = 0;
  for (const p of positionsOf(positions, outletId)) {
    const e = evals[p.id];
    counts[e.state] += 1;
    atRisk += e.valueAtRisk;
    if (e.state === 'STOCKOUT_RISK') lostRisk += e.lostUnits * e.unitValue;
    priority += e.priority;
    if (e.state !== 'HEALTHY') flagged += 1;
    if (e.shift.active) shift += 1;
  }
  const topState = STATE_ORDER.find((s) => s !== 'HEALTHY' && counts[s] > 0) ?? 'HEALTHY';
  const visit = [...visits].reverse().find((v) => v.outletId === outletId);
  const openActions = actions.filter((a) => a.positionId.startsWith(`${outletId}::`) && (a.status === 'in_progress' || a.status === 'awaiting_approval')).length;
  return { outletId, counts, atRisk, lostRisk, rsAtStake: atRisk + lostRisk, priority, topState, flagged, visit, openActions, shift };
}

export function outletsOfTerritory(territoryId: string) {
  return OUTLETS.filter((o) => o.territoryId === territoryId);
}

export function skuLabel(skuId: string) {
  const s = SKU_BY_ID[skuId];
  return `${s.brand} ${s.name}`;
}

export function peerBenchmark(p: Position, positions: Record<string, Position>, evals: Record<string, Eval>) {
  const peers = Object.values(positions).filter((q) => q.nodeType === 'retailer' && q.skuId === p.skuId && q.id !== p.id);
  if (!peers.length) return null;
  const ms = peers.map((q) => evals[q.id].monthly).sort((a, b) => a - b);
  return { count: peers.length, median: ms[Math.floor(ms.length / 2)], top: ms[ms.length - 1] };
}

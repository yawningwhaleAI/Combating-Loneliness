import { evaluate, type Eval } from './engine';
import type { Action, Position, RiskState } from './types';
import { OUTLET_BY_ID, SKU_BY_ID } from '@/data/seed';

export interface Kpis {
  atRisk: number;
  atRiskRetail: number;
  atRiskDist: number;
  stockValue: number;
  nearExpiryValue: number;
  nearExpiryPct: number;
  stockouts: number;
  overstockValue: number;
  flagged: number;
  byState: Record<RiskState, number>;
  lostSalesRisk: number;
}

export function territoryOf(p: Position) {
  if (p.nodeType === 'retailer') return OUTLET_BY_ID[p.nodeId]?.territoryId;
  return { d1: 't1', d2: 't2', d3: 't3' }[p.nodeId as 'd1' | 'd2' | 'd3'];
}

export function evalAll(positions: Record<string, Position>, simDate: string) {
  const m: Record<string, Eval> = {};
  for (const p of Object.values(positions)) m[p.id] = evaluate(p, SKU_BY_ID[p.skuId], simDate);
  return m;
}

export function computeKpis(positions: Record<string, Position>, evals: Record<string, Eval>, filter?: (p: Position) => boolean): Kpis {
  const k: Kpis = {
    atRisk: 0, atRiskRetail: 0, atRiskDist: 0, stockValue: 0, nearExpiryValue: 0, nearExpiryPct: 0, stockouts: 0,
    overstockValue: 0, flagged: 0, lostSalesRisk: 0,
    byState: { NEAR_EXPIRY: 0, AGEING_RISK: 0, STOCKOUT_RISK: 0, DORMANT: 0, OVERSTOCK: 0, HEALTHY: 0 },
  };
  for (const p of Object.values(positions)) {
    if (filter && !filter(p)) continue;
    const e = evals[p.id];
    if (!e) continue;
    k.byState[e.state] += 1;
    k.stockValue += e.qty * e.unitValue;
    if (e.state !== 'HEALTHY') k.flagged += 1;
    k.atRisk += e.valueAtRisk;
    if (p.nodeType === 'retailer') k.atRiskRetail += e.valueAtRisk; else k.atRiskDist += e.valueAtRisk;
    if (e.state === 'NEAR_EXPIRY') k.nearExpiryValue += e.qty * e.unitValue;
    if (e.state === 'STOCKOUT_RISK') { k.stockouts += 1; k.lostSalesRisk += e.lostUnits * e.unitValue; }
    if (e.state === 'OVERSTOCK' || e.state === 'DORMANT') k.overstockValue += e.excessValue;
  }
  k.nearExpiryPct = k.stockValue > 0 ? k.nearExpiryValue / k.stockValue : 0;
  return k;
}

export function actionStats(actions: Action[], filter?: (a: Action) => boolean) {
  const list = filter ? actions.filter(filter) : actions;
  const accepted = list.filter((a) => a.status !== 'rejected');
  const completed = list.filter((a) => a.status === 'done' || a.status === 'verified');
  const rescued = list.reduce((s, a) => s + (a.outcome?.rsRescued ?? 0), 0);
  const avoided = list.reduce((s, a) => s + (a.outcome?.riskAvoided ?? 0), 0);
  const unitsMoved = list.reduce((s, a) => s + (a.outcome?.unitsMoved ?? 0), 0);
  return {
    total: list.length,
    accepted: accepted.length,
    awaiting: list.filter((a) => a.status === 'awaiting_approval').length,
    open: list.filter((a) => a.status === 'in_progress' || a.status === 'awaiting_approval').length,
    completed: completed.length,
    rejected: list.filter((a) => a.status === 'rejected').length,
    completionRate: accepted.length ? completed.length / accepted.length : 0,
    rescued, avoided, unitsMoved,
  };
}

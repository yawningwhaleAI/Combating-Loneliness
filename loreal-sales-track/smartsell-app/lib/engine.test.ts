import { describe, expect, it } from 'vitest';
import { evaluate } from './engine';
import { recommend } from './recommend';
import { advance, newWorld } from './simulate';
import { evalAll } from './kpis';
import { SIM_START } from './params';
import { addDays } from './dates';
import { buildPositions, posId, SKU_BY_ID } from '@/data/seed';
import type { Action, Position } from './types';

const D = SIM_START;
const pos = (over: Partial<Position> & Pick<Position, 'batches' | 'monthlySales'>): Position => ({
  id: 'x', nodeId: 'n', nodeType: 'retailer', skuId: 'lumea-shampoo', source: 'manual_count', countedAt: D,
  signals: [], habitQty: 6, ...over,
});
const sku = { ...SKU_BY_ID['lumea-shampoo'], ptr: 210 };

describe('worked examples from 08-risk-methodology.md', () => {
  it('A: near-expiry excess', () => {
    const e = evaluate(pos({ batches: [{ code: 'A', expiry: addDays(D, 45), qty: 180 }], monthlySales: 25 }), sku, D);
    expect(e.state).toBe('NEAR_EXPIRY');
    expect(e.unsold).toBeCloseTo(167.5, 1);
    expect(Math.round(e.valueAtRisk)).toBe(35175);
    expect(e.window).toBe(15);
    expect(e.suggestedOrder).toBe(0);
  });
  it('A-early: same stock caught 150 days earlier', () => {
    const e = evaluate(pos({ batches: [{ code: 'A', expiry: addDays(D, 195), qty: 180 }], monthlySales: 25 }), sku, D);
    expect(e.state).toBe('AGEING_RISK');
    expect(Math.round(e.valueAtRisk)).toBe(8925);
  });
  it('B: slow-moving healthy shelf life is overstock, not expiry', () => {
    const e = evaluate(pos({ batches: [{ code: 'B', expiry: addDays(D, 240), qty: 80 }], monthlySales: 15 }), { ...sku, ptr: 240 }, D);
    expect(e.state).toBe('OVERSTOCK');
    expect(e.unsold).toBe(0);
    expect(e.doc).toBe(160);
  });
  it('C: stock-out risk', () => {
    const e = evaluate(pos({ batches: [{ code: 'C', expiry: addDays(D, 300), qty: 20 }], monthlySales: 60, source: 'scan' }), sku, D);
    expect(e.state).toBe('STOCKOUT_RISK');
    expect(e.doc).toBe(10);
    expect(e.lostUnits).toBeCloseTo(8, 5);
  });
  it('D: distributor hidden near-expiry batch', () => {
    const p = pos({ nodeType: 'distributor', source: 'dms', batches: [{ code: 'D1', expiry: addDays(D, 200), qty: 900 }, { code: 'D2', expiry: addDays(D, 520), qty: 1200 }], monthlySales: 300 });
    const e = evaluate(p, { ...sku, distPrice: 260 }, D);
    expect(e.state).toBe('NEAR_EXPIRY');
    expect(e.unsold).toBeCloseTo(100, 5);
    expect(e.window).toBe(80);
  });
  it('E: stale verbal data is low confidence', () => {
    const e = evaluate(pos({ batches: [{ code: 'E', expiry: addDays(D, 480), qty: 24 }], monthlySales: 3, source: 'retailer_verbal', countedAt: addDays(D, -40) }), sku, D);
    expect(e.confBand).toBe('Low');
  });
});

describe('seeded demo scenarios', () => {
  const positions = buildPositions();
  const evals = evalAll(positions, D);
  const ctx = { positions, simDate: D, evalOf: (id: string) => evals[id] };
  const st = (n: string, s: string) => evals[posId(n, s)];

  it('S1 → S3a hero rebalance: transfer 66 units', () => {
    expect(st('o-shree', 'lumea-shampoo').state).toBe('NEAR_EXPIRY');
    expect(Math.round(st('o-shree', 'lumea-shampoo').valueAtRisk)).toBe(14700);
    expect(st('o-glow', 'lumea-shampoo').state).toBe('STOCKOUT_RISK');
    const recs = recommend(positions[posId('o-shree', 'lumea-shampoo')], ctx);
    const t = recs.find((r) => r.code === 'TRANSFER_OUT');
    expect(t?.transfer?.toId).toBe(posId('o-glow', 'lumea-shampoo'));
    expect(t?.transfer?.qty).toBe(66);
    expect(t?.needsApproval).toBe(true);
  });
  it('scenario states', () => {
    expect(st('o-saikirana', 'verde-vitc').state).toBe('OVERSTOCK');
    expect(st('o-powai', 'verde-facewash').state).toBe('STOCKOUT_RISK');
    expect(st('d1', 'lumea-burgundy').state).toBe('NEAR_EXPIRY');
    expect(st('d2', 'lumea-burgundy').state).toBe('STOCKOUT_RISK');
    expect(st('o-newbharat', 'lumea-conditioner').confBand).toBe('Low');
    expect(st('o-galleria', 'eclat-edp').state).toBe('AGEING_RISK');
    expect(st('o-vikhroli', 'verde-micellar').state).toBe('DORMANT');
    expect(st('o-linking', 'chroma-kajal').state).toBe('STOCKOUT_RISK');
  });
  it('luxe never gets a price promotion', () => {
    const recs = recommend(positions[posId('o-galleria', 'eclat-edp')], ctx);
    expect(recs.some((r) => r.code === 'PROMO' || r.code === 'BUNDLE')).toBe(false);
  });
  it('most generated positions are healthy so flags stand out', () => {
    const all = Object.values(evals);
    const healthy = all.filter((e) => e.state === 'HEALTHY').length;
    expect(healthy / all.length).toBeGreaterThan(0.75);
  });
  it('advancing time: SMARTSELL world wastes less than business-as-usual after the hero transfer', () => {
    const recs = recommend(positions[posId('o-shree', 'lumea-shampoo')], ctx);
    const t = recs.find((r) => r.code === 'TRANSFER_OUT')!;
    const action: Action = {
      id: 'a1', recKey: t.key, positionId: t.positionId, code: t.code, level: t.level, title: t.title, rationale: t.rationale,
      owner: t.owner, needsApproval: true, status: 'in_progress', createdAt: D, createdBy: 'rep-kunal', expectedRs: t.expectedRs,
      costRs: t.costRs, unitValue: 210, unsoldBefore: 70, riskBefore: 14700, transfer: t.transfer, log: [],
    };
    let state = { simDate: D, smart: newWorld(positions), bau: newWorld(positions), actions: [action] };
    for (let i = 0; i < 8; i++) state = advance(state, 14);
    expect(state.actions[0].outcome?.unitsMoved).toBe(66);
    expect(state.smart.counters.lostValue).toBeLessThan(state.bau.counters.lostValue);
    expect(state.smart.counters.expiredValue).toBeLessThan(state.bau.counters.expiredValue);
  });
});

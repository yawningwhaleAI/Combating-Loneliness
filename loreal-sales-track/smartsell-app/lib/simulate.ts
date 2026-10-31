import { NODE_PARAMS } from './params';
import { addDays, batchCodeFor, daysBetween } from './dates';
import { evaluate, roundToCase, totalQty, unitValueOf } from './engine';
import type { Action, ActionOutcome, Counters, Delivery, Position, World } from './types';
import { SKU_BY_ID } from '@/data/seed';

export const emptyCounters = (): Counters => ({ expiredUnits: 0, expiredValue: 0, lostUnits: 0, lostValue: 0, soldValue: 0, liquidatedValue: 0 });

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

function freshBatch(skuId: string, date: string, qty: number) {
  const sku = SKU_BY_ID[skuId];
  const mfg = addDays(date, -60);
  return { code: batchCodeFor(mfg), expiry: addDays(mfg, sku.shelfLifeMonths * 30), qty };
}

function addBatch(p: Position, b: { code: string; expiry: string; qty: number }) {
  const same = p.batches.find((x) => x.code === b.code && x.expiry === b.expiry);
  if (same) same.qty += b.qty;
  else p.batches.push({ ...b });
  p.batches.sort((a, c) => a.expiry.localeCompare(c.expiry));
}

/** Remove qty from a position FEFO (oldest first) and return the removed batch slices. */
function takeFefo(p: Position, qty: number) {
  const taken: { code: string; expiry: string; qty: number }[] = [];
  let left = qty;
  for (const b of [...p.batches].sort((a, c) => a.expiry.localeCompare(c.expiry))) {
    if (left <= 0) break;
    const q = Math.min(b.qty, left);
    if (q > 0) {
      b.qty -= q;
      left -= q;
      taken.push({ code: b.code, expiry: b.expiry, qty: q });
    }
  }
  p.batches = p.batches.filter((b) => b.qty > 0);
  return taken;
}

const instantCodes = new Set(['VERIFY', 'ROTATE', 'VISIBILITY', 'STOP_REPLENISH', 'STOP_PRIMARY', 'DIAGNOSE', 'RANGE_REVIEW', 'REPLENISH']);
export const isInstant = (a: Pick<Action, 'code'>) => instantCodes.has(a.code);

/** Side effects of an action on positions. Mutates `positions`. Returns the outcome. */
export function applyAction(positions: Record<string, Position>, a: Action, date: string): ActionOutcome {
  const p = positions[a.positionId];
  const sku = p ? SKU_BY_ID[p.skuId] : undefined;
  const out: ActionOutcome = { rsRescued: 0, riskAvoided: 0, unitsMoved: 0, estimated: false, at: date, note: '' };
  if (!p || !sku) return out;

  switch (a.code) {
    case 'TRANSFER_OUT':
    case 'TRANSFER_IN':
    case 'DIST_TRANSFER': {
      if (!a.transfer) break;
      const from = positions[a.transfer.fromId];
      const to = positions[a.transfer.toId];
      if (!from || !to) break;
      const qty = Math.min(a.transfer.qty, totalQty(from));
      const before = evaluate(from, SKU_BY_ID[from.skuId], date);
      for (const slice of takeFefo(from, qty)) addBatch(to, slice);
      const rescuedUnits = Math.min(qty, before.unsold);
      out.unitsMoved = qty;
      out.rsRescued = rescuedUnits * before.unitValue;
      out.note = `${qty} units moved; ${Math.round(rescuedUnits)} of them would otherwise have expired`;
      break;
    }
    case 'END_OF_LIFE':
    case 'RETURN': {
      const e = evaluate(p, sku, date);
      const units = Math.round(e.unsold);
      takeFefo(p, units);
      out.unitsMoved = units;
      out.rsRescued = a.code === 'END_OF_LIFE' ? units * e.unitValue * 0.5 : 0;
      out.note = a.code === 'END_OF_LIFE' ? `${units} units routed to controlled end-of-life (~50% value recovered)` : `${units} units returned; root cause recorded`;
      break;
    }
    case 'VISIBILITY':
    case 'SAMPLING':
    case 'BUNDLE':
    case 'PROMO': {
      if (!a.uplift) break;
      p.upliftFactor = a.uplift.factor;
      p.upliftUntil = addDays(date, a.uplift.days);
      if (a.code === 'VISIBILITY') p.signals = p.signals.filter((s) => s !== 'NOT_ON_SHELF');
      if (a.code === 'SAMPLING') p.signals = p.signals.filter((s) => s !== 'NO_TESTER');
      out.rsRescued = a.expectedRs;
      out.estimated = true;
      out.note = `Sell-out uplift ×${a.uplift.factor} active until ${p.upliftUntil}`;
      break;
    }
    case 'ROTATE':
      p.signals = p.signals.filter((s) => s !== 'FEFO_WRONG');
      out.note = 'Shelf rotated FEFO';
      break;
    case 'STOP_REPLENISH':
    case 'STOP_PRIMARY':
      p.paused = true;
      out.riskAvoided = a.expectedRs;
      out.estimated = true;
      out.note = 'Replenishment paused for this SKU';
      break;
    default:
      out.note = 'Recorded';
  }
  return out;
}

/** What positions would look like if every open (not rejected) action were carried out now. */
export function projectWithActions(positions: Record<string, Position>, actions: Action[], date: string) {
  const proj = clone(positions);
  for (const a of actions) {
    if (a.status === 'rejected' || a.status === 'verified' || a.status === 'done') continue;
    applyAction(proj, a, date);
  }
  return proj;
}

type Mode = 'smart' | 'bau';

/** One 7-day tick: deliveries → sales → returns at buffer → ordering (fortnightly beat). Mutates world. */
function tick(world: World, date: string, mode: Mode, orderNow: boolean) {
  const next = addDays(date, 7);

  // 1. deliveries due
  const due = world.deliveries.filter((d) => d.arrive <= date);
  world.deliveries = world.deliveries.filter((d) => d.arrive > date);
  for (const d of due) {
    const p = world.positions[d.positionId];
    if (p && d.qty > 0) addBatch(p, freshBatch(p.skuId, date, d.qty));
  }

  // 2. sales over 7 days (FEFO, only stock still inside its sellable window)
  for (const p of Object.values(world.positions)) {
    const sku = SKU_BY_ID[p.skuId];
    const msb = NODE_PARAMS[p.nodeType].msb;
    const m = p.monthlySales * (p.upliftFactor && p.upliftUntil && p.upliftUntil >= date ? p.upliftFactor : 1);
    let demand = (m / 30) * 7;
    const want = demand;
    for (const b of [...p.batches].sort((a, c) => a.expiry.localeCompare(c.expiry))) {
      if (demand <= 0) break;
      if (daysBetween(date, b.expiry) <= msb) continue;
      const q = Math.min(b.qty, demand);
      b.qty -= q;
      demand -= q;
    }
    p.batches = p.batches.filter((b) => b.qty > 1e-6);
    if (p.nodeType === 'retailer') {
      world.counters.soldValue += (want - demand) * sku.ptr;
      if (demand > 1e-6) {
        world.counters.lostUnits += demand;
        world.counters.lostValue += demand * sku.ptr;
        world.lostBy = world.lostBy ?? {};
        world.lostBy[p.id] = (world.lostBy[p.id] ?? 0) + demand * sku.ptr;
      }
    }
  }

  // 3. stock that crosses its minimum sellable buffer is returned (and later destroyed): this is the waste
  for (const p of Object.values(world.positions)) {
    const sku = SKU_BY_ID[p.skuId];
    const msb = NODE_PARAMS[p.nodeType].msb;
    for (const b of p.batches) {
      if (daysBetween(next, b.expiry) <= msb) {
        world.counters.expiredUnits += b.qty;
        world.counters.expiredValue += b.qty * unitValueOf(p, sku);
        world.expiredBy = world.expiredBy ?? {};
        world.expiredBy[p.id] = (world.expiredBy[p.id] ?? 0) + b.qty * unitValueOf(p, sku);
        b.qty = 0;
      }
    }
    p.batches = p.batches.filter((b) => b.qty > 0);
  }

  // 4. ordering happens on the fortnightly beat; delivery arrives a week later
  if (!orderNow) return next;
  const pending = new Set(world.deliveries.map((d) => d.positionId));
  for (const p of Object.values(world.positions)) {
    if (pending.has(p.id)) continue;
    const sku = SKU_BY_ID[p.skuId];
    const cfg = NODE_PARAMS[p.nodeType];
    const e = evaluate(p, sku, next);
    if (e.v <= 0) continue;
    let qty = 0;
    if (mode === 'smart') {
      const sellableDoc = e.sellableQty / e.v;
      if (p.paused && !e.blocking) p.paused = false; // guardrail lifts once the at-risk stock has cleared
      if (!p.paused && !e.blocking && sellableDoc < e.rop + 14) qty = roundToCase(Math.ceil(e.v * (cfg.targetCover + cfg.lead + 7) - e.sellableQty), sku.casePack);
    } else if (e.doc < (p.nodeType === 'retailer' ? 21 : 14)) {
      qty = p.habitQty; // business as usual: "same as last time"
    }
    if (qty > 0) world.deliveries.push({ positionId: p.id, qty, arrive: next, kind: 'auto' });
  }
  return next;
}

export interface AdvanceInput {
  simDate: string;
  smart: World;
  bau: World;
  actions: Action[];
}

/** Advance both worlds by `days` (multiple of 7). In the SMARTSELL world, scheduled actions execute first. */
export function advance(input: AdvanceInput, days: number) {
  const smart = clone(input.smart);
  const bau = clone(input.bau);
  const actions = clone(input.actions);
  let date = input.simDate;

  // Execute scheduled field actions at the start of the period
  for (const a of actions) {
    if (a.status === 'in_progress') {
      a.outcome = applyAction(smart.positions, a, date);
      a.status = 'verified';
      a.log.push({ at: date, text: `Executed: ${a.outcome.note}` });
    } else if (a.status === 'done') {
      a.status = 'verified';
      a.log.push({ at: date, text: 'Verified at follow-up' });
    }
  }

  // SMARTSELL world: every outlet orders the cover-based suggestion at day 0 (unless the rep placed an order in a visit)
  if (!smart.initialOrdersApplied) {
    const pending = new Set(smart.deliveries.map((d) => d.positionId));
    for (const p of Object.values(smart.positions)) {
      if (pending.has(p.id) || p.paused) continue;
      const e = evaluate(p, SKU_BY_ID[p.skuId], date);
      if (e.suggestedOrder > 0 && e.doc < e.rop + 7) smart.deliveries.push({ positionId: p.id, qty: e.suggestedOrder, arrive: date, kind: 'order' });
    }
    smart.initialOrdersApplied = true;
  }

  // Business as usual applies the orders retailers/distributors asked for (incl. scheme loading)
  if (!bau.initialOrdersApplied) {
    for (const p of Object.values(bau.positions)) {
      if (p.requestedQty) bau.deliveries.push({ positionId: p.id, qty: p.requestedQty, arrive: date, kind: 'order' });
    }
    bau.initialOrdersApplied = true;
  }

  const ticks = Math.max(1, Math.round(days / 7));
  for (let i = 0; i < ticks; i++) {
    const orderNow = i % 2 === 1;
    tick(smart, date, 'smart', orderNow);
    date = tick(bau, date, 'bau', orderNow);
  }
  return { smart, bau, actions, simDate: date };
}

export function newWorld(positions: Record<string, Position>, deliveries: Delivery[] = []): World {
  return { positions: clone(positions), deliveries, counters: emptyCounters(), initialOrdersApplied: false };
}

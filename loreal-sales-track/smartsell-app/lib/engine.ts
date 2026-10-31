import { NODE_PARAMS, SIGNAL_VELOCITY_ADJ, SOURCE_WEIGHT } from './params';
import { addDays, daysBetween, fmtDate } from './dates';
import { num, inr } from './format';
import type { Position, RiskState, Sku } from './types';

export interface BatchEval {
  code: string;
  expiry: string;
  qty: number;
  daysToExpiry: number;
  window: number;      // days until this batch reaches its minimum sellable buffer
  bufferDate: string;
  sold: number;
  unsold: number;
}

export interface Eval {
  state: RiskState;
  qty: number;
  monthly: number;     // effective monthly velocity used for projection
  v: number;           // per day
  doc: number;         // days of cover
  unsold: number;      // projected unsold units (FEFO)
  valueAtRisk: number;
  window: number | null;
  batches: BatchEval[];
  rop: number;
  lostUnits: number;
  suggestedOrder: number;
  blocking: boolean;
  sellableQty: number;
  confidence: number;
  confBand: 'High' | 'Medium' | 'Low';
  unitValue: number;
  excessUnits: number;
  excessValue: number;
  rsAtStake: number;
  urgency: number;
  priority: number;
  headline: string;
  chips: string[];
}

export const STATE_ORDER: RiskState[] = ['NEAR_EXPIRY', 'AGEING_RISK', 'STOCKOUT_RISK', 'DORMANT', 'OVERSTOCK', 'HEALTHY'];

export function isFlagged(s: RiskState) {
  return s !== 'HEALTHY';
}

export function unitValueOf(p: Position, sku: Sku) {
  return p.nodeType === 'retailer' ? sku.ptr : sku.distPrice;
}

/** Velocity used for projection: base estimate, discounted by "no movement" signals, boosted by active interventions. */
export function effectiveMonthly(p: Position, simDate: string) {
  let m = p.monthlySales;
  if (p.signals.includes('DUST') || p.signals.includes('NO_MOVEMENT')) m *= SIGNAL_VELOCITY_ADJ;
  if (p.signals.includes('QCOMM_SHIFT')) m *= 0.85; // assumed: some outlet demand has moved online
  if (p.upliftFactor && p.upliftUntil && p.upliftUntil >= simDate) m *= p.upliftFactor;
  return m;
}

export function confidenceOf(p: Position, simDate: string) {
  const age = Math.max(0, daysBetween(p.countedAt, simDate));
  const recency = age <= 7 ? 1 : age <= 30 ? 0.8 : 0.5;
  return SOURCE_WEIGHT[p.source] * recency;
}

export const bandOf = (c: number): Eval['confBand'] => (c >= 0.8 ? 'High' : c >= 0.5 ? 'Medium' : 'Low');

export function urgencyOf(window: number | null) {
  if (window === null) return 0;
  if (window <= 30) return 1;
  if (window <= 60) return 0.8;
  if (window <= 90) return 0.6;
  if (window <= 180) return 0.4;
  return 0.2;
}

export function roundToCase(q: number, pack: number) {
  if (q <= 0) return 0;
  return Math.max(pack, Math.round(q / pack) * pack);
}

export function floorToCase(q: number, pack: number) {
  return Math.max(0, Math.floor(q / pack) * pack);
}

export function totalQty(p: Position) {
  return p.batches.reduce((s, b) => s + b.qty, 0);
}

export function evaluate(p: Position, sku: Sku, simDate: string): Eval {
  const cfg = NODE_PARAMS[p.nodeType];
  const monthly = effectiveMonthly(p, simDate);
  const v = monthly / 30;
  const live = p.batches.filter((b) => b.qty > 0).sort((a, b) => a.expiry.localeCompare(b.expiry));
  const qty = live.reduce((s, b) => s + b.qty, 0);
  const doc = v > 0 ? qty / v : qty > 0 ? Infinity : 0;

  // FEFO projection: each batch can only sell until (expiry - minimum sellable buffer)
  let t = 0;
  let unsold = 0;
  let window: number | null = null;
  const batches: BatchEval[] = live.map((b) => {
    const dte = daysBetween(simDate, b.expiry);
    const w = dte - cfg.msb;
    const bufferDate = addDays(b.expiry, -cfg.msb);
    const sellable = v > 0 ? Math.max(0, v * (w - t)) : 0;
    const sold = Math.min(b.qty, sellable);
    const u = b.qty - sold;
    if (u > 1e-9) {
      unsold += u;
      if (window === null) window = Math.max(0, w);
      t = Math.max(t, w);
    } else if (v > 0) {
      t += sold / v;
    }
    return { code: b.code, expiry: b.expiry, qty: b.qty, daysToExpiry: dte, window: w, bufferDate, sold, unsold: u };
  });

  const unitValue = unitValueOf(p, sku);
  const valueAtRisk = unsold * unitValue;
  const rop = cfg.lead + cfg.safety;
  const lostUnits = v > 0 ? Math.max(0, v * (rop - doc)) : 0;
  // Stock already inside its buffer can't sell; only still-sellable excess should block a re-order.
  const blocking = batches.some((b) => b.unsold > 0.5 && b.window > 0);
  const sellableQty = batches.filter((b) => b.window > 0).reduce((s, b) => s + b.qty, 0);
  const rawOrder = Math.ceil(v * (cfg.targetCover + cfg.lead) - sellableQty);
  const suggestedOrder = blocking ? 0 : roundToCase(rawOrder, sku.casePack);
  const confidence = confidenceOf(p, simDate);
  const excessUnits = Math.max(0, qty - v * cfg.targetCover);
  const excessValue = excessUnits * unitValue;

  let state: RiskState;
  if (unsold > 0.5 && window !== null && window <= 90) state = 'NEAR_EXPIRY';
  else if (v === 0 && qty > 0) state = 'DORMANT';
  else if (unsold > 0.5) state = 'AGEING_RISK';
  else if (v > 0 && doc <= rop) state = 'STOCKOUT_RISK';
  else if (doc > cfg.targetCover * cfg.overstockMult) state = 'OVERSTOCK';
  else state = 'HEALTHY';

  let rsAtStake = 0;
  let urgency = 0;
  if (state === 'NEAR_EXPIRY' || state === 'AGEING_RISK') {
    rsAtStake = valueAtRisk;
    urgency = urgencyOf(window);
  } else if (state === 'STOCKOUT_RISK') {
    rsAtStake = lostUnits * unitValue;
    urgency = 1;
  } else if (state === 'DORMANT') {
    rsAtStake = valueAtRisk;
    urgency = Math.max(0.2, urgencyOf(window));
  } else if (state === 'OVERSTOCK') {
    rsAtStake = excessValue;
    urgency = 0.1;
  }
  const priority = rsAtStake * urgency * (0.5 + 0.5 * confidence);

  const chips: string[] = [];
  if (bandOf(confidence) === 'Low') chips.push('Low data confidence');
  if (p.signals.includes('DUST') || p.signals.includes('NO_MOVEMENT')) chips.push('No-movement signal');
  if (p.signals.includes('CARTONS')) chips.push('Unopened cartons');
  if (p.signals.includes('NOT_ON_SHELF')) chips.push('Poor visibility');
  if (p.signals.includes('NO_TESTER')) chips.push('No tester');
  if (p.signals.includes('NOT_ASKED')) chips.push('Assortment mismatch?');
  if (p.signals.includes('RETURN_REQUEST')) chips.push('Return requested');
  if (p.signals.includes('QCOMM_SHIFT')) chips.push('Demand moving to quick commerce');
  if (p.paused) chips.push('Replenishment paused');
  if (p.upliftFactor && p.upliftUntil && p.upliftUntil >= simDate) chips.push(`Intervention active ×${p.upliftFactor}`);

  const headline = buildHeadline(state, { qty, monthly, doc, unsold, valueAtRisk, window, batches, rop, lostUnits, excessValue, target: cfg.targetCover, msb: cfg.msb });

  return {
    state, qty, monthly, v, doc, unsold, valueAtRisk, window, batches, rop, lostUnits, suggestedOrder, blocking, sellableQty,
    confidence, confBand: bandOf(confidence), unitValue, excessUnits, excessValue, rsAtStake, urgency, priority, headline, chips,
  };
}

function buildHeadline(
  state: RiskState,
  x: { qty: number; monthly: number; doc: number; unsold: number; valueAtRisk: number; window: number | null; batches: BatchEval[]; rop: number; lostUnits: number; excessValue: number; target: number; msb: number },
) {
  const atRiskBatch = x.batches.find((b) => b.unsold > 0.5);
  switch (state) {
    case 'NEAR_EXPIRY':
    case 'AGEING_RISK':
      return `At ~${num(x.monthly, 1)}/month, ~${num(x.unsold)} of ${num(x.qty)} units are unlikely to sell before ${atRiskBatch ? fmtDate(atRiskBatch.bufferDate) : 'their buffer date'} (${x.msb} days before expiry). ${inr(x.valueAtRisk, false)} at risk · ${x.window} days to act.`;
    case 'STOCKOUT_RISK':
      return `Only ${num(x.doc)} days of stock left at ~${num(x.monthly, 1)}/month (reorder point ${x.rop} days). ~${num(x.lostUnits)} units of sales lost next cycle if not replenished.`;
    case 'OVERSTOCK':
      return `${num(x.doc)} days of cover vs a ${x.target}-day norm. It will sell before expiry, but ${inr(x.excessValue, false)} of the retailer's cash is tied up. Diagnose why it is slow.`;
    case 'DORMANT':
      return `No sales recorded with ${num(x.qty)} units on hand. Verify the count, then diagnose.`;
    default:
      return `${num(x.doc)} days of cover, shelf life comfortable. No action needed.`;
  }
}

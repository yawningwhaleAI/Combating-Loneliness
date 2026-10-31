import { APPROVAL_THRESHOLD_RS, NODE_PARAMS, TRANSIT_DAYS, UPLIFT } from './params';
import { daysBetween, fmtDate } from './dates';
import { evaluate, floorToCase, type Eval } from './engine';
import { inr, num } from './format';
import type { Outlet, Position, Recommendation, Sku } from './types';
import { DISTRIBUTOR_BY_ID, OUTLET_BY_ID, SKU_BY_ID } from '@/data/seed';

export interface Ctx {
  positions: Record<string, Position>;
  simDate: string;
  evalOf: (id: string) => Eval;
}

const BUNDLE_PARTNER: Record<string, string> = {
  'lumea-shampoo': 'lumea-conditioner', 'lumea-conditioner': 'lumea-shampoo', 'lumea-serum': 'lumea-shampoo',
  'salon-mask': 'salon-shampoo', 'salon-shampoo': 'salon-mask', 'derma-cleanser': 'derma-cream', 'derma-cream': 'derma-cleanser',
  'derma-sa': 'derma-cream', 'verde-vitc': 'verde-facewash', 'verde-facewash': 'verde-daycream', 'verde-daycream': 'verde-facewash',
  'chroma-ruby': 'chroma-kajal', 'chroma-nude': 'chroma-kajal', 'chroma-f330': 'chroma-mascara', 'chroma-f128': 'chroma-mascara',
  'lumea-burgundy': 'lumea-shampoo', 'lumea-black': 'lumea-shampoo', 'lumea-mocha': 'lumea-shampoo',
};

export function nodeName(nodeId: string) {
  return OUTLET_BY_ID[nodeId]?.name ?? DISTRIBUTOR_BY_ID[nodeId]?.name ?? nodeId;
}

export function distributorOf(p: Position) {
  return p.nodeType === 'distributor' ? p.nodeId : OUTLET_BY_ID[p.nodeId].distributorId;
}

function withUplift(p: Position, factor: number, simDate: string): Position {
  return { ...p, upliftFactor: factor * (p.upliftFactor && p.upliftUntil && p.upliftUntil >= simDate ? p.upliftFactor : 1), upliftUntil: '2099-12-31' };
}

/** Rs of risk removed if this position sells faster by `factor`. */
function upliftGain(p: Position, sku: Sku, e: Eval, factor: number, simDate: string) {
  const after = evaluate(withUplift(p, factor, simDate), sku, simDate);
  return { rs: Math.max(0, e.valueAtRisk - after.valueAtRisk), units: Math.max(0, e.unsold - after.unsold) };
}

export interface Recipient { position: Position; outlet?: Outlet; capacity: number; qty: number; eval: Eval; crossDistributor: boolean }

/**
 * Candidate recipients for at-risk stock: authorised nodes carrying the same SKU.
 * Capacity = what the recipient can sell before ITS buffer date, minus its own older-or-equal stock,
 * so we never push waste downstream.
 */
export function findRecipients(p: Position, e: Eval, ctx: Ctx, surplus: number): Recipient[] {
  const sku = SKU_BY_ID[p.skuId];
  const atRisk = e.batches.find((b) => b.unsold > 0.5) ?? e.batches[0];
  if (!atRisk) return [];
  const dist = distributorOf(p);
  const out: Recipient[] = [];
  for (const q of Object.values(ctx.positions)) {
    if (q.id === p.id || q.skuId !== p.skuId || q.nodeType !== p.nodeType) continue;
    const crossDistributor = distributorOf(q) !== dist;
    if (p.nodeType === 'retailer' && crossDistributor) continue; // retailer transfers stay within the distributor's network
    const qe = ctx.evalOf(q.id);
    if (qe.state === 'NEAR_EXPIRY' || qe.state === 'AGEING_RISK' || qe.state === 'OVERSTOCK' || qe.state === 'DORMANT') continue;
    const msb = NODE_PARAMS[q.nodeType].msb;
    const dte = daysBetween(ctx.simDate, atRisk.expiry);
    const wr = dte - msb - TRANSIT_DAYS;
    const older = q.batches.filter((b) => b.expiry <= atRisk.expiry).reduce((s, b) => s + b.qty, 0);
    const capacity = Math.max(0, Math.floor(qe.v * wr - older));
    const qty = floorToCase(Math.min(surplus, capacity), sku.casePack);
    if (qty <= 0) continue;
    out.push({ position: q, outlet: OUTLET_BY_ID[q.nodeId], capacity, qty, eval: qe, crossDistributor });
  }
  return out.sort((a, b) => {
    const sa = a.eval.state === 'STOCKOUT_RISK' ? 1 : 0;
    const sb = b.eval.state === 'STOCKOUT_RISK' ? 1 : 0;
    return sb - sa || b.capacity - a.capacity;
  });
}

/** Donors for a stock-out: same SKU nodes in the same network holding stock they can't sell in time or don't need. */
function findDonors(p: Position, need: number, ctx: Ctx) {
  const sku = SKU_BY_ID[p.skuId];
  const dist = distributorOf(p);
  const out: { position: Position; qty: number; reason: string }[] = [];
  for (const q of Object.values(ctx.positions)) {
    if (q.id === p.id || q.skuId !== p.skuId || q.nodeType !== p.nodeType) continue;
    if (p.nodeType === 'retailer' && distributorOf(q) !== dist) continue;
    const qe = ctx.evalOf(q.id);
    let surplus = 0;
    let reason = '';
    if (qe.unsold > 0.5) { surplus = qe.unsold; reason = `${num(qe.unsold)} units there won't sell before their buffer date`; }
    else if (qe.state === 'OVERSTOCK' || qe.state === 'DORMANT') { surplus = qe.excessUnits; reason = `${num(qe.doc)} days of cover there`; }
    const qty = floorToCase(Math.min(surplus, need), sku.casePack);
    if (qty > 0) out.push({ position: q, qty, reason });
  }
  return out.sort((a, b) => b.qty - a.qty);
}

function base(p: Position, code: Recommendation['code'], extra: Partial<Recommendation> & Pick<Recommendation, 'level' | 'title' | 'rationale' | 'effect'>): Recommendation {
  return {
    key: `${p.id}::${code}`, positionId: p.id, code, expectedUnits: 0, expectedRs: 0, costRs: 0,
    needsApproval: false, owner: 'rep', instant: false, ...extra,
  };
}

export function recommend(p: Position, ctx: Ctx): Recommendation[] {
  const sku = SKU_BY_ID[p.skuId];
  const e = ctx.evalOf(p.id);
  const recs: Recommendation[] = [];
  const tier = sku.tier;
  const lowConf = e.confBand === 'Low';
  const isDist = p.nodeType === 'distributor';
  const atRiskBatch = e.batches.find((b) => b.unsold > 0.5);

  if (lowConf) {
    recs.push(base(p, 'VERIFY', {
      level: 'L0', title: 'Verify the count and batch first',
      rationale: `This record is a ${p.source === 'retailer_verbal' ? "retailer's verbal estimate" : 'low-confidence estimate'} from ${daysBetween(p.countedAt, ctx.simDate)} days ago. Costly actions stay locked until it's counted.`,
      effect: 'Raises data confidence and unlocks transfers or schemes', instant: true,
    }));
  }

  const transferRec = (): Recommendation | null => {
    const surplus = e.unsold > 0.5 ? e.unsold : e.excessUnits;
    const rcps = findRecipients(p, e, ctx, surplus);
    if (!rcps.length) return null;
    const top = rcps[0];
    const value = top.qty * e.unitValue;
    const rescued = Math.min(top.qty, e.unsold > 0.5 ? e.unsold : top.qty) * e.unitValue;
    const toName = nodeName(top.position.nodeId);
    const stockoutNote = top.eval.state === 'STOCKOUT_RISK' ? ` and is about to run out (${num(top.eval.doc)} days of cover)` : '';
    return base(p, isDist ? 'DIST_TRANSFER' : 'TRANSFER_OUT', {
      key: `${p.id}::TRANSFER`,
      level: 'L3',
      title: `Transfer ${num(top.qty)} units to ${toName}`,
      rationale: `${toName} sells ~${num(top.eval.monthly, 1)}/month${stockoutNote}. It can sell ${num(top.capacity)} units before this batch's buffer date, so the stock sells at full price instead of coming back.`,
      effect: e.unsold > 0.5 ? `Removes ${inr(rescued, false)} of expiry risk; no discount, no return` : `Frees ${inr(value, false)} of slow stock for a faster outlet`,
      expectedUnits: top.qty, expectedRs: rescued, costRs: Math.round(value * 0.03 + 300),
      needsApproval: value > APPROVAL_THRESHOLD_RS || top.crossDistributor, owner: 'distributor',
      transfer: { fromId: p.id, toId: top.position.id, qty: top.qty },
      alternatives: rcps.slice(0, 5).map((r) => ({ toId: r.position.id, label: `${nodeName(r.position.nodeId)} · sells ${num(r.eval.monthly, 1)}/mo · capacity ${num(r.capacity)}`, capacity: r.capacity, qty: r.qty })),
      guardrail: top.crossDistributor ? 'Cross-distributor transfer: ASM approval required.' : undefined,
      locked: lowConf ? 'Verify the count first (data confidence is Low)' : undefined,
    });
  };

  const stopRec = (): Recommendation => {
    const req = p.requestedQty ?? p.habitQty;
    return base(p, isDist ? 'STOP_PRIMARY' : 'STOP_REPLENISH', {
      level: 'L2',
      title: isDist ? 'Pause primary orders for this SKU' : 'Pause replenishment of this SKU here',
      rationale: `${isDist ? 'The distributor' : 'The retailer'} is asking for ${num(req)} more, but ${num(e.unsold > 0.5 ? e.unsold : e.excessUnits)} units already won't sell in time. Keep the range; stop feeding this SKU until stock clears.`,
      effect: `Avoids ${inr(req * e.unitValue, false)} of new at-risk stock`,
      expectedUnits: req, expectedRs: req * e.unitValue, instant: true,
    });
  };

  const upliftRec = (code: 'VISIBILITY' | 'SAMPLING' | 'BUNDLE' | 'PROMO'): Recommendation | null => {
    const u = UPLIFT[code];
    const g = upliftGain(p, sku, e, u.factor, ctx.simDate);
    const partner = SKU_BY_ID[BUNDLE_PARTNER[p.skuId]];
    const value = Math.max(e.unsold, e.excessUnits) * e.unitValue;
    if (code === 'VISIBILITY') {
      return base(p, code, {
        level: 'L1', title: 'Move to eye level / next to the billing counter',
        rationale: p.signals.includes('NOT_ON_SHELF') ? 'It is behind the counter or off-shelf. Shoppers can\'t buy what they can\'t see.' : 'Better facing typically lifts sell-out without any margin cost.',
        effect: g.rs > 0 ? `Est. ${inr(g.rs, false)} less at risk (assumed +${Math.round((u.factor - 1) * 100)}% sell-out for ${u.days} days)` : `Assumed +${Math.round((u.factor - 1) * 100)}% sell-out for ${u.days} days`,
        expectedUnits: g.units, expectedRs: g.rs, instant: true, uplift: u,
      });
    }
    if (code === 'SAMPLING') {
      const title = tier === 'PRO' ? 'Stylist-led trial (add-on treatment)' : tier === 'DERMA' ? 'Chemist sampling sachets + recommendation card' : tier === 'LUXE' ? 'Beauty-advisor day with sample vials' : 'Tester + sampling sachets';
      return base(p, code, {
        level: 'L4', title,
        rationale: p.signals.includes('NO_TESTER') ? 'No working tester; shoppers can\'t try it.' : 'Trial converts shoppers who don\'t know the product.',
        effect: g.rs > 0 ? `Est. ${inr(g.rs, false)} less at risk (assumed +${Math.round((u.factor - 1) * 100)}% for ${u.days} days)` : `Assumed +${Math.round((u.factor - 1) * 100)}% sell-out for ${u.days} days`,
        expectedUnits: g.units, expectedRs: g.rs, costRs: tier === 'LUXE' ? 6000 : 1500, needsApproval: true, owner: 'asm', uplift: u,
      });
    }
    if (code === 'BUNDLE') {
      if (tier === 'LUXE') return null;
      return base(p, code, {
        level: 'L5', title: `Approved bundle with ${partner ? `${partner.brand} ${partner.name}` : 'a fast mover'}`,
        rationale: `Pairs the slow SKU with a fast mover from the approved catalogue, so there's no price cut on the hero product.`,
        effect: `Est. ${inr(g.rs, false)} less at risk (assumed +${Math.round((u.factor - 1) * 100)}% for ${u.days} days)`,
        expectedUnits: g.units, expectedRs: g.rs, costRs: Math.round(value * 0.1), needsApproval: true, owner: 'asm', uplift: u,
        locked: lowConf ? 'Verify the count first (data confidence is Low)' : undefined,
      });
    }
    // PROMO: mass only
    if (tier !== 'MASS') return null;
    return base(p, code, {
      level: 'L6', title: 'Time-boxed approved scheme (21 days)',
      rationale: 'Use only after cheaper steps. From the approved scheme catalogue, never undercutting online price parity.',
      effect: `Est. ${inr(g.rs, false)} less at risk (assumed +${Math.round((u.factor - 1) * 100)}% for ${u.days} days)`,
      expectedUnits: g.units, expectedRs: g.rs, costRs: Math.round(value * 0.15), needsApproval: true, owner: 'asm', uplift: u,
      guardrail: 'Discount is step 6 of 8: brand-dilution and channel-conflict risk.',
      locked: lowConf ? 'Verify the count first (data confidence is Low)' : undefined,
    });
  };

  const eolRec = () =>
    base(p, 'END_OF_LIFE', {
      level: 'L7',
      title: tier === 'LUXE' || tier === 'DERMA' ? "Controlled end-of-life via L'Oréal channel" : 'Controlled end-of-life before expiry',
      rationale: tier === 'LUXE' || tier === 'DERMA'
        ? 'Too late to sell through normally. Route through company-controlled outlets, staff sale or donation, never grey market.'
        : 'Too late to sell through normally. Staff sale, approved off-price partner, or donation, before expiry and never to unauthorised resellers.',
      effect: `Recovers ~50% of ${inr(e.valueAtRisk, false)} and avoids destruction`,
      expectedUnits: e.unsold, expectedRs: e.valueAtRisk * 0.5, costRs: Math.round(e.valueAtRisk * 0.5), needsApproval: true, owner: 'asm',
    });

  const returnRec = () =>
    base(p, 'RETURN', {
      level: 'L8', title: 'Return and record the root cause',
      rationale: 'Last resort. Recording why it failed (scheme load, wrong outlet, damage) feeds the manager and brand view.',
      effect: 'No value recovered; handling cost incurred', expectedUnits: e.unsold, owner: 'distributor',
    });

  const rotateRec = () =>
    base(p, 'ROTATE', {
      level: 'L1', title: 'Rotate shelf: oldest batch to the front (FEFO)',
      rationale: atRiskBatch ? `Batch ${atRiskBatch.code} expires ${fmtDate(atRiskBatch.expiry)}. Make sure it sells before the newer stock.` : 'Make sure the oldest batch sells first.',
      effect: 'Makes the FEFO projection true in practice', instant: true,
    });

  switch (e.state) {
    case 'NEAR_EXPIRY': {
      if (e.window !== null && e.window <= 30) {
        recs.push(eolRec());
        if (tier !== 'LUXE') { const b = upliftRec('BUNDLE'); if (b) recs.push(b); }
        recs.push(returnRec());
      } else {
        const t = transferRec();
        recs.push(stopRec());
        if (t) recs.push(t);
        recs.push(rotateRec());
        const b = upliftRec('BUNDLE'); if (b) recs.push(b);
        const pr = upliftRec('PROMO'); if (pr) recs.push(pr);
      }
      break;
    }
    case 'AGEING_RISK': {
      recs.push(stopRec());
      recs.push(upliftRec('VISIBILITY')!);
      recs.push(upliftRec('SAMPLING')!);
      const t = transferRec(); if (t) recs.push(t);
      recs.push(base(p, 'RANGE_REVIEW', {
        level: 'L2', title: 'Flag range fit to ASM / brand team',
        rationale: 'If this SKU is slow in similar outlets too, the shade or variant may not suit this cluster.',
        effect: 'Feeds assortment and demand planning', instant: true, owner: 'asm',
      }));
      break;
    }
    case 'OVERSTOCK':
    case 'DORMANT': {
      recs.push(base(p, 'DIAGNOSE', {
        level: 'L0', title: 'Diagnose why it is slow (pick a reason)',
        rationale: 'Slow-moving stock with healthy shelf life needs a cause, not a discount.',
        effect: 'Picks the right fix and teaches the system', instant: true,
      }));
      recs.push(upliftRec('VISIBILITY')!);
      recs.push(upliftRec('SAMPLING')!);
      recs.push(stopRec());
      const t = transferRec(); if (t) recs.push(t);
      break;
    }
    case 'STOCKOUT_RISK': {
      const need = Math.max(e.suggestedOrder, Math.ceil(e.v * (NODE_PARAMS[p.nodeType].targetCover + NODE_PARAMS[p.nodeType].lead) - e.qty));
      const donors = findDonors(p, need, ctx);
      let remaining = need;
      if (donors.length) {
        const d = donors[0];
        const de = ctx.evalOf(d.position.id);
        const value = d.qty * de.unitValue;
        remaining = Math.max(0, need - d.qty);
        recs.push(base(p, isDist ? 'DIST_TRANSFER' : 'TRANSFER_IN', {
          key: `${d.position.id}::TRANSFER`,
          level: 'L3', title: `Source ${num(d.qty)} units from ${nodeName(d.position.nodeId)} first`,
          rationale: `${d.reason}. Moving it here fills this gap and rescues their stock in one move.`,
          effect: `Protects ~${num(Math.min(d.qty, e.lostUnits + d.qty))} units of sales and rescues surplus stock`,
          expectedUnits: d.qty, expectedRs: Math.min(d.qty, de.unsold > 0.5 ? de.unsold : d.qty) * de.unitValue, costRs: Math.round(value * 0.03 + 300),
          needsApproval: value > APPROVAL_THRESHOLD_RS || distributorOf(d.position) !== distributorOf(p), owner: 'distributor',
          transfer: { fromId: d.position.id, toId: p.id, qty: d.qty },
        }));
      }
      if (remaining > 0) {
        const q = Math.max(sku.casePack, Math.round(remaining / sku.casePack) * sku.casePack);
        recs.push(base(p, 'REPLENISH', {
          level: 'L2', title: `Replenish ${num(q)} units${donors.length ? ' for the balance' : ''}`,
          rationale: `Sized to ${NODE_PARAMS[p.nodeType].targetCover} days of cover plus lead time at ~${num(e.monthly, 1)}/month, not "same as last time".`,
          effect: `Protects ~${inr(e.lostUnits * e.unitValue, false)} of sales next cycle`, expectedUnits: q, expectedRs: e.lostUnits * e.unitValue, instant: true,
        }));
      }
      break;
    }
    default:
      break;
  }
  return recs;
}

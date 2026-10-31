/**
 * SYNTHETIC DATA. Fictional brands, outlets, people and numbers built to demonstrate the logic.
 * Nothing here comes from L'Oreal systems. Scenario numbers match 07-prototype-spec.md.
 */
import { SIM_START } from '@/lib/params';
import { addDays, batchCodeFor } from '@/lib/dates';
import type { Distributor, Outlet, OutletType, Position, Rep, Sku, Source, SignalCode, Territory } from '@/lib/types';

const sku = (
  id: string, name: string, brand: string, division: Sku['division'], tier: Sku['tier'], category: string,
  casePack: number, ptr: number, shelfLifeMonths: number, i: number,
): Sku => ({ id, ean: `89012${String(34500000 + i * 7919).padStart(8, '0')}`, name, brand, division, tier, category, casePack, ptr, distPrice: Math.round(ptr * 0.9), shelfLifeMonths });

export const SKUS: Sku[] = [
  sku('lumea-shampoo', 'Anti-Hairfall Shampoo 340 ml', 'Lumea', 'Consumer Products', 'MASS', 'Hair care', 6, 210, 36, 1),
  sku('lumea-conditioner', 'Anti-Hairfall Conditioner 175 ml', 'Lumea', 'Consumer Products', 'MASS', 'Hair care', 12, 160, 36, 2),
  sku('lumea-serum', 'Repair Hair Serum 100 ml', 'Lumea', 'Consumer Products', 'MASS', 'Hair care', 12, 290, 24, 3),
  sku('lumea-black', 'Hair Colour Natural Black 3.0', 'Lumea', 'Consumer Products', 'MASS', 'Hair colour', 12, 150, 30, 4),
  sku('lumea-burgundy', 'Hair Colour Burgundy 3.16', 'Lumea', 'Consumer Products', 'MASS', 'Hair colour', 12, 150, 30, 5),
  sku('lumea-mocha', 'Hair Colour Mocha 5.35', 'Lumea', 'Consumer Products', 'MASS', 'Hair colour', 12, 150, 30, 6),
  sku('verde-facewash', 'Hydrating Gel Face Wash 100 ml', 'Verdé', 'Consumer Products', 'MASS', 'Skin care', 12, 180, 30, 7),
  sku('verde-vitc', 'Vitamin C Serum 30 ml', 'Verdé', 'Consumer Products', 'MASS', 'Skin care', 6, 520, 18, 8),
  sku('verde-daycream', 'Bright Day Cream SPF30 50 g', 'Verdé', 'Consumer Products', 'MASS', 'Skin care', 12, 260, 30, 9),
  sku('verde-micellar', 'Micellar Water 400 ml', 'Verdé', 'Consumer Products', 'MASS', 'Skin care', 6, 340, 36, 10),
  sku('verde-sunscreen', 'Sunscreen SPF50 50 ml', 'Verdé', 'Consumer Products', 'MASS', 'Skin care', 12, 330, 24, 11),
  sku('verde-mask', 'Hydra Sheet Mask', 'Verdé', 'Consumer Products', 'MASS', 'Skin care', 24, 80, 24, 12),
  sku('chroma-ruby', 'Matte Lipstick Ruby 301', 'Chroma', 'Consumer Products', 'MASS', 'Makeup', 6, 350, 36, 13),
  sku('chroma-nude', 'Matte Lipstick Nude 105', 'Chroma', 'Consumer Products', 'MASS', 'Makeup', 6, 350, 36, 14),
  sku('chroma-kajal', 'Smudge-proof Kajal', 'Chroma', 'Consumer Products', 'MASS', 'Makeup', 12, 190, 36, 15),
  sku('chroma-f128', 'Foundation Shade 128', 'Chroma', 'Consumer Products', 'MASS', 'Makeup', 6, 550, 30, 16),
  sku('chroma-f330', 'Foundation Shade 330', 'Chroma', 'Consumer Products', 'MASS', 'Makeup', 6, 550, 30, 17),
  sku('chroma-mascara', 'Volume Mascara', 'Chroma', 'Consumer Products', 'MASS', 'Makeup', 6, 450, 24, 18),
  sku('derma-cleanser', 'Hydrating Cleanser 236 ml', 'DermaPure', 'Dermatological Beauty', 'DERMA', 'Derma skin care', 6, 1100, 36, 19),
  sku('derma-cream', 'Moisturising Cream 177 ml', 'DermaPure', 'Dermatological Beauty', 'DERMA', 'Derma skin care', 6, 1250, 36, 20),
  sku('derma-sa', 'SA Smoothing Cleanser 236 ml', 'DermaPure', 'Dermatological Beauty', 'DERMA', 'Derma skin care', 6, 1150, 36, 21),
  sku('salon-mask', 'Bond Repair Mask 200 ml', 'Salon Pro', 'Professional Products', 'PRO', 'Salon hair care', 6, 780, 36, 22),
  sku('salon-shampoo', 'Colour-Protect Shampoo 300 ml', 'Salon Pro', 'Professional Products', 'PRO', 'Salon hair care', 6, 640, 36, 23),
  sku('eclat-edp', 'Eau de Parfum 50 ml', 'Maison Éclat', 'Luxe', 'LUXE', 'Fragrance', 2, 6800, 60, 24),
];

export const SKU_BY_ID: Record<string, Sku> = Object.fromEntries(SKUS.map((s) => [s.id, s]));

export const REPS: Rep[] = [
  { id: 'rep-kunal', name: 'Kunal', territoryId: 't1', title: 'Territory Sales Officer' },
  { id: 'rep-ananya', name: 'Ananya', territoryId: 't2', title: 'Territory Sales Officer' },
  { id: 'rep-farhan', name: 'Farhan', territoryId: 't3', title: 'Territory Sales Officer' },
];

export const MANAGER = { id: 'asm-meera', name: 'Meera', title: 'Area Sales Manager, Mumbai' };

export const TERRITORIES: Territory[] = [
  { id: 't1', name: 'Andheri–Bandra', repId: 'rep-kunal', distributorId: 'd1' },
  { id: 't2', name: 'Malad–Borivali', repId: 'rep-ananya', distributorId: 'd2' },
  { id: 't3', name: 'Powai–Ghatkopar', repId: 'rep-farhan', distributorId: 'd3' },
];

export const DISTRIBUTORS: Distributor[] = [
  { id: 'd1', name: 'Western Suburbs Beauty Distributors', area: 'Andheri E', territoryId: 't1' },
  { id: 'd2', name: 'Northline Distributors', area: 'Kandivali W', territoryId: 't2' },
  { id: 'd3', name: 'Lakeview Trade Links', area: 'Powai', territoryId: 't3' },
];

const outlet = (id: string, name: string, type: OutletType, area: string, t: 1 | 2 | 3, beatOrder: number, owner: string): Outlet =>
  ({ id, name, type, area, territoryId: `t${t}`, distributorId: `d${t}`, beatOrder, owner });

export const OUTLETS: Outlet[] = [
  outlet('o-shree', 'Shree Beauty & Cosmetics', 'cosmetic_store', 'Andheri W', 1, 1, 'Mr. Jain'),
  outlet('o-glow', 'Glow Chemist', 'chemist', 'Lokhandwala', 1, 2, 'Ms. D\'Souza'),
  outlet('o-style', 'Style Corner', 'cosmetic_store', 'Bandra W', 1, 3, 'Mr. Khan'),
  outlet('o-newbharat', 'New Bharat General Store', 'kirana', 'Andheri E', 1, 4, 'Mr. Patel'),
  outlet('o-hairstudio', 'Hair Studio 9', 'salon', 'Bandra W', 1, 5, 'Ms. Fernandes'),
  outlet('o-linking', 'Linking Road Beauty Hub', 'cosmetic_store', 'Bandra W', 1, 6, 'Mr. Shah'),
  outlet('o-saikirana', 'Sai Kirana', 'kirana', 'Malad W', 2, 1, 'Mr. Yadav'),
  outlet('o-carepoint', 'CarePoint Chemist', 'chemist', 'Kandivali W', 2, 2, 'Ms. Nair'),
  outlet('o-borivali', 'Borivali Beauty Mart', 'cosmetic_store', 'Borivali W', 2, 3, 'Mr. Mehta'),
  outlet('o-orchid', 'Orchid Salon', 'salon', 'Borivali W', 2, 4, 'Ms. Kulkarni'),
  outlet('o-gokul', 'Gokul Stores', 'kirana', 'Malad E', 2, 5, 'Mr. Gupta'),
  outlet('o-evershine', 'Evershine Cosmetics', 'cosmetic_store', 'Malad W', 2, 6, 'Ms. Rao'),
  outlet('o-powai', 'Powai Wellness Chemist', 'chemist', 'Powai', 3, 1, 'Mr. Iyer'),
  outlet('o-hiranandani', 'Hiranandani Beauty', 'cosmetic_store', 'Powai', 3, 2, 'Ms. Pillai'),
  outlet('o-ghatkopar', 'Ghatkopar Fancy Stores', 'cosmetic_store', 'Ghatkopar W', 3, 3, 'Mr. Doshi'),
  outlet('o-glamour', 'Glamour Salon', 'salon', 'Ghatkopar E', 3, 4, 'Ms. Sheikh'),
  outlet('o-galleria', 'Galleria Counter', 'dept_store', 'Powai', 3, 5, 'Store manager'),
  outlet('o-vikhroli', 'Vikhroli Kirana', 'kirana', 'Vikhroli', 3, 6, 'Mr. Pawar'),
];

export const OUTLET_BY_ID: Record<string, Outlet> = Object.fromEntries(OUTLETS.map((o) => [o.id, o]));
export const DISTRIBUTOR_BY_ID: Record<string, Distributor> = Object.fromEntries(DISTRIBUTORS.map((d) => [d.id, d]));
export const REP_BY_ID: Record<string, Rep> = Object.fromEntries(REPS.map((r) => [r.id, r]));
export const TERRITORY_BY_ID: Record<string, Territory> = Object.fromEntries(TERRITORIES.map((t) => [t.id, t]));

export const OUTLET_TYPE_LABEL: Record<OutletType, string> = {
  cosmetic_store: 'Cosmetic store', chemist: 'Chemist', kirana: 'Kirana', salon: 'Salon', dept_store: 'Dept. store counter',
};

const ASSORTMENT: Record<OutletType, string[]> = {
  cosmetic_store: ['lumea-shampoo', 'lumea-conditioner', 'lumea-serum', 'lumea-black', 'lumea-burgundy', 'verde-facewash', 'verde-vitc', 'verde-daycream', 'verde-micellar', 'verde-sunscreen', 'verde-mask', 'chroma-ruby', 'chroma-nude', 'chroma-kajal', 'chroma-f128', 'chroma-mascara'],
  chemist: ['lumea-shampoo', 'lumea-conditioner', 'lumea-serum', 'verde-facewash', 'verde-vitc', 'verde-daycream', 'verde-micellar', 'verde-sunscreen', 'derma-cleanser', 'derma-cream', 'derma-sa'],
  kirana: ['lumea-shampoo', 'lumea-conditioner', 'lumea-black', 'lumea-burgundy', 'verde-facewash', 'verde-daycream', 'verde-mask', 'chroma-kajal'],
  salon: ['salon-mask', 'salon-shampoo', 'lumea-serum', 'lumea-black', 'lumea-burgundy', 'lumea-mocha', 'verde-mask'],
  dept_store: ['eclat-edp', 'derma-cleanser', 'derma-cream', 'chroma-f128', 'chroma-ruby', 'chroma-nude', 'chroma-mascara', 'verde-vitc', 'verde-micellar'],
};

const BASE_MONTHLY: Record<string, number> = {
  'lumea-shampoo': 22, 'lumea-conditioner': 12, 'lumea-serum': 6, 'lumea-black': 14, 'lumea-burgundy': 6, 'lumea-mocha': 5,
  'verde-facewash': 25, 'verde-vitc': 6, 'verde-daycream': 10, 'verde-micellar': 8, 'verde-sunscreen': 9, 'verde-mask': 20,
  'chroma-ruby': 8, 'chroma-nude': 9, 'chroma-kajal': 18, 'chroma-f128': 5, 'chroma-f330': 3, 'chroma-mascara': 6,
  'derma-cleanser': 8, 'derma-cream': 7, 'derma-sa': 5, 'salon-mask': 6, 'salon-shampoo': 7, 'eclat-edp': 2,
};

const TYPE_MULT: Record<OutletType, number> = { cosmetic_store: 1, chemist: 1.1, kirana: 0.6, salon: 0.6, dept_store: 0.8 };

/** Deterministic PRNG so every judge sees the same "synthetic" world. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const D0 = SIM_START;
const exp = (daysAhead: number) => addDays(D0, daysAhead);
const mfgCode = (daysAhead: number, shelfMonths: number) => batchCodeFor(addDays(D0, daysAhead - shelfMonths * 30));

export const posId = (nodeId: string, skuId: string) => `${nodeId}::${skuId}`;

interface Override {
  batches: [number, number][]; // [daysToExpiry, qty]
  monthly: number;
  signals?: SignalCode[];
  source?: Source;
  countedDaysAgo?: number;
  requested?: number;
  history?: number[];
}

/** Hand-built scenarios (S1–S7 from the spec plus supporting flags). Numbers verified with model/risk_engine_reference.py. */
const OVERRIDES: Record<string, Override> = {
  // S1 near-expiry excess, loaded via a festive scheme
  [posId('o-shree', 'lumea-shampoo')]: { batches: [[105, 120]], monthly: 20, signals: ['CARTONS'], countedDaysAgo: 12, requested: 24 },
  // S3a stock-out risk on the same SKU, same distributor -> hero rebalance
  [posId('o-glow', 'lumea-shampoo')]: { batches: [[400, 20]], monthly: 75, source: 'scan', countedDaysAgo: 3, requested: 24 },
  // S5 poor visibility / weak demand
  [posId('o-style', 'chroma-ruby')]: { batches: [[540, 30]], monthly: 4, signals: ['NOT_ON_SHELF', 'NO_TESTER'], countedDaysAgo: 10, requested: 6 },
  // S6 low-confidence data
  [posId('o-newbharat', 'lumea-conditioner')]: { batches: [[260, 40]], monthly: 4, source: 'retailer_verbal', countedDaysAgo: 40, requested: 12 },
  // Supporting: burgundy ageing in a kirana
  [posId('o-newbharat', 'lumea-burgundy')]: { batches: [[150, 30]], monthly: 6, countedDaysAgo: 14 },
  // Supporting: kajal overstock at New Bharat that can cover Linking Road's stock-out
  [posId('o-newbharat', 'chroma-kajal')]: { batches: [[650, 48]], monthly: 6, signals: ['DUST'], countedDaysAgo: 14, requested: 12 },
  [posId('o-linking', 'chroma-kajal')]: { batches: [[700, 8]], monthly: 40, countedDaysAgo: 5, requested: 12 },
  // Supporting: salon near-expiry (Pro tier, no price promos)
  [posId('o-hairstudio', 'salon-mask')]: { batches: [[90, 14]], monthly: 3, countedDaysAgo: 9, requested: 6 },
  // Repeat offender: dark foundation shade ageing in three outlets
  [posId('o-shree', 'chroma-f330')]: { batches: [[400, 18]], monthly: 1, countedDaysAgo: 12 },
  [posId('o-borivali', 'chroma-f330')]: { batches: [[300, 14]], monthly: 1, countedDaysAgo: 8 },
  [posId('o-hiranandani', 'chroma-f330')]: { batches: [[350, 16]], monthly: 1.2, countedDaysAgo: 6 },
  // S2 slow-moving with healthy shelf life (assortment mismatch)
  [posId('o-saikirana', 'verde-vitc')]: { batches: [[480, 24]], monthly: 3, signals: ['NOT_ASKED'], countedDaysAgo: 6, requested: 6 },
  [posId('o-carepoint', 'verde-vitc')]: { batches: [[470, 20]], monthly: 30, source: 'scan', countedDaysAgo: 4 },
  // Supporting: derma stock-out at chemist, no donor nearby
  [posId('o-carepoint', 'derma-cream')]: { batches: [[800, 4]], monthly: 20, source: 'scan', countedDaysAgo: 4, requested: 6 },
  // Supporting: seasonal overstock (sunscreen in winter)
  [posId('o-evershine', 'verde-sunscreen')]: { batches: [[600, 60]], monthly: 6, signals: ['CARTONS', 'QCOMM_SHIFT'], countedDaysAgo: 11, requested: 12 },
  // S3b high-demand stock-out with no surplus nearby
  [posId('o-powai', 'verde-facewash')]: { batches: [[300, 12]], monthly: 60, source: 'scan', countedDaysAgo: 2, requested: 24 },
  [posId('o-ghatkopar', 'lumea-burgundy')]: { batches: [[95, 28]], monthly: 7, countedDaysAgo: 10 },
  // S7 Luxe guardrail
  [posId('o-galleria', 'eclat-edp')]: { batches: [[270, 8]], monthly: 0.6, countedDaysAgo: 7 },
  // Quick commerce / channel shift: outlet sell-out falling while the brand grows online in Mumbai
  [posId('o-shree', 'chroma-mascara')]: { batches: [[600, 10]], monthly: 5, history: [9, 7, 5], countedDaysAgo: 12, requested: 12 },
  [posId('o-linking', 'lumea-serum')]: { batches: [[500, 24]], monthly: 7, history: [12, 9, 7], countedDaysAgo: 5, requested: 12 },
  [posId('o-hiranandani', 'verde-micellar')]: { batches: [[600, 18]], monthly: 8, history: [14, 11, 8], countedDaysAgo: 6, requested: 12 },
  [posId('o-borivali', 'verde-daycream')]: { batches: [[700, 20]], monthly: 9, history: [15, 12, 9], countedDaysAgo: 8, requested: 24 },
  // Supporting: dormant SKU in a kirana
  [posId('o-vikhroli', 'verde-micellar')]: { batches: [[500, 10]], monthly: 0, signals: ['NO_MOVEMENT'], countedDaysAgo: 15 },
  // S4 distributor hidden near-expiry (totals look like "just overstock") and the D2 distributor that needs it
  [posId('d1', 'lumea-burgundy')]: { batches: [[200, 900], [520, 1200]], monthly: 300, source: 'dms', countedDaysAgo: 2, requested: 600 },
  [posId('d2', 'lumea-burgundy')]: { batches: [[500, 120]], monthly: 500, source: 'dms', countedDaysAgo: 2, requested: 300 },
};

/** Which outlets carry which SKUs beyond their default assortment (scenario-driven). */
const EXTRA_CARRY: [string, string][] = [
  ['o-shree', 'chroma-f330'], ['o-borivali', 'chroma-f330'], ['o-hiranandani', 'chroma-f330'],
  ['o-saikirana', 'verde-vitc'], ['o-vikhroli', 'verde-micellar'],
];

function healthyBatches(rand: () => number, qty: number, s: Sku): [number, number][] {
  const maxLife = s.shelfLifeMonths * 30;
  const near = Math.min(maxLife - 60, Math.round(240 + rand() * 300));
  if (qty < 8) return [[near, qty]];
  const older = Math.round(qty * 0.4);
  const far = Math.min(maxLife - 30, near + Math.round(90 + rand() * 180));
  return [[near, older], [far, qty - older]];
}

function makePosition(nodeId: string, nodeType: Position['nodeType'], s: Sku, o: Override): Position {
  const batches = o.batches.map(([d, q]) => ({ code: mfgCode(d, s.shelfLifeMonths), expiry: exp(d), qty: q }));
  // Business-as-usual re-order: the retailer's habitual ask if we know it, else roughly a month of sales
  const habit = o.requested ?? Math.max(s.casePack, Math.round((o.monthly * (nodeType === 'retailer' ? 1 : 0.75)) / s.casePack) * s.casePack);
  return {
    id: posId(nodeId, s.id), nodeId, nodeType, skuId: s.id, batches, monthlySales: o.monthly,
    source: o.source ?? (nodeType === 'distributor' ? 'dms' : 'manual_count'),
    countedAt: addDays(D0, -(o.countedDaysAgo ?? 10)), signals: o.signals ?? [],
    requestedQty: o.requested, habitQty: habit, history: o.history,
  };
}

export function buildPositions(): Record<string, Position> {
  const rand = mulberry32(20261102);
  const out: Record<string, Position> = {};
  const carry: Record<string, Set<string>> = {};

  for (const ol of OUTLETS) carry[ol.id] = new Set(ASSORTMENT[ol.type]);
  for (const [oid, sid] of EXTRA_CARRY) carry[oid].add(sid);

  const distMonthly: Record<string, Record<string, number>> = { d1: {}, d2: {}, d3: {} };

  for (const ol of OUTLETS) {
    for (const sid of carry[ol.id]) {
      const s = SKU_BY_ID[sid];
      const id = posId(ol.id, sid);
      let o = OVERRIDES[id];
      if (!o) {
        const monthly = Math.max(1, Math.round(BASE_MONTHLY[sid] * TYPE_MULT[ol.type] * (0.7 + rand() * 0.6)));
        const cover = 18 + rand() * 22; // healthy: between reorder point and overstock threshold
        const qty = Math.max(2, Math.round((monthly / 30) * cover));
        o = { batches: healthyBatches(rand, qty, s), monthly, countedDaysAgo: 3 + Math.floor(rand() * 18) };
      }
      out[id] = makePosition(ol.id, 'retailer', s, o);
      distMonthly[ol.distributorId][sid] = (distMonthly[ol.distributorId][sid] ?? 0) + o.monthly;
    }
  }

  // Distributors serve ~25x more outlets than the six we model per beat.
  for (const d of DISTRIBUTORS) {
    for (const [sid, m] of Object.entries(distMonthly[d.id])) {
      const s = SKU_BY_ID[sid];
      const id = posId(d.id, sid);
      let o = OVERRIDES[id];
      if (!o) {
        const monthly = Math.max(10, Math.round(m * 25));
        const cover = 15 + rand() * 12;
        const qty = Math.round((monthly / 30) * cover);
        const near = Math.min(s.shelfLifeMonths * 30 - 60, Math.round(300 + rand() * 200));
        o = { batches: [[near, Math.round(qty * 0.45)], [Math.min(s.shelfLifeMonths * 30 - 30, near + 150), qty - Math.round(qty * 0.45)]], monthly, source: 'dms', countedDaysAgo: 1 };
      }
      out[id] = makePosition(d.id, 'distributor', s, o);
    }
  }
  return out;
}

/** Representative monthly secondary-sales attainment for the scorecard (synthetic). */
export const REP_TARGET_ATTAINMENT: Record<string, number> = { 'rep-kunal': 0.96, 'rep-ananya': 1.03, 'rep-farhan': 0.91 };

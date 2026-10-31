import type { SignalCode, Source } from './types';

/** All parameters are ASSUMPTIONS to be calibrated with L'Oreal in a pilot (see 08-risk-methodology.md). */
export const SIM_START = '2026-11-02';

export const NODE_PARAMS = {
  retailer: { msb: 30, targetCover: 30, lead: 7, safety: 7, overstockMult: 2 },
  distributor: { msb: 120, targetCover: 21, lead: 7, safety: 5, overstockMult: 2 },
} as const;

export const SOURCE_WEIGHT: Record<Source, number> = {
  scan: 1, dms: 1, manual_count: 0.85, retailer_verbal: 0.5, estimate: 0.4,
};

export const SOURCE_LABEL: Record<Source, string> = {
  scan: 'Barcode scan', dms: 'Distributor DMS', manual_count: 'Manual count',
  retailer_verbal: "Retailer's estimate", estimate: 'System estimate',
};

export const TRANSIT_DAYS = 3;

/**
 * Quick commerce / channel shift (ASSUMPTIONS). A SKU is "shifting online" at an outlet when its sell-out there
 * fell by 20%+ over three months while the brand's online (mostly quick-commerce) sales in the city grew 20%+.
 * Where that happens the order guardrail uses a tighter cover norm, so general trade is not stocked at old volumes.
 */
export const CHANNEL_SHIFT = { outletDecline: 0.8, cityGrowth: 0.2, coverFactor: 0.7, signalVelocityAdj: 0.85 } as const;

/** Synthetic: quarter-on-quarter growth of each SKU's online + quick-commerce sales in Mumbai. */
export const QCOMM_CITY_GROWTH: Record<string, number> = {
  'verde-micellar': 0.41, 'chroma-mascara': 0.35, 'lumea-serum': 0.32, 'verde-sunscreen': 0.3, 'verde-daycream': 0.28,
  'verde-vitc': 0.26, 'derma-cleanser': 0.24, 'derma-cream': 0.22, 'chroma-f128': 0.18, 'verde-facewash': 0.16,
};
export const QCOMM_DEFAULT_GROWTH = 0.1;
export const APPROVAL_THRESHOLD_RS = 10000;
export const SIGNAL_VELOCITY_ADJ = 0.7;
export const PACKAGING_KG_PER_UNIT = 0.04;

/** Assumed sell-out uplift from each intervention, applied to the affected position. Calibrate in pilot. */
export const UPLIFT = {
  VISIBILITY: { factor: 1.2, days: 60 },
  SAMPLING: { factor: 1.35, days: 60 },
  BUNDLE: { factor: 1.5, days: 45 },
  PROMO: { factor: 1.8, days: 21 },
} as const;

export const SIGNALS: { code: SignalCode; label: string; hint: string }[] = [
  { code: 'DUST', label: 'Dust / faded packs', hint: 'Not moved in weeks; lowers the sales estimate' },
  { code: 'CARTONS', label: 'Unopened outer cartons', hint: 'Over-ordered, often scheme-led' },
  { code: 'NO_MOVEMENT', label: 'Same count as last visit', hint: 'Zero sell-out since last visit' },
  { code: 'FEFO_WRONG', label: 'Old batch hidden at back', hint: 'FEFO not followed' },
  { code: 'OLD_MRP', label: 'Old MRP / old pack design', hint: 'Old stock; MT may reject' },
  { code: 'NOT_ON_SHELF', label: 'Not on shelf / behind counter', hint: 'Visibility problem' },
  { code: 'NO_TESTER', label: 'No / damaged tester', hint: 'Weak conversion' },
  { code: 'NOT_ASKED', label: '"Customers don\'t ask for it"', hint: 'Assortment mismatch' },
  { code: 'RETURN_REQUEST', label: 'Retailer wants to return', hint: 'Imminent return' },
  { code: 'DAMAGED', label: 'Dented / leaking / heat-damaged', hint: 'Handling or storage issue' },
  { code: 'COMPETITOR_SCHEME', label: 'Competitor running heavy scheme', hint: 'Demand diverted' },
  { code: 'SHOPPER_ASKED', label: 'Shopper asked for out-of-stock item', hint: 'Lost sale' },
  { code: 'QCOMM_SHIFT', label: 'Shoppers say they buy it on quick commerce', hint: 'Channel shift: GT velocity falling, so resize orders and rebalance' },
];

export const DIAGNOSIS_REASONS = [
  'Wrong outlet profile (premium SKU in value outlet)',
  'Poor placement / not visible',
  'No tester or low awareness',
  'Price gap vs competitor',
  'Shade / variant mismatch',
  'Seasonal (off-season)',
  'New launch not yet adopted',
];

export const REJECT_REASONS = [
  'Retailer refused',
  'Already done',
  'Data looks wrong',
  'Not suitable for this brand',
  'Cost too high for value',
  'Other',
];

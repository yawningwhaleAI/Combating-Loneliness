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

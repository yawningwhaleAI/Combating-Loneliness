export type Tier = 'MASS' | 'PRO' | 'DERMA' | 'LUXE';
export type Division = 'Consumer Products' | 'Professional Products' | 'Dermatological Beauty' | 'Luxe';
export type NodeType = 'retailer' | 'distributor';
export type Source = 'scan' | 'dms' | 'manual_count' | 'retailer_verbal' | 'estimate';
export type RiskState = 'NEAR_EXPIRY' | 'AGEING_RISK' | 'STOCKOUT_RISK' | 'DORMANT' | 'OVERSTOCK' | 'HEALTHY';
export type OutletType = 'cosmetic_store' | 'chemist' | 'kirana' | 'salon' | 'dept_store';
export type Role = 'rep' | 'manager' | 'distributor';

export type SignalCode =
  | 'DUST' | 'CARTONS' | 'NO_MOVEMENT' | 'FEFO_WRONG' | 'OLD_MRP' | 'NOT_ON_SHELF'
  | 'NO_TESTER' | 'NOT_ASKED' | 'RETURN_REQUEST' | 'DAMAGED' | 'COMPETITOR_SCHEME' | 'SHOPPER_ASKED';

export interface Sku {
  id: string;
  ean: string;
  name: string;
  brand: string;
  division: Division;
  tier: Tier;
  category: string;
  casePack: number;
  ptr: number;        // price to retailer (Rs/unit), used to value retailer stock
  distPrice: number;  // distributor landing price (Rs/unit), used to value distributor stock
  shelfLifeMonths: number;
}

export interface Territory { id: string; name: string; repId: string; distributorId: string }
export interface Rep { id: string; name: string; territoryId: string; title: string }
export interface Distributor { id: string; name: string; area: string; territoryId: string }
export interface Outlet {
  id: string; name: string; type: OutletType; area: string;
  distributorId: string; territoryId: string; beatOrder: number; owner: string;
}

export interface Batch { code: string; expiry: string; qty: number }

export interface Position {
  id: string;
  nodeId: string;
  nodeType: NodeType;
  skuId: string;
  batches: Batch[];
  monthlySales: number;   // best estimate of sell-out (retailer) or secondary sales (distributor), units / 30 days
  source: Source;
  countedAt: string;
  signals: SignalCode[];
  requestedQty?: number;  // what the retailer/distributor is asking for at the next order
  habitQty: number;       // what they typically re-order ("same as last time")
  upliftFactor?: number;
  upliftUntil?: string;
  paused?: boolean;       // replenishment paused by an accepted guardrail
}

export type ActionCode =
  | 'VERIFY' | 'ROTATE' | 'VISIBILITY' | 'STOP_REPLENISH' | 'TRANSFER_OUT' | 'TRANSFER_IN'
  | 'SAMPLING' | 'BUNDLE' | 'PROMO' | 'END_OF_LIFE' | 'RETURN' | 'REPLENISH' | 'DIAGNOSE'
  | 'RANGE_REVIEW' | 'STOP_PRIMARY' | 'DIST_TRANSFER';

export type Level = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7' | 'L8';
export type Owner = 'rep' | 'distributor' | 'asm' | 'brand';

export interface Transfer { fromId: string; toId: string; qty: number }

export interface Recommendation {
  key: string;            // stable per position+code (+recipient)
  positionId: string;
  code: ActionCode;
  level: Level;
  title: string;
  rationale: string;
  effect: string;
  expectedUnits: number;
  expectedRs: number;     // risk reduced / sales protected (Rs)
  costRs: number;
  needsApproval: boolean;
  owner: Owner;
  instant: boolean;       // rep can do it on the spot
  locked?: string;        // reason it can't be accepted yet
  transfer?: Transfer;
  alternatives?: { toId: string; label: string; capacity: number; qty: number }[];
  uplift?: { factor: number; days: number };
  guardrail?: string;
}

export type ActionStatus = 'awaiting_approval' | 'in_progress' | 'done' | 'verified' | 'rejected';

export interface ActionOutcome {
  rsRescued: number;      // value at risk removed (Rs)
  riskAvoided: number;    // new risk prevented (e.g. orders not loaded)
  unitsMoved: number;
  estimated: boolean;
  at: string;
  note: string;
}

export interface Action {
  id: string;
  recKey: string;
  positionId: string;
  code: ActionCode;
  level: Level;
  title: string;
  rationale: string;
  owner: Owner;
  needsApproval: boolean;
  status: ActionStatus;
  createdAt: string;
  createdBy: string;      // rep id
  expectedRs: number;
  costRs: number;
  unitValue: number;
  unsoldBefore: number;
  riskBefore: number;
  transfer?: Transfer;
  uplift?: { factor: number; days: number };
  reasonCode?: string;
  note?: string;
  decisionNote?: string;
  guardrail?: string;
  outcome?: ActionOutcome;
  synthetic?: boolean;
  log: { at: string; text: string }[];
}

export interface OrderLine { skuId: string; positionId: string; requested: number; suggested: number; final: number; overrideReason?: string }

export interface Visit {
  id: string;
  outletId: string;
  repId: string;
  date: string;
  status: 'in_progress' | 'done';
  countedPositionIds: string[];
  orderLines: OrderLine[];
  riskBefore: number;
  riskAfter?: number;
}

export interface Delivery { positionId: string; qty: number; arrive: string; kind: 'order' | 'auto' }

export interface Counters {
  expiredUnits: number; expiredValue: number;
  lostUnits: number; lostValue: number;
  soldValue: number;
  liquidatedValue: number;
}

export interface World {
  positions: Record<string, Position>;
  deliveries: Delivery[];
  counters: Counters;
  initialOrdersApplied: boolean;
  lostBy?: Record<string, number>;
  expiredBy?: Record<string, number>;
}

export interface Snapshot {
  day: number;
  date: string;
  atRisk: number;
  nearExpiryPct: number;
  stockouts: number;
  rescued: number;
  synthetic?: boolean;
  smartExpired?: number;
  bauExpired?: number;
  smartLost?: number;
  bauLost?: number;
}

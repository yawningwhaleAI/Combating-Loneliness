'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SIM_START } from '@/lib/params';
import { addDays, daysBetween } from '@/lib/dates';
import { evaluate, totalQty } from '@/lib/engine';
import { computeKpis, evalAll } from '@/lib/kpis';
import { advance as runAdvance, applyAction, isInstant, newWorld } from '@/lib/simulate';
import type { Action, Batch, OrderLine, Position, Recommendation, Role, SignalCode, Snapshot, Source, Visit, World } from '@/lib/types';
import { buildPositions, OUTLET_BY_ID, posId, SKU_BY_ID } from '@/data/seed';

export type GuideFlag =
  | 'role' | 'visit' | 'count' | 'whatif' | 'accept' | 'order' | 'approve' | 'advance' | 'outcomes';

interface Toast { id: number; text: string; tone: 'ok' | 'warn' | 'err' }

export interface AppState {
  role: Role;
  repId: string;
  distributorId: string;
  simDate: string;
  simDay: number;
  smart: World;
  bau: World;
  actions: Action[];
  visits: Visit[];
  history: Snapshot[];
  guide: Partial<Record<GuideFlag, boolean>>;
  guideOpen: boolean;
  toast: Toast | null;

  setRole: (r: Role) => void;
  setRep: (id: string) => void;
  setDistributor: (id: string) => void;
  startVisit: (outletId: string) => string;
  saveCount: (positionId: string, data: { batches: Batch[]; signals: SignalCode[]; source: Source; monthlySales?: number }) => string | null;
  applyWhatIf: (positionId: string, data: { batches: Batch[]; monthlySales: number }) => void;
  acceptRec: (rec: Recommendation, mods?: { qty?: number; toId?: string; note?: string; reasonCode?: string }) => Action;
  rejectRec: (rec: Recommendation, reasonCode: string, note?: string) => void;
  decide: (actionId: string, approve: boolean, note?: string, qty?: number) => void;
  executeNow: (actionId: string) => void;
  placeOrder: (visitId: string, lines: OrderLine[]) => void;
  completeVisit: (visitId: string) => void;
  advance: (days: number) => void;
  notifyBrand: (skuId: string, count: number) => void;
  reset: () => void;
  markGuide: (f: GuideFlag) => void;
  setGuideOpen: (o: boolean) => void;
  showToast: (text: string, tone?: Toast['tone']) => void;
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

/** localStorage can be missing or throw (private windows, previews). Fall back to memory so the demo still runs. */
const memory = new Map<string, string>();
const safeStorage = {
  getItem: (k: string) => { try { return window.localStorage.getItem(k); } catch { return memory.get(k) ?? null; } },
  setItem: (k: string, v: string) => { try { window.localStorage.setItem(k, v); } catch { memory.set(k, v); } },
  removeItem: (k: string) => { try { window.localStorage.removeItem(k); } catch { memory.delete(k); } },
};

let idSeq = 1;
const newId = (p: string) => `${p}-${Date.now().toString(36)}-${(idSeq++).toString(36)}`;

function riskAt(positions: Record<string, Position>, date: string, filter?: (p: Position) => boolean) {
  return computeKpis(positions, evalAll(positions, date), filter);
}

function seedActions(positions: Record<string, Position>): Action[] {
  const d = SIM_START;
  const luxe = positions[posId('o-galleria', 'eclat-edp')];
  const le = evaluate(luxe, SKU_BY_ID[luxe.skuId], d);
  const mk = (over: Partial<Action> & Pick<Action, 'id' | 'positionId' | 'code' | 'title' | 'status' | 'createdBy'>): Action => ({
    recKey: `${over.positionId}::${over.code}`, level: 'L1', rationale: '', owner: 'rep', needsApproval: false,
    createdAt: addDays(d, -10), expectedRs: 0, costRs: 0, unitValue: 0, unsoldBefore: 0, riskBefore: 0, log: [], ...over,
  });
  return [
    mk({
      id: 'a-seed-luxe', positionId: luxe.id, code: 'PROMO', level: 'L6', title: 'Request 25% price-off on Maison Éclat EDP 50 ml',
      rationale: 'Retailer says it is slow and wants a discount to clear it.', status: 'awaiting_approval', createdBy: 'rep-farhan',
      createdAt: addDays(d, -1), owner: 'asm', needsApproval: true, expectedRs: le.valueAtRisk * 0.6, costRs: le.qty * 6800 * 0.25,
      unitValue: 6800, unsoldBefore: le.unsold, riskBefore: le.valueAtRisk,
      guardrail: 'Luxe tier: price promotions are not permitted by the playbook. Suggest a beauty-advisor day, sample vials or a transfer instead.',
      log: [{ at: addDays(d, -1), text: 'Requested by Farhan' }],
    }),
    // Synthetic history so the team scorecard has something to compare against
    mk({ id: 'a-seed-1', positionId: posId('o-borivali', 'lumea-shampoo'), code: 'ROTATE', title: 'Rotate shelf (FEFO)', status: 'verified', createdBy: 'rep-ananya', synthetic: true, outcome: { rsRescued: 0, riskAvoided: 0, unitsMoved: 0, estimated: false, at: addDays(d, -8), note: 'Synthetic history' } }),
    mk({ id: 'a-seed-2', positionId: posId('o-gokul', 'verde-mask'), code: 'TRANSFER_OUT', level: 'L3', title: 'Transfer 24 units to Evershine Cosmetics', status: 'verified', createdBy: 'rep-ananya', owner: 'distributor', synthetic: true, outcome: { rsRescued: 1920, riskAvoided: 0, unitsMoved: 24, estimated: false, at: addDays(d, -6), note: 'Synthetic history' } }),
    mk({ id: 'a-seed-3', positionId: posId('o-evershine', 'chroma-nude'), code: 'VISIBILITY', title: 'Move to eye level', status: 'verified', createdBy: 'rep-ananya', synthetic: true, outcome: { rsRescued: 1400, riskAvoided: 0, unitsMoved: 0, estimated: true, at: addDays(d, -5), note: 'Synthetic history' } }),
    mk({ id: 'a-seed-4', positionId: posId('o-hiranandani', 'chroma-nude'), code: 'SAMPLING', level: 'L4', title: 'Tester + sampling sachets', status: 'in_progress', createdBy: 'rep-farhan', owner: 'asm', synthetic: true }),
    mk({ id: 'a-seed-5', positionId: posId('o-glamour', 'salon-shampoo'), code: 'DIAGNOSE', level: 'L0', title: 'Diagnose why it is slow', status: 'rejected', createdBy: 'rep-farhan', synthetic: true, reasonCode: 'Retailer refused' }),
  ];
}

function seedHistory(positions: Record<string, Position>): Snapshot[] {
  const k = riskAt(positions, SIM_START);
  const pts: Snapshot[] = [];
  for (let i = 6; i >= 1; i--) {
    const f = 1 - i * 0.035;
    pts.push({ day: -i * 14, date: addDays(SIM_START, -i * 14), atRisk: k.atRisk * f, nearExpiryPct: k.nearExpiryPct * f, stockouts: Math.max(1, k.stockouts - (i % 3)), rescued: 0, synthetic: true });
  }
  pts.push({ day: 0, date: SIM_START, atRisk: k.atRisk, nearExpiryPct: k.nearExpiryPct, stockouts: k.stockouts, rescued: 0, smartExpired: 0, bauExpired: 0, smartLost: 0, bauLost: 0 });
  return pts;
}

function initialData() {
  const positions = buildPositions();
  return {
    role: 'rep' as Role,
    repId: 'rep-kunal',
    distributorId: 'd1',
    simDate: SIM_START,
    simDay: 0,
    smart: newWorld(positions),
    bau: newWorld(positions),
    actions: seedActions(positions),
    visits: [] as Visit[],
    history: seedHistory(positions),
    guide: {},
    guideOpen: false,
    toast: null,
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData(),

      setRole: (r) => { set({ role: r }); get().markGuide('role'); },
      setRep: (id) => set({ repId: id }),
      setDistributor: (id) => set({ distributorId: id }),

      startVisit: (outletId) => {
        const s = get();
        const existing = s.visits.find((v) => v.outletId === outletId && v.status === 'in_progress');
        if (existing) return existing.id;
        const risk = riskAt(s.smart.positions, s.simDate, (p) => p.nodeId === outletId);
        const v: Visit = { id: newId('v'), outletId, repId: s.repId, date: s.simDate, status: 'in_progress', countedPositionIds: [], orderLines: [], riskBefore: risk.atRisk + risk.lostSalesRisk };
        set({ visits: [...s.visits, v] });
        get().markGuide('visit');
        return v.id;
      },

      saveCount: (positionId, data) => {
        const s = get();
        const smart = clone(s.smart);
        const p = smart.positions[positionId];
        if (!p) return null;
        const expected = totalQty(p);
        const counted = data.batches.reduce((t, b) => t + b.qty, 0);
        let note: string | null = null;
        // Stock-flow sell-out: if the shelf holds less than expected, more sold than we thought (and vice versa).
        const daysSince = Math.max(1, daysBetween(p.countedAt, s.simDate));
        if (data.monthlySales !== undefined) {
          p.monthlySales = data.monthlySales;
        } else if (counted !== expected && daysSince >= 7) {
          const implied = p.monthlySales + ((expected - counted) / daysSince) * 30;
          const blended = Math.max(0, Math.round((p.monthlySales * 0.5 + implied * 0.5) * 10) / 10);
          note = `Sell-out estimate updated from ${p.monthlySales} to ${blended}/month (stock-flow: expected ${expected}, counted ${counted}).`;
          p.monthlySales = blended;
        }
        p.batches = data.batches.filter((b) => b.qty > 0).map((b) => ({ ...b }));
        p.signals = data.signals;
        p.source = data.source;
        p.countedAt = s.simDate;
        const visits = s.visits.map((v) =>
          v.outletId === p.nodeId && v.status === 'in_progress' && !v.countedPositionIds.includes(positionId)
            ? { ...v, countedPositionIds: [...v.countedPositionIds, positionId] } : v);
        set({ smart, visits });
        get().markGuide('count');
        return note;
      },

      applyWhatIf: (positionId, data) => {
        const s = get();
        const smart = clone(s.smart);
        const p = smart.positions[positionId];
        if (!p) return;
        p.batches = data.batches.filter((b) => b.qty > 0);
        p.monthlySales = data.monthlySales;
        p.source = 'manual_count';
        p.countedAt = s.simDate;
        set({ smart });
        get().showToast('Stock record updated. Every dashboard now reflects these values.');
      },

      acceptRec: (rec, mods) => {
        const s = get();
        const smart = clone(s.smart);
        const p = smart.positions[rec.positionId];
        const e = evaluate(p, SKU_BY_ID[p.skuId], s.simDate);
        let transfer = rec.transfer ? { ...rec.transfer } : undefined;
        let title = rec.title;
        let expectedRs = rec.expectedRs;
        if (transfer && (mods?.qty !== undefined || mods?.toId)) {
          transfer = { ...transfer, qty: mods?.qty ?? transfer.qty, toId: mods?.toId ?? transfer.toId };
          const toNode = smart.positions[transfer.toId]?.nodeId;
          title = `Transfer ${transfer.qty} units to ${OUTLET_BY_ID[toNode]?.name ?? toNode}`;
          const fromE = evaluate(smart.positions[transfer.fromId], SKU_BY_ID[p.skuId], s.simDate);
          expectedRs = Math.min(transfer.qty, fromE.unsold > 0.5 ? fromE.unsold : transfer.qty) * fromE.unitValue;
        }
        const value = transfer ? transfer.qty * e.unitValue : 0;
        const needsApproval = rec.needsApproval || (!!transfer && value > 10000);
        const instant = isInstant(rec) && !needsApproval;
        const a: Action = {
          id: newId('a'), recKey: rec.key, positionId: rec.positionId, code: rec.code, level: rec.level, title, rationale: rec.rationale,
          owner: rec.owner, needsApproval, status: needsApproval ? 'awaiting_approval' : instant ? 'done' : 'in_progress',
          createdAt: s.simDate, createdBy: s.repId, expectedRs, costRs: rec.costRs, unitValue: e.unitValue,
          unsoldBefore: e.unsold, riskBefore: e.valueAtRisk, transfer, uplift: rec.uplift, guardrail: rec.guardrail,
          note: mods?.note, reasonCode: mods?.reasonCode,
          log: [{ at: s.simDate, text: mods?.qty !== undefined || mods?.toId ? 'Accepted with changes' : 'Accepted' }],
        };
        if (needsApproval) a.log.push({ at: s.simDate, text: 'Sent to ASM for approval' });
        if (instant) {
          a.outcome = applyAction(smart.positions, a, s.simDate);
          a.log.push({ at: s.simDate, text: `Done on the spot: ${a.outcome.note}` });
        }
        if (rec.code === 'VERIFY') { p.source = 'manual_count'; p.countedAt = s.simDate; }
        set({ smart, actions: [...s.actions, a] });
        get().markGuide('accept');
        get().showToast(needsApproval ? `${title}: sent for ASM approval` : instant ? `${title}: done` : `${title}: scheduled (${rec.owner === 'distributor' ? 'distributor executes' : 'in progress'})`);
        return a;
      },

      rejectRec: (rec, reasonCode, note) => {
        const s = get();
        const a: Action = {
          id: newId('a'), recKey: rec.key, positionId: rec.positionId, code: rec.code, level: rec.level, title: rec.title, rationale: rec.rationale,
          owner: rec.owner, needsApproval: false, status: 'rejected', createdAt: s.simDate, createdBy: s.repId, expectedRs: rec.expectedRs, costRs: rec.costRs,
          unitValue: 0, unsoldBefore: 0, riskBefore: 0, reasonCode, note, log: [{ at: s.simDate, text: `Rejected: ${reasonCode}` }],
        };
        set({ actions: [...s.actions, a] });
        get().showToast('Recommendation rejected; the reason is logged for learning', 'warn');
      },

      decide: (actionId, approve, note, qty) => {
        const s = get();
        const actions = s.actions.map((a) => {
          if (a.id !== actionId) return a;
          const b = clone(a);
          if (approve) {
            if (qty !== undefined && b.transfer) { b.transfer.qty = qty; b.title = b.title.replace(/Transfer \d+/, `Transfer ${qty}`); }
            b.status = 'in_progress';
            b.log.push({ at: s.simDate, text: `Approved by ASM${note ? `: ${note}` : ''}` });
          } else {
            b.status = 'rejected';
            b.log.push({ at: s.simDate, text: `Rejected by ASM${note ? `: ${note}` : ''}` });
          }
          b.decisionNote = note;
          return b;
        });
        set({ actions });
        if (approve) get().markGuide('approve');
        get().showToast(approve ? 'Approved: the action is now scheduled' : 'Rejected: the rep sees your note', approve ? 'ok' : 'warn');
      },

      executeNow: (actionId) => {
        const s = get();
        const smart = clone(s.smart);
        const actions = s.actions.map((a) => {
          if (a.id !== actionId || a.status !== 'in_progress') return a;
          const b = clone(a);
          b.outcome = applyAction(smart.positions, b, s.simDate);
          b.status = 'done';
          b.log.push({ at: s.simDate, text: `Executed: ${b.outcome.note}` });
          return b;
        });
        set({ smart, actions });
        get().showToast('Marked as executed; stock updated at both ends');
      },

      placeOrder: (visitId, lines) => {
        const s = get();
        const smart = clone(s.smart);
        smart.deliveries = smart.deliveries.filter((d) => !lines.some((l) => l.positionId === d.positionId));
        for (const l of lines) if (l.final > 0) smart.deliveries.push({ positionId: l.positionId, qty: l.final, arrive: s.simDate, kind: 'order' });
        const visits = s.visits.map((v) => (v.id === visitId ? { ...v, orderLines: lines } : v));
        set({ smart, visits });
        get().markGuide('order');
        get().showToast('Order sent to distributor (simulated); delivery with the next beat');
      },

      completeVisit: (visitId) => {
        const s = get();
        const v = s.visits.find((x) => x.id === visitId);
        if (!v) return;
        const risk = riskAt(s.smart.positions, s.simDate, (p) => p.nodeId === v.outletId);
        set({ visits: s.visits.map((x) => (x.id === visitId ? { ...x, status: 'done', riskAfter: risk.atRisk + risk.lostSalesRisk } : x)) });
        get().showToast('Visit completed and synced');
      },

      advance: (days) => {
        const s = get();
        let state = { simDate: s.simDate, smart: s.smart, bau: s.bau, actions: s.actions };
        let simDay = s.simDay;
        const snaps: Snapshot[] = [];
        // Advance in fortnightly chunks so the charts get a point per beat cycle
        for (let left = days; left > 0; left -= 14) {
          const step = Math.min(14, left);
          state = runAdvance(state, step);
          simDay += step;
          const k = riskAt(state.smart.positions, state.simDate);
          snaps.push({
            day: simDay, date: state.simDate, atRisk: k.atRisk, nearExpiryPct: k.nearExpiryPct, stockouts: k.stockouts,
            rescued: state.actions.reduce((t, a) => t + (a.outcome?.rsRescued ?? 0), 0),
            smartExpired: state.smart.counters.expiredValue, bauExpired: state.bau.counters.expiredValue,
            smartLost: state.smart.counters.lostValue, bauLost: state.bau.counters.lostValue,
          });
        }
        const visits = s.visits.map((v) => (v.status === 'in_progress' ? { ...v, status: 'done' as const } : v));
        set({ smart: state.smart, bau: state.bau, actions: state.actions, simDate: state.simDate, simDay, history: [...s.history, ...snaps], visits });
        get().markGuide('advance');
        get().showToast(`Fast-forwarded ${days} days: sales, deliveries, transfers and returns simulated in both worlds`);
      },

      notifyBrand: (skuId, count) => {
        const s = get();
        const sku = SKU_BY_ID[skuId];
        const a: Action = {
          id: newId('a'), recKey: `brand::${skuId}`, positionId: Object.keys(s.smart.positions).find((k) => k.endsWith(`::${skuId}`)) ?? '',
          code: 'RANGE_REVIEW', level: 'L2', title: `Range review: ${sku.brand} ${sku.name} flagged in ${count} outlets`,
          rationale: 'Repeat slow-mover across outlets suggests a shade/variant or range-fit issue rather than execution.',
          owner: 'brand', needsApproval: false, status: 'done', createdAt: s.simDate, createdBy: 'asm-meera', expectedRs: 0, costRs: 0,
          unitValue: 0, unsoldBefore: 0, riskBefore: 0, log: [{ at: s.simDate, text: 'Escalated to brand & demand planning' }],
        };
        set({ actions: [...s.actions, a] });
        get().showToast('Escalated to brand team and demand planning');
      },

      reset: () => { set({ ...initialData() }); },
      markGuide: (f) => { const g = get().guide; if (!g[f]) set({ guide: { ...g, [f]: true } }); },
      setGuideOpen: (o) => set({ guideOpen: o }),
      showToast: (text, tone = 'ok') => set({ toast: { id: Date.now(), text, tone } }),
    }),
    {
      name: 'smartsell-demo-v1',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (s) => ({
        role: s.role, repId: s.repId, distributorId: s.distributorId, simDate: s.simDate, simDay: s.simDay,
        smart: s.smart, bau: s.bau, actions: s.actions, visits: s.visits, history: s.history, guide: s.guide,
      }),
    },
  ),
);

/** Memoised evaluations for the current SMARTSELL world. */
export function useEvals() {
  const positions = useStore((s) => s.smart.positions);
  const simDate = useStore((s) => s.simDate);
  return useMemoEvals(positions, simDate);
}

let cacheKey: { p: unknown; d: string } | null = null;
let cacheVal: ReturnType<typeof evalAll> = {};
function useMemoEvals(positions: Record<string, Position>, simDate: string) {
  if (!cacheKey || cacheKey.p !== positions || cacheKey.d !== simDate) {
    cacheVal = evalAll(positions, simDate);
    cacheKey = { p: positions, d: simDate };
  }
  return cacheVal;
}

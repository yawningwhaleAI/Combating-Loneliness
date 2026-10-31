'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { Check, Lock, Pencil, ShieldAlert, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { DIAGNOSIS_REASONS, REJECT_REASONS } from '@/lib/params';
import { inr } from '@/lib/format';
import { Button, Modal, Pill, Stepper } from './ui';
import type { Action, Recommendation } from '@/lib/types';

const LEVEL_LABEL: Record<string, string> = {
  L0: 'Verify / diagnose', L1: 'Rotate & re-place', L2: 'Order guardrail', L3: 'Rebalance', L4: 'Activate demand',
  L5: 'Approved bundle', L6: 'Approved scheme', L7: 'End-of-life', L8: 'Return',
};

const STATUS_LABEL: Record<Action['status'], { t: string; cls: string }> = {
  awaiting_approval: { t: 'Awaiting ASM approval', cls: 'bg-amber-50 text-amber-800' },
  in_progress: { t: 'Scheduled / in progress', cls: 'bg-blue-50 text-blue-700' },
  done: { t: 'Done', cls: 'bg-emerald-50 text-emerald-700' },
  verified: { t: 'Verified', cls: 'bg-emerald-100 text-emerald-800' },
  rejected: { t: 'Rejected', cls: 'bg-slate-100 text-slate-600' },
};

export function StatusPill({ status }: { status: Action['status'] }) {
  const s = STATUS_LABEL[status];
  return <Pill className={s.cls}>{s.t}</Pill>;
}

export function RecCard({ rec, action, rank }: { rec: Recommendation; action?: Action; rank?: number }) {
  const acceptRec = useStore((s) => s.acceptRec);
  const rejectRec = useStore((s) => s.rejectRec);
  const [mode, setMode] = useState<null | 'modify' | 'reject' | 'diagnose'>(null);
  const [qty, setQty] = useState(rec.transfer?.qty ?? 0);
  const [toId, setToId] = useState(rec.transfer?.toId ?? '');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const alt = rec.alternatives?.find((a) => a.toId === toId);
  const maxQty = alt ? alt.capacity : rec.transfer?.qty ?? 0;
  const qtyError = rec.transfer && (qty <= 0 ? 'Quantity must be more than 0' : qty > maxQty ? `Recipient can only sell ${maxQty} units before the buffer date` : null);

  return (
    <div className={clsx('rounded-xl border p-3.5', action && action.status !== 'rejected' ? 'border-emerald-200 bg-emerald-50/40' : action ? 'border-slate-200 bg-slate-50 opacity-75' : 'border-slate-200 bg-white')}>
      <div className="flex flex-wrap items-center gap-1.5">
        {rank !== undefined && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white">{rank}</span>}
        <Pill className="bg-brand-soft text-brand">{rec.level} · {LEVEL_LABEL[rec.level]}</Pill>
        {rec.needsApproval && <Pill className="bg-amber-50 text-amber-800">Needs ASM approval</Pill>}
        {rec.instant && !rec.needsApproval && <Pill className="bg-emerald-50 text-emerald-700">Do it now</Pill>}
        <Pill>Owner: {rec.owner === 'asm' ? 'ASM' : rec.owner}</Pill>
      </div>
      <p className="mt-2 font-semibold leading-snug">{rec.title}</p>
      <p className="mt-0.5 text-sm text-ink-soft">{rec.rationale}</p>
      <div className="mt-2 grid gap-1 text-xs text-ink-mute sm:grid-cols-2">
        <span>Effect: <b className="text-ink">{rec.effect}</b></span>
        <span>Cost: <b className="text-ink">{rec.costRs ? inr(rec.costRs, false) : '₹0'}</b></span>
      </div>
      {rec.guardrail && <p className="mt-2 flex items-start gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-900"><ShieldAlert size={13} className="mt-0.5 shrink-0" /> {rec.guardrail}</p>}

      {action ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <StatusPill status={action.status} />
          {action.reasonCode && <span className="text-ink-mute">Reason: {action.reasonCode}</span>}
          {action.decisionNote && <span className="text-ink-mute">ASM: {action.decisionNote}</span>}
          {action.outcome?.note && <span className="text-ink-mute">{action.outcome.note}</span>}
        </div>
      ) : rec.locked ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ink-mute"><Lock size={13} /> {rec.locked}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="success" onClick={() => (rec.code === 'DIAGNOSE' ? setMode('diagnose') : acceptRec(rec))}><Check size={14} /> Accept</Button>
          {rec.transfer && <Button size="sm" variant="secondary" onClick={() => setMode('modify')}><Pencil size={14} /> Modify</Button>}
          <Button size="sm" variant="ghost" onClick={() => setMode('reject')}><X size={14} /> Reject</Button>
        </div>
      )}

      <Modal open={mode === 'modify'} onClose={() => setMode(null)} title="Modify transfer"
        footer={<><Button variant="secondary" onClick={() => setMode(null)}>Cancel</Button><Button disabled={!!qtyError} onClick={() => { acceptRec(rec, { qty, toId, note }); setMode(null); }}>Accept with changes</Button></>}>
        <label className="block text-sm font-medium">Recipient outlet</label>
        <select value={toId} onChange={(e) => { setToId(e.target.value); const a = rec.alternatives?.find((x) => x.toId === e.target.value); if (a) setQty(a.qty); }} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-2 text-sm">
          {rec.alternatives?.map((a) => <option key={a.toId} value={a.toId}>{a.label}</option>)}
        </select>
        <label className="mt-4 block text-sm font-medium">Quantity</label>
        <div className="mt-1"><Stepper value={qty} onChange={setQty} max={9999} label="transfer quantity" /></div>
        {qtyError ? <p className="mt-1 text-xs text-red-700">{qtyError}</p> : <p className="mt-1 text-xs text-ink-mute">Capped at what the recipient can sell before this batch&apos;s buffer date, so we never push waste downstream.</p>}
        <label className="mt-4 block text-sm font-medium">Note (optional)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-2 text-sm" placeholder="e.g. retailer agreed to send via van on Thursday" />
      </Modal>

      <Modal open={mode === 'reject'} onClose={() => setMode(null)} title="Why are you rejecting this?"
        footer={<><Button variant="secondary" onClick={() => setMode(null)}>Cancel</Button><Button variant="danger" disabled={!reason || (reason === 'Other' && !note.trim())} onClick={() => { rejectRec(rec, reason, note); setMode(null); }}>Reject</Button></>}>
        <div className="space-y-1.5">
          {REJECT_REASONS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
              <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} /> {r}
            </label>
          ))}
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-3 h-10 w-full rounded-lg border border-slate-300 px-2 text-sm" placeholder={reason === 'Other' ? 'Required: tell us why' : 'Optional note'} />
        <p className="mt-2 text-xs text-ink-mute">Reasons are logged. They show managers where the rules need tuning.</p>
      </Modal>

      <Modal open={mode === 'diagnose'} onClose={() => setMode(null)} title="Why is it slow here?"
        footer={<><Button variant="secondary" onClick={() => setMode(null)}>Cancel</Button><Button disabled={!reason} onClick={() => { acceptRec(rec, { reasonCode: reason }); setMode(null); }}>Save diagnosis</Button></>}>
        <div className="space-y-1.5">
          {DIAGNOSIS_REASONS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
              <input type="radio" name="diag" checked={reason === r} onChange={() => setReason(r)} /> {r}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-mute">The diagnosis decides the fix: visibility, sampling, range change or transfer. No discount by default.</p>
      </Modal>
    </div>
  );
}

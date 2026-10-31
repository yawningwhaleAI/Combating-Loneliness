'use client';

import { useState } from 'react';
import { CheckCircle2, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';
import { useEvals, useStore } from '@/store/useStore';
import { APPROVAL_THRESHOLD_RS } from '@/lib/params';
import { distributorOf } from '@/lib/recommend';
import { inr } from '@/lib/format';
import { Button, Empty, Modal, SectionTitle, Stepper } from '@/components/ui';
import { ActionItem } from '@/components/ActionItem';
import { SKU_BY_ID } from '@/data/seed';
import type { Action } from '@/lib/types';

const REJECT_PRESETS = ['Use sampling / beauty-advisor day instead', 'Try a transfer first', 'Verify the count first', 'Not within scheme budget', 'Brand guardrail: no price promotions'];

function useChecks() {
  const positions = useStore((s) => s.smart.positions);
  const evals = useEvals();
  return (a: Action) => {
    const p = positions[a.positionId];
    if (!p) return [];
    const sku = SKU_BY_ID[p.skuId];
    const e = evals[p.id];
    const checks: { ok: boolean; text: string }[] = [];
    if ((a.code === 'PROMO' || a.code === 'BUNDLE') && (sku.tier === 'LUXE' || (a.code === 'PROMO' && sku.tier !== 'MASS'))) checks.push({ ok: false, text: `${sku.tier} tier: ${a.code === 'PROMO' ? 'price promotions' : 'bundles'} are outside the playbook` });
    else checks.push({ ok: true, text: `Allowed for ${sku.tier} tier` });
    if (a.transfer) {
      const val = a.transfer.qty * a.unitValue;
      checks.push({ ok: true, text: `Transfer value ${inr(val, false)} (${val > APPROVAL_THRESHOLD_RS ? 'above' : 'below'} ${inr(APPROVAL_THRESHOLD_RS, false)} threshold)` });
      const to = positions[a.transfer.toId];
      if (to && distributorOf(to) !== distributorOf(positions[a.transfer.fromId])) checks.push({ ok: true, text: 'Cross-distributor: confirm both distributors agree on credit note & logistics' });
      checks.push({ ok: true, text: 'Quantity capped at what the recipient can sell before the buffer date' });
    }
    checks.push({ ok: e.confBand !== 'Low', text: `Data confidence ${e.confBand}` });
    if (a.costRs > 0) checks.push({ ok: a.costRs <= Math.max(a.expectedRs, 1), text: `Cost ${inr(a.costRs, false)} vs expected benefit ${inr(a.expectedRs, false)}` });
    return checks;
  };
}

export default function Approvals() {
  const actions = useStore((s) => s.actions);
  const decide = useStore((s) => s.decide);
  const checksFor = useChecks();
  const [rejecting, setRejecting] = useState<Action | null>(null);
  const [editing, setEditing] = useState<Action | null>(null);
  const [note, setNote] = useState('');
  const [qty, setQty] = useState(0);
  const awaiting = actions.filter((a) => a.status === 'awaiting_approval');
  const decided = actions.filter((a) => a.log.some((l) => l.text.includes('by ASM'))).slice(-6).reverse();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SectionTitle title="Approval queue" sub="Above-threshold transfers, schemes, sampling budgets and end-of-life requests, with the facts and guardrail checks attached" />
      {awaiting.length === 0 ? <Empty title="Nothing waiting for approval">When a rep accepts a transfer over ₹10,000 or a scheme, it lands here.</Empty> : (
        <div className="space-y-3">
          {awaiting.map((a) => {
            const checks = checksFor(a);
            const violation = checks.some((c) => !c.ok && c.text.includes('tier'));
            return (
              <ActionItem key={a.id} a={a}>
                <div className="w-full rounded-xl bg-slate-50 p-3 text-xs">
                  <p className="mb-1 font-semibold uppercase tracking-wide text-ink-mute">Guardrail checks</p>
                  {checks.map((c, i) => <p key={i} className={`flex items-center gap-1 ${c.ok ? 'text-emerald-800' : 'text-red-700'}`}>{c.ok ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />} {c.text}</p>)}
                </div>
                <Button size="sm" variant="success" disabled={violation} title={violation ? 'Blocked by brand guardrail' : undefined} onClick={() => decide(a.id, true)}><CheckCircle2 size={14} /> Approve</Button>
                {a.transfer && <Button size="sm" variant="secondary" onClick={() => { setEditing(a); setQty(a.transfer!.qty); setNote(''); }}>Approve with change</Button>}
                <Button size="sm" variant="danger" onClick={() => { setRejecting(a); setNote(violation ? 'Brand guardrail: no price promotions' : ''); }}><XCircle size={14} /> Reject</Button>
              </ActionItem>
            );
          })}
        </div>
      )}

      {decided.length > 0 && (
        <div>
          <h3 className="mb-2 mt-6 font-semibold">Recently decided</h3>
          <div className="space-y-3">{decided.map((a) => <ActionItem key={a.id} a={a} />)}</div>
        </div>
      )}

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject request"
        footer={<><Button variant="secondary" onClick={() => setRejecting(null)}>Cancel</Button><Button variant="danger" disabled={!note.trim()} onClick={() => { if (rejecting) decide(rejecting.id, false, note); setRejecting(null); }}>Reject with note</Button></>}>
        <p className="text-sm text-ink-soft">Tell the rep what to do instead. They see this note on the action.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{REJECT_PRESETS.map((r) => <button key={r} onClick={() => setNote(r)} className={`rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${note === r ? 'bg-ink text-white ring-ink' : 'ring-slate-200 hover:bg-slate-50'}`}>{r}</button>)}</div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-3 h-20 w-full rounded-lg border border-slate-300 p-2 text-sm" placeholder="Note to rep (required)" />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Approve with a different quantity"
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button disabled={qty <= 0} onClick={() => { if (editing) decide(editing.id, true, note || `Quantity changed to ${qty}`, qty); setEditing(null); }}>Approve</Button></>}>
        <Stepper value={qty} onChange={setQty} max={editing?.transfer?.qty ?? 9999} label="approved quantity" />
        <p className="mt-1 text-xs text-ink-mute">You can reduce, not increase, the quantity the engine capped.</p>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-3 h-10 w-full rounded-lg border border-slate-300 px-2 text-sm" placeholder="Optional note" />
      </Modal>
    </div>
  );
}

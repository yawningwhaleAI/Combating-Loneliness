'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, FastForward, Sparkles, X } from 'lucide-react';
import { useStore, type GuideFlag } from '@/store/useStore';
import type { Role } from '@/lib/types';

const STEPS: { flag: GuideFlag; title: string; detail: string; href?: string; role?: Role }[] = [
  { flag: 'role', title: 'Be the field rep', detail: 'You are Kunal, a Territory Sales Officer in Andheri–Bandra. Open "Today\'s beat".', href: '/rep', role: 'rep' },
  { flag: 'visit', title: 'Start the visit at Shree Beauty', detail: 'It is ranked #1 by rupees at risk. Read the pre-visit brief, then tap "Start visit".', href: '/rep/outlet/o-shree', role: 'rep' },
  { flag: 'count', title: 'Count the flagged stock', detail: 'Use the simulated barcode scan on the shampoo, tick the "unopened cartons" signal, save.', href: '/rep/outlet/o-shree?tab=count', role: 'rep' },
  { flag: 'whatif', title: 'See why it is flagged', detail: 'Open the shampoo\'s "Why flagged" page and drag the expiry or sales sliders. Try "Caught 150 days earlier".', href: '/rep/outlet/o-shree/sku/lumea-shampoo', role: 'rep' },
  { flag: 'accept', title: 'Accept the transfer', detail: 'Move 66 units to Glow Chemist, which is about to run out. One move fixes waste and a stock-out.', href: '/rep/outlet/o-shree?tab=actions', role: 'rep' },
  { flag: 'order', title: 'Use the order guardrail', detail: 'The retailer asks for 24 more shampoo. SMARTSELL suggests 0 and explains why. Place the order.', href: '/rep/outlet/o-shree?tab=order', role: 'rep' },
  { flag: 'approve', title: 'Approve as the manager', detail: 'Switch to the ASM, approve the transfer, and reject the luxury discount request (guardrail).', href: '/manager/approvals', role: 'manager' },
  { flag: 'advance', title: 'Fast-forward one quarter', detail: 'Transfers execute, stock sells, at-risk batches cross their sell-by buffer and come back as returns, in both the SMARTSELL and business-as-usual worlds.' },
  { flag: 'outcomes', title: 'Compare outcomes', detail: 'Rupees rescued, stock-outs avoided and units saved from waste, against business-as-usual.', href: '/manager/outcomes', role: 'manager' },
];

export function JudgeGuide() {
  const open = useStore((s) => s.guideOpen);
  const guide = useStore((s) => s.guide);
  const setOpen = useStore((s) => s.setGuideOpen);
  const setRole = useStore((s) => s.setRole);
  const advance = useStore((s) => s.advance);
  const router = useRouter();
  const done = STEPS.filter((s) => guide[s.flag]).length;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} aria-label="Open judge guide" className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-brand px-3 py-3 text-sm font-medium text-white shadow-lg hover:bg-brand-deep sm:bottom-5 sm:right-5 sm:px-4">
        <Sparkles size={16} /> <span className="hidden sm:inline">Judge guide · </span>{done}/{STEPS.length}
      </button>
    );
  }
  return (
    <aside className="fixed bottom-0 right-0 z-50 w-full max-w-sm p-3 sm:bottom-4 sm:right-4" aria-label="Judge guide">
      <div className="max-h-[80vh] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-semibold">5-minute judge walkthrough</p>
            <p className="text-xs text-ink-mute">{done} of {STEPS.length} done · steps tick automatically</p>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-slate-100" aria-label="Close guide"><X size={18} /></button>
        </div>
        <div className="h-1 bg-slate-100"><div className="h-1 bg-emerald-500 transition-all" style={{ width: `${(done / STEPS.length) * 100}%` }} /></div>
        <ol className="space-y-1 p-3">
          {STEPS.map((s, i) => {
            const ok = !!guide[s.flag];
            return (
              <li key={s.flag} className={clsx('rounded-xl p-2.5', ok ? 'bg-emerald-50/60' : 'hover:bg-slate-50')}>
                <div className="flex gap-2">
                  {ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" /> : <Circle size={18} className="mt-0.5 shrink-0 text-slate-300" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{i + 1}. {s.title}</p>
                    <p className="text-xs text-ink-mute">{s.detail}</p>
                    {s.href && (
                      <Link href={s.href} onClick={() => { if (s.role) setRole(s.role); if (s.flag === 'outcomes') useStore.getState().markGuide('outcomes'); }}
                        className="mt-1 inline-block text-xs font-medium text-brand hover:underline">Go →</Link>
                    )}
                    {s.flag === 'advance' && (
                      <button onClick={() => { advance(91); router.push('/manager/outcomes'); setRole('manager'); }} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                        <FastForward size={12} /> Fast-forward 13 weeks now
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}

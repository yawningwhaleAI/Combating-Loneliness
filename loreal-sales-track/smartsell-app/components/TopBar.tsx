'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FastForward, RotateCcw, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { fmtDate } from '@/lib/dates';
import { Button, Modal } from './ui';
import type { Role } from '@/lib/types';

const NAV: Record<Role, { href: string; label: string }[]> = {
  rep: [
    { href: '/rep', label: "Today's beat" },
    { href: '/rep/actions', label: 'My actions' },
  ],
  manager: [
    { href: '/manager', label: 'Overview' },
    { href: '/manager/approvals', label: 'Approvals' },
    { href: '/manager/team', label: 'Team' },
    { href: '/manager/outcomes', label: 'Outcomes' },
  ],
  distributor: [{ href: '/distributor', label: 'Godown & tasks' }],
};

const HOME: Record<Role, string> = { rep: '/rep', manager: '/manager', distributor: '/distributor' };

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const role = useStore((s) => s.role);
  const simDate = useStore((s) => s.simDate);
  const simDay = useStore((s) => s.simDay);
  const awaiting = useStore((s) => s.actions.filter((a) => a.status === 'awaiting_approval').length);
  const setRole = useStore((s) => s.setRole);
  const advance = useStore((s) => s.advance);
  const reset = useStore((s) => s.reset);
  const setGuideOpen = useStore((s) => s.setGuideOpen);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmAdvance, setConfirmAdvance] = useState(false);

  const switchRole = (r: Role) => { setRole(r); router.push(HOME[r]); };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="bg-ink px-4 py-1 text-center text-[11px] text-white/80">
        Prototype for the L&apos;Oréal Sustainability Challenge 2026 · <b className="text-white">Synthetic data</b> · Not connected to any L&apos;Oréal system
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">S</span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight">SMARTSELL</span>
            <span className="block text-[10px] text-ink-mute">Field sales intelligence</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Main">
          {NAV[role].map((n) => {
            const active = n.href === HOME[role] ? pathname === n.href || (pathname.startsWith(n.href + '/') && !NAV[role].some((x) => x.href !== n.href && pathname.startsWith(x.href))) : pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={clsx('whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium', active ? 'bg-brand-soft text-brand' : 'text-ink-soft hover:bg-slate-100')}>
                {n.label}
                {n.href === '/manager/approvals' && awaiting > 0 && <span className="ml-1.5 rounded-full bg-red-600 px-1.5 text-[10px] text-white">{awaiting}</span>}
              </Link>
            );
          })}
          <Link href="/method" className={clsx('whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium', pathname === '/method' ? 'bg-brand-soft text-brand' : 'text-ink-soft hover:bg-slate-100')}>How it works</Link>
        </nav>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-ink-soft" title="Simulated date">
            {fmtDate(simDate, true)} · <b>Day {simDay}</b>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setConfirmAdvance(true)} title="Simulate time passing"><FastForward size={14} /> Fast-forward</Button>
          <select aria-label="Switch role" value={role} onChange={(e) => switchRole(e.target.value as Role)}
            className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-sm">
            <option value="rep">Role: Sales Rep</option>
            <option value="manager">Role: Sales Manager</option>
            <option value="distributor">Role: Distributor</option>
          </select>
          <Button size="sm" variant="ghost" onClick={() => setGuideOpen(true)}><Sparkles size={14} /> Judge guide</Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmReset(true)} title="Reset demo"><RotateCcw size={14} /></Button>
        </div>
      </div>

      <Modal open={confirmAdvance} onClose={() => setConfirmAdvance(false)} title="Fast-forward time"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmAdvance(false)}>Cancel</Button>
          <Button variant="secondary" onClick={() => { advance(28); setConfirmAdvance(false); }}>+4 weeks</Button>
          <Button variant="secondary" onClick={() => { advance(91); setConfirmAdvance(false); }}>+1 quarter</Button>
          <Button onClick={() => { advance(14); setConfirmAdvance(false); }}><FastForward size={14} /> Simulate 14 days</Button>
        </>}>
        <p className="text-sm text-ink-soft">The simulator will play out two weeks in both worlds:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li><b>SMARTSELL world:</b> approved transfers and actions are executed, orders follow the guardrail, interventions lift sell-out.</li>
          <li><b>Business-as-usual world:</b> same starting stock, but retailers re-order &quot;same as last time&quot; and nothing is rebalanced.</li>
        </ul>
        <p className="mt-2 text-sm text-ink-soft">Sales, fortnightly orders, deliveries and returns (stock that passes its sell-by buffer) are recalculated. Outcomes appear under <b>Manager → Outcomes</b>. Most at-risk batches cross their buffer in 2–3 months, so try <b>+1 quarter</b> to see the full effect.</p>
      </Modal>
      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset the demo?"
        footer={<><Button variant="secondary" onClick={() => setConfirmReset(false)}>Cancel</Button><Button variant="danger" onClick={() => { reset(); setConfirmReset(false); router.push('/'); }}><RotateCcw size={14} /> Reset everything</Button></>}>
        <p className="text-sm text-ink-soft">All counts, actions, approvals and simulated days will be cleared and the synthetic territory restored to Day 0.</p>
      </Modal>
    </header>
  );
}

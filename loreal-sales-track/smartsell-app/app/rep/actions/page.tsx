'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { actionStats } from '@/lib/kpis';
import { inr } from '@/lib/format';
import { Empty, SectionTitle, Stat, Tabs } from '@/components/ui';
import { ActionItem } from '@/components/ActionItem';
import type { ActionStatus } from '@/lib/types';

type T = 'open' | 'awaiting' | 'done' | 'rejected';
const MATCH: Record<T, ActionStatus[]> = { open: ['in_progress'], awaiting: ['awaiting_approval'], done: ['done', 'verified'], rejected: ['rejected'] };

export default function MyActions() {
  const repId = useStore((s) => s.repId);
  const actions = useStore((s) => s.actions).filter((a) => a.createdBy === repId);
  const [tab, setTab] = useState<T>('open');
  const st = actionStats(actions);
  const list = actions.filter((a) => MATCH[tab].includes(a.status)).reverse();
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SectionTitle title="My actions" sub="Everything you've accepted, its approval status, and the verified outcome" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Open" value={st.open} tone="amber" />
        <Stat label="Completion rate" value={`${Math.round(st.completionRate * 100)}%`} tone="brand" sub={`${st.completed} of ${st.accepted} accepted`} />
        <Stat label="₹ rescued" value={inr(st.rescued)} tone="green" />
        <Stat label="New risk avoided" value={inr(st.avoided)} tone="green" sub="orders not loaded" />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'open', label: `In progress (${actions.filter((a) => a.status === 'in_progress').length})` },
        { id: 'awaiting', label: `Awaiting approval (${st.awaiting})` },
        { id: 'done', label: `Done & verified (${st.completed})` },
        { id: 'rejected', label: `Rejected (${st.rejected})` },
      ]} />
      {list.length === 0 ? <Empty title="Nothing here yet">Start a visit from Today&apos;s beat and accept a recommendation.</Empty> : (
        <div className="space-y-3">{list.map((a) => <ActionItem key={a.id} a={a} showExecute={a.owner === 'rep' || a.owner === 'asm'} />)}</div>
      )}
      <p className="text-xs text-ink-mute">Transfers are executed by the distributor (Distributor view), or automatically when you fast-forward time.</p>
    </div>
  );
}

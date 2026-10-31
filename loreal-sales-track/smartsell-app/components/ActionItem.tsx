'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { fmtDate } from '@/lib/dates';
import { inr } from '@/lib/format';
import { nodeName } from '@/lib/recommend';
import { Button, Card, Pill } from './ui';
import { StatusPill } from './RecCard';
import { REP_BY_ID, SKU_BY_ID } from '@/data/seed';
import type { Action } from '@/lib/types';

export function ActionItem({ a, children, showExecute }: { a: Action; children?: React.ReactNode; showExecute?: boolean }) {
  const positions = useStore((s) => s.smart.positions);
  const executeNow = useStore((s) => s.executeNow);
  const p = positions[a.positionId];
  const sku = p ? SKU_BY_ID[p.skuId] : undefined;
  const href = p ? (p.nodeType === 'retailer' ? `/rep/outlet/${p.nodeId}/sku/${p.skuId}` : `/distributor`) : '#';
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill className="bg-brand-soft text-brand">{a.level}</Pill>
            <StatusPill status={a.status} />
            {a.synthetic && <Pill>synthetic history</Pill>}
          </div>
          <p className="mt-1.5 font-semibold">{a.title}</p>
          {sku && p && <Link href={href} className="text-sm text-ink-mute hover:text-brand">{sku.brand} {sku.name} · {nodeName(p.nodeId)}</Link>}
          {a.rationale && <p className="mt-1 text-sm text-ink-soft">{a.rationale}</p>}
        </div>
        <div className="text-right text-xs text-ink-mute">
          <p>By {REP_BY_ID[a.createdBy]?.name ?? a.createdBy} · {fmtDate(a.createdAt)}</p>
          {a.expectedRs > 0 && <p>Expected: <b className="text-ink">{inr(a.expectedRs)}</b></p>}
          {a.costRs > 0 && <p>Cost: {inr(a.costRs)}</p>}
          {a.outcome && <p className="text-emerald-700">Rescued: <b>{inr(a.outcome.rsRescued)}</b>{a.outcome.estimated ? ' (est.)' : ''}</p>}
        </div>
      </div>
      {a.guardrail && <p className="mt-2 flex items-start gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-900"><ShieldAlert size={13} className="mt-0.5 shrink-0" /> {a.guardrail}</p>}
      {a.log.length > 0 && <ol className="mt-2 border-l border-slate-200 pl-3 text-xs text-ink-mute">{a.log.map((l, i) => <li key={i}>{fmtDate(l.at)}: {l.text}</li>)}</ol>}
      {(children || (showExecute && a.status === 'in_progress')) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {children}
          {showExecute && a.status === 'in_progress' && <Button size="sm" variant="success" onClick={() => executeNow(a.id)}>Mark executed now</Button>}
        </div>
      )}
    </Card>
  );
}

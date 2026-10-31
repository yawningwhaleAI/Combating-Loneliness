import { fmtDate } from '@/lib/dates';
import { num } from '@/lib/format';
import type { Eval } from '@/lib/engine';

/** FEFO view: per batch, how many units sell before the buffer date (green) vs. are projected unsold (red). */
export function BatchTimeline({ e }: { e: Eval }) {
  const max = Math.max(1, ...e.batches.map((b) => b.qty));
  if (!e.batches.length) return <p className="text-sm text-ink-mute">No stock recorded.</p>;
  return (
    <div className="space-y-3">
      {e.batches.map((b, i) => {
        const soldW = (b.sold / max) * 100;
        const unsoldW = (b.unsold / max) * 100;
        return (
          <div key={b.code + i}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold text-ink">Batch {b.code} · {num(b.qty)} units</span>
              <span className="text-ink-mute">EXP {fmtDate(b.expiry)} · sell by {fmtDate(b.bufferDate)} ({b.window > 0 ? `${b.window} days` : 'passed'})</span>
            </div>
            <div className="mt-1 flex h-6 w-full overflow-hidden rounded-lg bg-slate-100">
              {b.sold > 0 && <div className="flex items-center justify-center bg-emerald-500 text-[10px] font-semibold text-white" style={{ width: `${soldW}%` }}>{soldW > 12 ? `${num(b.sold)} sell` : ''}</div>}
              {b.unsold > 0.5 && <div className="flex items-center justify-center bg-red-500 text-[10px] font-semibold text-white" style={{ width: `${unsoldW}%` }}>{unsoldW > 12 ? `${num(b.unsold)} at risk` : ''}</div>}
            </div>
          </div>
        );
      })}
      <div className="flex gap-4 text-[11px] text-ink-mute"><span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-emerald-500" /> sells before buffer (FEFO)</span><span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-red-500" /> projected unsold</span></div>
    </div>
  );
}

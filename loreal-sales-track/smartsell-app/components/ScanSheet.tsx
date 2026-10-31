'use client';

import { useEffect, useState } from 'react';
import { Barcode, CheckCircle2, ScanLine } from 'lucide-react';
import { Button, Modal } from './ui';
import { fmtDate } from '@/lib/dates';
import type { Batch, Sku } from '@/lib/types';

/** Simulated barcode + batch scan. A real build would use the device camera (BarcodeDetector API). */
export function ScanSheet({ open, onClose, sku, expectedBatch, onScanned, allSkus }: {
  open: boolean; onClose: () => void; sku: Sku; expectedBatch?: Batch; allSkus: Sku[];
  onScanned: (r: { sku: Sku; batch?: Batch }) => void;
}) {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle');
  const [ean, setEan] = useState('');
  const [result, setResult] = useState<{ sku: Sku; batch?: Batch } | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => { if (open) { setPhase('idle'); setEan(''); setResult(null); setErr(''); } }, [open]);

  const simulate = () => {
    setPhase('scanning');
    setTimeout(() => { setResult({ sku, batch: expectedBatch }); setPhase('done'); }, 900);
  };
  const lookup = () => {
    const clean = ean.replace(/\D/g, '');
    if (clean.length !== 13) { setErr('An EAN-13 barcode has 13 digits'); setPhase('error'); return; }
    const hit = allSkus.find((s) => s.ean === clean);
    if (!hit) { setErr('Not in the catalogue for this outlet. Check the code or add the SKU manually.'); setPhase('error'); return; }
    setResult({ sku: hit, batch: hit.id === sku.id ? expectedBatch : undefined });
    setPhase('done');
  };

  return (
    <Modal open={open} onClose={onClose} title="Scan barcode & batch (simulated)"
      footer={phase === 'done' && result ? <Button onClick={() => { onScanned(result); onClose(); }}><CheckCircle2 size={16} /> Use this scan</Button> : undefined}>
      <div className="relative mx-auto flex aspect-[4/3] w-full max-w-sm items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-white">
        <div className="absolute inset-6 rounded-lg border-2 border-white/40" />
        {phase === 'scanning' && <div className="scanline absolute left-8 right-8 h-0.5 bg-red-400 shadow-[0_0_12px_2px_rgba(248,113,113,.8)]" />}
        {phase === 'done' && result ? (
          <div className="z-10 px-6 text-center">
            <CheckCircle2 className="mx-auto text-emerald-400" size={36} />
            <p className="mt-2 text-sm font-semibold">{result.sku.brand} {result.sku.name}</p>
            <p className="text-xs text-white/70">EAN {result.sku.ean}</p>
            {result.batch && <p className="mt-1 text-xs text-white/90">Batch {result.batch.code} · EXP {fmtDate(result.batch.expiry)}</p>}
          </div>
        ) : (
          <div className="z-10 text-center text-white/70"><Barcode size={40} className="mx-auto" /><p className="mt-1 text-xs">{phase === 'scanning' ? 'Reading barcode and batch code…' : 'Point at the barcode and batch print'}</p></div>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={simulate} disabled={phase === 'scanning'}><ScanLine size={16} /> Simulate scan of {sku.brand} {sku.name.split(' ').slice(0, 2).join(' ')}</Button>
        <div className="flex gap-2">
          <input value={ean} onChange={(e) => setEan(e.target.value)} placeholder={`Or type an EAN, e.g. ${sku.ean}`} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 px-2 text-sm" inputMode="numeric" />
          <Button variant="secondary" onClick={lookup}>Look up</Button>
        </div>
        {phase === 'error' && <p className="text-xs text-red-700">{err}</p>}
      </div>
    </Modal>
  );
}

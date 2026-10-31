'use client';

import clsx from 'clsx';
import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function Toast() {
  const toast = useStore((s) => s.toast);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => useStore.setState({ toast: null }), 3800);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  const Icon = toast.tone === 'ok' ? CheckCircle2 : toast.tone === 'warn' ? AlertTriangle : XCircle;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4" role="status" aria-live="polite">
      <div className={clsx('pointer-events-auto flex max-w-md items-start gap-2 rounded-xl px-4 py-3 text-sm text-white shadow-lg',
        toast.tone === 'ok' ? 'bg-ink' : toast.tone === 'warn' ? 'bg-amber-700' : 'bg-red-700')}>
        <Icon size={18} className="mt-0.5 shrink-0" />
        <span>{toast.text}</span>
      </div>
    </div>
  );
}

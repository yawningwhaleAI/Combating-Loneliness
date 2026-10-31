'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useStore } from '@/store/useStore';

/** Waits for persisted demo state to load from the browser before rendering (avoids hydration mismatches). */
export function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.resolve(useStore.persist.rehydrate()).finally(() => setReady(true));
  }, []);
  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink-mute">
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" /> Loading demo territory…
      </div>
    );
  }
  return <>{children}</>;
}

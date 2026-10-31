'use client';

import { useMemo } from 'react';
import { useEvals, useStore } from '@/store/useStore';
import { recommend } from '@/lib/recommend';
import type { Action, Recommendation } from '@/lib/types';

export function useRecommender() {
  const positions = useStore((s) => s.smart.positions);
  const simDate = useStore((s) => s.simDate);
  const actions = useStore((s) => s.actions);
  const evals = useEvals();
  return useMemo(() => {
    const ctx = { positions, simDate, evalOf: (id: string) => evals[id] };
    const forPosition = (id: string): Recommendation[] => (positions[id] ? recommend(positions[id], ctx) : []);
    const actionFor = (rec: Recommendation): Action | undefined => {
      const list = actions.filter((a) => a.recKey === rec.key && a.positionId === rec.positionId);
      const other = actions.filter((a) => a.recKey === rec.key && a.positionId !== rec.positionId && a.status !== 'rejected');
      return list.find((a) => a.status !== 'rejected') ?? other[0] ?? list[list.length - 1];
    };
    return { forPosition, actionFor };
  }, [positions, simDate, actions, evals]);
}

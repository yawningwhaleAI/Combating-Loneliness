"use client";

import { Eye, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PlanCard, useEvalCtx } from "@/components/member/plan-card";
import { Annotation, Avatar, Badge, Card, Chip, EmptyState, Toggle } from "@/components/ui";
import { CATEGORIES } from "@/data/catalog";
import { PEOPLE } from "@/data/seed";
import { weekWindows } from "@/lib/availability";
import { evaluatePlan, peopleFreeWithMe, windowLabel } from "@/lib/matching";
import type { Category } from "@/lib/types";
import { cn, DAYS, inr } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

const BUDGETS = [0, 300, 600, 1000];
const DISTANCES = [2, 5, 10];

export default function FreeWithMe() {
  const s = useDemo();
  const setFlag = s.setFlag;
  useEffect(() => setFlag("visitedFree"), [setFlag]);

  const [windowId, setWindowId] = useState<string>("all");
  const [cats, setCats] = useState<Category[]>([]);
  const [budget, setBudget] = useState<number>(s.profile.budget >= 5000 ? 1000 : s.profile.budget);
  const [distance, setDistance] = useState(10);
  const [showUnfit, setShowUnfit] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const ctx = useEvalCtx(distance);
  const windows = useMemo(() => weekWindows(s.availability), [s.availability]);

  const results = useMemo(() => {
    const profile = { ...ctx.profile, budget: (budget || 5000) as typeof ctx.profile.budget };
    return s.plans
      .filter((p) => p.status === "live")
      .filter((p) => !cats.length || cats.includes(p.category))
      .map((p) => ({ plan: p, ev: evaluatePlan(p, { ...ctx, profile }) }))
      .filter(({ plan, ev }) => {
        if (ev.past && !s.bookings.some((b) => b.planId === plan.id && b.status !== "cancelled")) return false;
        if (windowId === "all") return true;
        const w = windows.find((x) => `${x.window.id}-${x.date}` === windowId);
        return !!w && plan.date === w.date && plan.start >= w.window.start && plan.start + plan.durationMin <= w.window.end;
      })
      .sort((a, b) => Number(b.ev.fits) - Number(a.ev.fits) || b.ev.score - a.ev.score);
  }, [s.plans, s.bookings, ctx, cats, budget, windowId, windows]);

  const fitting = results.filter((r) => r.ev.fits);
  const unfit = results.filter((r) => !r.ev.fits);
  const people = peopleFreeWithMe(s.availability, PEOPLE, s.blocked);

  const filters = (
    <div className="space-y-6">
      <FilterGroup label="Time">
        <div className="flex flex-wrap gap-1.5">
          <Chip selected={windowId === "all"} onClick={() => setWindowId("all")} className="text-[12.5px]">
            All my free time
          </Chip>
          {windows.map(({ window: w, date }) => (
            <Chip key={w.id + date} selected={windowId === `${w.id}-${date}`} onClick={() => setWindowId(`${w.id}-${date}`)} className="text-[12.5px]">
              {windowLabel(w)}
            </Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup label="Activity">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <Chip key={c} selected={cats.includes(c)} onClick={() => setCats((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]))} className="text-[12.5px]">
              {c}
            </Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup label="Budget">
        <div className="flex flex-wrap gap-1.5">
          {BUDGETS.map((b) => (
            <Chip key={b} selected={budget === b} onClick={() => setBudget(b)} className="text-[12.5px]">
              {b === 0 ? "Any" : `Up to ${inr(b)}`}
            </Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup label={`Distance from ${s.profile.area}`}>
        <div className="flex flex-wrap gap-1.5">
          {DISTANCES.map((d) => (
            <Chip key={d} selected={distance === d} onClick={() => setDistance(d)} className="text-[12.5px]">
              Within {d} km
            </Chip>
          ))}
        </div>
      </FilterGroup>
      <Toggle checked={showUnfit} onChange={setShowUnfit} label="Show plans that don't fit, with reasons" />
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-[30px] font-semibold leading-tight">Free With Me</h1>
            <Annotation label="Availability-based discovery" />
          </div>
          <p className="mt-1 text-[15px] text-muted">
            <span className="font-semibold text-ink">{fitting.length} plans</span> fit your free time, budget and area. Each one is checked, not guessed.
          </p>
        </div>
        <button onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold lg:hidden">
          <SlidersHorizontal className="size-4" /> Filters
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">{filters}</div>
        </aside>

        <div className="min-w-0 space-y-8">
          <Card className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 text-[12.5px]">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <Sparkles className="size-4 text-sunrise" /> Every plan is checked for
            </span>
            {["Your free windows", "Duration", "Budget", "Distance", "Spots left", "Eligibility"].map((c) => (
              <span key={c} className="text-muted">✓ {c}</span>
            ))}
          </Card>

          {fitting.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {fitting.map(({ plan, ev }) => (
                <PlanCard key={plan.id} plan={plan} evaluation={ev} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<Eye className="size-5" />} title="No plans fit these filters" body="Try a wider distance or budget, or add another free window." />
          )}

          <section>
            <h2 className="font-display text-lg font-semibold">People free when you are</h2>
            <p className="text-[13px] text-muted">Day-level overlap only. Nobody sees your exact hours or roster.</p>
            <div className="scrollbar-none mt-3 flex gap-3 overflow-x-auto pb-1">
              {people.map(({ person, overlap }) => (
                <div key={person.id} className="w-[180px] shrink-0 rounded-2xl border border-line bg-surface p-3.5">
                  <Avatar src={person.avatar} name={person.name} size={44} />
                  <div className="mt-2 text-sm font-semibold">
                    {person.name}, {person.age}
                  </div>
                  <div className="text-[12px] text-muted">{person.occupation.split(" · ")[0]}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {overlap.map((d) => (
                      <Badge key={d} tone="accent">
                        {DAYS[d]}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {showUnfit && unfit.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold">Doesn&apos;t fit right now</h2>
              <p className="mb-3 text-[13px] text-muted">Shown so you can see why. These never appear in your recommendations.</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {unfit.map(({ plan, ev }) => (
                  <PlanCard key={plan.id} plan={plan} evaluation={ev} />
                ))}
              </div>
            </section>
          )}
          {!showUnfit && unfit.length > 0 && (
            <button onClick={() => setShowUnfit(true)} className="text-[13px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline">
              {unfit.length} more plans don&apos;t fit your time or budget. Show them with reasons
            </button>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
          <div className={cn("absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-surface p-5")} style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom, 0px))" }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-display text-lg font-semibold">Filters</div>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="grid size-9 place-items-center rounded-full bg-canvas">
                <X className="size-4" />
              </button>
            </div>
            {filters}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{label}</div>
      {children}
    </div>
  );
}

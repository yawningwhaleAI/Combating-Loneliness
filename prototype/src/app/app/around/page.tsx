"use client";

import { Info, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PlanCard, useEvalCtx } from "@/components/member/plan-card";
import { Annotation, Badge, Card, Chip, Cover, EmptyState, SectionTitle } from "@/components/ui";
import { AREAS, CATEGORIES } from "@/data/catalog";
import { evaluatePlan } from "@/lib/matching";
import type { Category } from "@/lib/types";
import { cn, fmtDate, fmtTime } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

/** Rough positions of Gurugram neighbourhoods on the stylised hub map. */
const AREA_POS: Record<string, [number, number]> = {
  "DLF Phase 4": [44, 34],
  "Sector 29": [62, 22],
  "Cyber City": [36, 14],
  "Golf Course Road": [52, 56],
  "Sector 54": [66, 68],
  "Sohna Road": [30, 84],
  "Sector 46": [80, 44],
};

export default function AroundMe() {
  const plans = useDemo((s) => s.plans);
  const organisers = useDemo((s) => s.organisers);
  const area = useDemo((s) => s.profile.area);
  const ctx = useEvalCtx();
  const [cat, setCat] = useState<Category | "All">("All");
  const [where, setWhere] = useState<string | "All">("All");

  const live = useMemo(
    () =>
      plans
        .filter((p) => p.status === "live")
        .map((p) => ({ plan: p, ev: evaluatePlan(p, ctx) }))
        .filter((x) => !x.ev.past)
        .filter((x) => cat === "All" || x.plan.category === cat)
        .filter((x) => where === "All" || x.plan.venue.area === where)
        .sort((a, b) => a.plan.venue.distanceKm - b.plan.venue.distanceKm),
    [plans, ctx, cat, where],
  );
  const community = live.filter((x) => x.plan.communityHosted);
  const fresh = live.filter((x) => x.plan.isNew);
  const counts = AREAS.reduce<Record<string, number>>((acc, a) => ({ ...acc, [a]: plans.filter((p) => p.status === "live" && p.venue.area === a).length }), {});
  const venues = organisers.filter((o) => o.type === "business" && o.verification === "verified").slice(0, 6);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-[30px] font-semibold">Around Me</h1>
        <Annotation label="Local density" />
      </div>
      <p className="mt-1 text-[15px] text-muted">What&apos;s happening across the Gurugram Central hub this week, whether or not it fits your time.</p>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warn-soft px-3 py-1 text-[12px] font-semibold text-warn">
        <Info className="size-3.5" /> Demo listings. These aren&apos;t real bookable events.
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card className="relative overflow-hidden p-0">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
            <rect width="100" height="100" fill="#eef1f5" />
            <path d="M0 40 C25 35 40 48 60 42 S90 30 100 36" stroke="#dde2ea" strokeWidth="3" fill="none" />
            <path d="M48 0 C46 30 54 60 50 100" stroke="#dde2ea" strokeWidth="2.4" fill="none" />
            <path d="M0 75 C30 70 60 82 100 72" stroke="#e3e7ee" strokeWidth="1.8" fill="none" />
            <ellipse cx="72" cy="30" rx="10" ry="6" fill="#e1e9dc" />
            <ellipse cx="22" cy="60" rx="9" ry="7" fill="#e1e9dc" />
          </svg>
          <div className="relative h-[300px] sm:h-[340px]">
            {AREAS.map((a) => {
              const [x, y] = AREA_POS[a];
              const on = where === a;
              const mine = a === area;
              return (
                <button
                  key={a}
                  onClick={() => setWhere(on ? "All" : a)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-left"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  aria-label={`Filter to ${a}`}
                >
                  <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold shadow-sm transition", on ? "bg-ink text-white" : "bg-surface text-ink hover:bg-ink hover:text-white")}>
                    <MapPin className={cn("size-3", mine ? "text-sunrise" : "")} />
                    {a}
                    {counts[a] > 0 && <span className={cn("rounded-full px-1.5 text-[10px]", on ? "bg-white/20" : "bg-canvas")}>{counts[a]}</span>}
                  </span>
                </button>
              );
            })}
            <span className="absolute bottom-3 left-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-muted">Gurugram Central hub · you&apos;re in {area}</span>
          </div>
        </Card>
        <div className="space-y-4">
          <div>
            <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Category</div>
            <div className="flex flex-wrap gap-1.5">
              {(["All", ...CATEGORIES] as const).map((c) => (
                <Chip key={c} selected={cat === c} onClick={() => setCat(c)} className="text-[12.5px]">
                  {c}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Area</div>
            <div className="flex flex-wrap gap-1.5">
              {(["All", ...AREAS] as const).map((a) => (
                <Chip key={a} selected={where === a} onClick={() => setWhere(a)} className="text-[12.5px]">
                  {a}
                </Chip>
              ))}
            </div>
          </div>
          <Card className="p-4">
            <div className="text-[12.5px] font-semibold text-muted">This week in the hub</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              {[
                [plans.filter((p) => p.status === "live").length, "experiences"],
                [venues.length + 3, "venues"],
                [412, "members"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-canvas py-2.5">
                  <div className="font-display text-xl font-semibold">{n}</div>
                  <div className="text-[11px] text-muted">{l}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {fresh.length > 0 && (
        <section className="mt-10">
          <SectionTitle title="New experiences" sub="Recently approved by the hub team." />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {fresh.map(({ plan, ev }) => (
              <PlanCard key={plan.id} plan={plan} evaluation={ev} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <SectionTitle title="Happening nearby" sub="Closest first. The badge tells you if it fits your free time." />
        {live.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {live.map(({ plan, ev }) => (
              <PlanCard key={plan.id} plan={plan} evaluation={ev} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<MapPin className="size-5" />} title="Nothing here this week" body="Try another area or category." />
        )}
      </section>

      {community.length > 0 && (
        <section className="mt-10">
          <SectionTitle title="Community gatherings" sub="Free listings by verified individual hosts at public places." />
          <div className="grid gap-3 sm:grid-cols-2">
            {community.map(({ plan }) => (
              <Link key={plan.id} href={`/app/plans/${plan.id}`}>
                <Card className="flex items-center gap-3 p-3 transition hover:shadow-[var(--shadow-lift)]">
                  <Cover image={plan.image} alt={plan.title} className="size-16 shrink-0 rounded-xl" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{plan.title}</div>
                    <div className="text-[12.5px] text-muted">
                      {fmtDate(plan.date)} · {fmtTime(plan.start)} · {plan.venue.name}
                    </div>
                    <Badge tone="ok" className="mt-1">Free</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <SectionTitle title="Popular venues" sub="Verified partners with quiet hours open to After Hours members." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {venues.map((v) => (
            <Card key={v.id} className="overflow-hidden">
              <Cover image={v.avatar} alt={v.name} className="aspect-[16/8]" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-semibold">{v.name}</div>
                  {v.rating && (
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold">
                      <Star className="size-3.5 fill-dawn text-dawn" /> {v.rating}
                    </span>
                  )}
                </div>
                <div className="text-[12.5px] text-muted">{v.area}</div>
                <p className="mt-2 line-clamp-2 text-[12.5px] text-muted">{v.bio}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

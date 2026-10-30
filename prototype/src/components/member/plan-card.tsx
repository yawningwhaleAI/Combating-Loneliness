"use client";

import { Ban, CalendarDays, Check, MapPin, Store, Users } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { AvatarStack, Badge, Cover, StatusChip } from "@/components/ui";
import { PEOPLE } from "@/data/seed";
import { activeParticipants, evaluatePlan, type Evaluation } from "@/lib/matching";
import type { Plan } from "@/lib/types";
import { cn, fmtDate, fmtTime, inr } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

export function useEvalCtx(maxDistance?: number) {
  const profile = useDemo((s) => s.profile);
  const availability = useDemo((s) => s.availability);
  const connections = useDemo((s) => s.connections);
  const now = useDemo((s) => s.now);
  return useMemo(() => ({ profile, availability, connections, now, maxDistance }), [profile, availability, connections, now, maxDistance]);
}

export function usePlanEval(plan: Plan | undefined) {
  const ctx = useEvalCtx();
  return useMemo(() => (plan ? evaluatePlan(plan, ctx) : undefined), [plan, ctx]);
}

export function groupFormat(plan: Plan) {
  if (!plan.groupSize) return "Open group";
  const tables = Math.ceil(plan.capacity / plan.groupSize);
  return `${tables} small groups of ${plan.groupSize}`;
}

export function participantPeople(plan: Plan, avatarForRiya?: string) {
  return activeParticipants(plan).map((p) => {
    if (p.personId === "riya") return { id: "riya", name: "You", avatar: avatarForRiya };
    const person = PEOPLE.find((x) => x.id === p.personId);
    return { id: p.personId, name: person?.name ?? "Member", avatar: person?.avatar };
  });
}

export function PlanCard({ plan, evaluation, showFit = true, className }: { plan: Plan; evaluation: Evaluation; showFit?: boolean; className?: string }) {
  const organiser = useDemo((s) => s.organisers.find((o) => o.id === plan.organiserId));
  const booking = useDemo((s) => s.bookings.find((b) => b.planId === plan.id && b.status !== "cancelled"));
  const avatar = useDemo((s) => s.profile.avatar);
  const blocked = useDemo((s) => s.blocked);
  const people = participantPeople(plan, avatar).filter((p) => !blocked.includes(p.id));
  const failing = evaluation.checks.find((c) => !c.ok);
  const familiarNames = evaluation.familiar.map((id) => PEOPLE.find((p) => p.id === id)?.name).filter(Boolean);

  return (
    <Link
      href={`/app/plans/${plan.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
        !evaluation.fits && showFit && !booking && "opacity-60 saturate-[.6] hover:opacity-90",
        className,
      )}
    >
      <Cover image={plan.image} alt={plan.title} className="aspect-[16/10]">
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <Badge tone="dark" className="bg-ink/80 backdrop-blur">
            {plan.category}
          </Badge>
          <span className="rounded-full bg-white/95 px-2.5 py-1 font-display text-[13px] font-semibold text-ink shadow-sm">{inr(plan.price)}</span>
        </div>
        {plan.isNew && (
          <span className="absolute bottom-3 left-3">
            <Badge tone="accent">New</Badge>
          </span>
        )}
      </Cover>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {booking ? (
            <StatusChip status={booking.status} />
          ) : showFit && evaluation.fits ? (
            <Badge tone="accent">
              <Check className="size-3" strokeWidth={3} /> Fits your free time
            </Badge>
          ) : showFit && failing ? (
            <Badge tone="neutral">
              <Ban className="size-3" /> {failing.key === "time" ? "Doesn't fit your time" : failing.label}
            </Badge>
          ) : null}
          {familiarNames.length > 0 && <Badge tone="iris">{familiarNames.join(", ")} going</Badge>}
        </div>
        <h3 className="mt-2 font-display text-[17px] font-semibold leading-snug">{plan.title}</h3>
        <div className="mt-2 space-y-1 text-[13px] text-muted">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" />
            {fmtDate(plan.date)} · {fmtTime(plan.start)}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {plan.venue.name} · {plan.venue.distanceKm} km
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" />
            {groupFormat(plan)}
          </div>
          <div className="flex items-center gap-1.5">
            <Store className="size-3.5 shrink-0" />
            <span className="truncate">{plan.communityHosted ? `Community host · ${organiser?.owner ?? organiser?.name}` : organiser?.name}</span>
          </div>
        </div>
        {showFit && !evaluation.fits && failing && <p className="mt-2 text-[12px] font-semibold text-ink/70">{failing.label}</p>}
        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2 border-t border-line pt-3">
            <AvatarStack people={people} max={4} size={24} />
            <span className="whitespace-nowrap text-[12px] font-semibold text-muted">
              {people.length} going · {evaluation.spotsLeft} left
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

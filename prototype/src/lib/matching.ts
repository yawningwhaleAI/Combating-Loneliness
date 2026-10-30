// Rules-based, explainable matching. No ML: every decision can be read back as a sentence.

import { interestShort } from "@/data/catalog";
import type { Availability, AvailabilityWindow, Connection, Group, InterestId, Person, Plan, Profile } from "./types";
import { DAYS, fmtDate, fmtRange, isPast, weekdayIndex } from "./utils";

export interface Check {
  key: "time" | "budget" | "distance" | "capacity" | "eligibility";
  ok: boolean;
  label: string;
}

export interface Evaluation {
  fits: boolean;
  checks: Check[];
  score: number;
  reasons: string[];
  window?: AvailabilityWindow;
  sharedInterests: InterestId[];
  familiar: string[];
  spotsLeft: number;
  past: boolean;
}

export function activeParticipants(plan: Plan) {
  return plan.participants.filter((p) => p.status !== "cancelled");
}

export function spotsLeft(plan: Plan) {
  return Math.max(0, plan.capacity - activeParticipants(plan).length);
}

export function windowLabel(w: AvailabilityWindow) {
  const day = w.kind === "recurring" ? DAYS[w.day ?? 0] : fmtDate(w.date!);
  return `${day} ${fmtRange(w.start, w.end)}`;
}

/** Which of my windows covers this time slot? Respects blocked dates and expiry. */
export function findWindow(av: Availability, date: string, start: number, durationMin: number) {
  if (av.blocked.some((b) => b.date === date)) return undefined;
  const end = start + durationMin;
  const day = weekdayIndex(date);
  return av.windows.find((w) => {
    if (w.kind === "recurring" && w.day !== day) return false;
    if (w.kind === "temporary") {
      if (w.date !== date) return false;
      if (w.expiresOn && w.expiresOn < date) return false;
    }
    return start >= w.start && end <= w.end;
  });
}

export function timeConflictReason(av: Availability, date: string, start: number) {
  const blocked = av.blocked.find((b) => b.date === date);
  if (blocked) return `${fmtDate(date)} is now a work day (${blocked.reason.toLowerCase()})`;
  const day = weekdayIndex(date);
  const sameDay = av.windows.filter((w) => (w.kind === "recurring" ? w.day === day : w.date === date));
  if (!sameDay.length) return `You haven't shared any free time on ${DAYS[day]}`;
  const w = sameDay[0];
  if (start < w.start) return `Starts before your ${DAYS[day]} window (${fmtRange(w.start, w.end)})`;
  return `Ends after your ${DAYS[day]} window (${fmtRange(w.start, w.end)})`;
}

export function sharedInterests(a: InterestId[], b: InterestId[]) {
  return a.filter((i) => b.includes(i));
}

export interface EvalContext {
  profile: Profile;
  availability: Availability;
  connections: Connection[];
  now: string;
  maxDistance?: number;
}

export function evaluatePlan(plan: Plan, ctx: EvalContext): Evaluation {
  const { profile, availability, connections, now } = ctx;
  const window = findWindow(availability, plan.date, plan.start, plan.durationMin);
  const left = spotsLeft(plan);
  const past = isPast(plan.date, plan.start, now);
  const maxDistance = ctx.maxDistance ?? 10;

  const checks: Check[] = [
    {
      key: "time",
      ok: !!window && !past,
      label: past
        ? "Already started"
        : window
          ? `Fits your ${windowLabel(window)} window`
          : timeConflictReason(availability, plan.date, plan.start),
    },
    { key: "budget", ok: plan.price <= profile.budget, label: plan.price <= profile.budget ? `Within your ₹${profile.budget} budget` : `Above your ₹${profile.budget} budget` },
    { key: "distance", ok: plan.venue.distanceKm <= maxDistance, label: `${plan.venue.distanceKm} km from ${profile.area}` },
    { key: "capacity", ok: left > 0, label: left > 0 ? `${left} spots left` : "Full" },
    { key: "eligibility", ok: true, label: `Eligible (${plan.eligibility})` },
  ];

  const shared = sharedInterests(profile.interests, plan.interests);
  const connectedIds = connections.map((c) => c.personId);
  const familiar = activeParticipants(plan)
    .map((p) => p.personId)
    .filter((id) => connectedIds.includes(id));

  let score = 0;
  score += shared.length * 3;
  score += profile.activities.includes(plan.activity) ? 4 : 0;
  score += familiar.length * 5;
  score += Math.max(0, 5 - plan.venue.distanceKm);
  score += plan.groupSize && plan.groupSize <= profile.groupSize ? 2 : 0;

  const reasons: string[] = [];
  if (familiar.length) reasons.push(`${familiar.length === 1 ? "Someone you know is" : `${familiar.length} people you know are`} going`);
  if (shared.length) reasons.push(`Matches ${shared.slice(0, 2).map(interestShort).join(" & ")}`);
  if (window) reasons.push(`Fits ${DAYS[weekdayIndex(plan.date)]} ${fmtRange(window.start, window.end)}`);

  return {
    fits: checks.every((c) => c.ok),
    checks,
    score,
    reasons,
    window,
    sharedInterests: shared,
    familiar,
    spotsLeft: left,
    past,
  };
}

/**
 * Small-group assignment. Rules, in order:
 * 1. only groups with space;
 * 2. +5 per member you already know (keeps familiar faces together);
 * 3. +1 per interest shared with each member;
 * 4. prefer groups that are closer to full, so tables reach a good size.
 */
export function assignGroup(plan: Plan, myInterests: InterestId[], people: Person[], connections: Connection[]): { groups: Group[]; groupId: string } {
  if (!plan.groupSize) return { groups: plan.groups, groupId: "" };
  const size = plan.groupSize;
  const known = new Set(connections.map((c) => c.personId));
  const byId = new Map(people.map((p) => [p.id, p]));
  let best: Group | undefined;
  let bestScore = -Infinity;
  for (const g of plan.groups) {
    if (g.memberIds.length >= size) continue;
    let s = g.memberIds.length * 0.5;
    for (const id of g.memberIds) {
      if (known.has(id)) s += 5;
      const person = byId.get(id);
      if (person) s += sharedInterests(myInterests, person.interests).length;
    }
    if (s > bestScore) {
      bestScore = s;
      best = g;
    }
  }
  const groups = plan.groups.map((g) => ({ ...g, memberIds: [...g.memberIds] }));
  if (!best) {
    const id = `g${String(groups.length + 1).padStart(2, "0")}`;
    groups.push({ id, label: `Group ${String(groups.length + 3).padStart(2, "0")}`, memberIds: ["riya"] });
    return { groups, groupId: id };
  }
  groups.find((g) => g.id === best!.id)!.memberIds.push("riya");
  return { groups, groupId: best.id };
}

/** Plain-language explanation of a group, from the rules above. */
export function explainGroup(memberIds: string[], myInterests: InterestId[], people: Person[], connections: Connection[]) {
  const others = people.filter((p) => memberIds.includes(p.id));
  const counts = new Map<InterestId, number>();
  for (const o of others) for (const i of sharedInterests(myInterests, o.interests)) counts.set(i, (counts.get(i) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([i]) => interestShort(i));
  const familiar = others.filter((o) => connections.some((c) => c.personId === o.id));
  const list = top.length > 1 ? `${top.slice(0, -1).join(", ")} and ${top[top.length - 1]}` : top[0];
  return {
    sentence: top.length ? `You were matched because you share interests in ${list}.` : "You were matched to balance new introductions at this table.",
    familiar,
    sharedCounts: counts,
  };
}

/** People who have shared free time that overlaps mine (day-level only, never exact hours). */
export function peopleFreeWithMe(av: Availability, people: Person[], blocked: string[]) {
  const myDays = new Set(av.windows.filter((w) => w.kind === "recurring").map((w) => w.day!));
  for (const w of av.windows) if (w.kind === "temporary" && w.date) myDays.add(weekdayIndex(w.date));
  return people
    .filter((p) => !blocked.includes(p.id))
    .map((p) => ({ person: p, overlap: p.freeDays.filter((d) => myDays.has(d)) }))
    .filter((x) => x.overlap.length > 0)
    .sort((a, b) => b.overlap.length - a.overlap.length);
}

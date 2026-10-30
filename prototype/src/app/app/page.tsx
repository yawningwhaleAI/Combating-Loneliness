"use client";

import { ArrowRight, CalendarCheck2, Users } from "lucide-react";
import { CIRCLE_ICON } from "@/components/member/circle-icon";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { PlanCard, useEvalCtx } from "@/components/member/plan-card";
import { StoryCard } from "@/components/member/story-card";
import { WeekStrip } from "@/components/member/week-strip";
import { Avatar, AvatarStack, Badge, Card, EmptyState, SectionTitle, StatusChip } from "@/components/ui";
import { PEOPLE } from "@/data/seed";
import { availabilityStatus } from "@/lib/availability";
import { evaluatePlan, peopleFreeWithMe } from "@/lib/matching";
import { DAYS, fmtDate, fmtTime, greeting, weekdayIndex } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

export default function Home() {
  const s = useDemo();
  const ctx = useEvalCtx();
  const setFlag = s.setFlag;
  useEffect(() => setFlag("visitedHome"), [setFlag]);

  const ranked = useMemo(
    () =>
      s.plans
        .filter((p) => p.status === "live")
        .map((p) => ({ plan: p, ev: evaluatePlan(p, ctx) }))
        .filter((x) => x.ev.fits && !s.bookings.some((b) => b.planId === x.plan.id && b.status !== "cancelled"))
        .sort((a, b) => b.ev.score - a.ev.score),
    [s.plans, s.bookings, ctx],
  );
  const upcoming = s.bookings.filter((b) => b.status !== "cancelled" && b.status !== "attended");
  const invitations = s.stories.filter((st) => st.invitation && st.authorId !== "riya" && s.connections.some((c) => c.personId === st.authorId) && !st.joinedByMe);
  const feed = s.stories.filter((st) => !st.invitation).slice(0, 2);
  const freeWithMe = peopleFreeWithMe(s.availability, PEOPLE, s.blocked).slice(0, 5);
  const status = availabilityStatus(s.availability, s.now);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div>
          <h1 className="font-display text-[30px] font-semibold leading-tight sm:text-[36px]">
            {greeting(s.now)}, {s.profile.name}.
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
            {status.free ? `You're free until ${fmtTime(status.window!.window.end)}.` : status.text + "."} {ranked.length} plans fit your free time this week.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/app/free" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-white hover:bg-ink-2">
              See what fits <ArrowRight className="size-3.5" />
            </Link>
            <Link href="/app/availability" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-semibold hover:border-ink/30">
              Update free time
            </Link>
          </div>
        </div>
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between text-[12.5px] font-semibold">
            <span>Your week</span>
            <span className="text-muted">{status.text}</span>
          </div>
          <WeekStrip availability={s.availability} now={s.now} />
        </Card>
      </div>

      <section>
        <SectionTitle title="Recommended for your free time" sub="Ranked by shared interests, people you know, and distance." action={<Link href="/app/free" className="text-[13px] font-semibold text-sunrise-deep hover:underline">See all</Link>} />
        {ranked.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ranked.slice(0, 3).map(({ plan, ev }) => (
              <PlanCard key={plan.id} plan={plan} evaluation={ev} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<CalendarCheck2 className="size-5" />} title="Nothing fits right now" body="Add another free window and we'll look again." action={<Link href="/app/availability" className="text-sm font-semibold underline">Update availability</Link>} />
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="min-w-0 space-y-4">
          {invitations.length > 0 && (
            <>
              <SectionTitle title="Invitations from your people" />
              {invitations.slice(0, 2).map((st) => (
                <StoryCard key={st.id} story={st} compact />
              ))}
            </>
          )}
          <SectionTitle title="From your people" action={<Link href="/app/people" className="text-[13px] font-semibold text-sunrise-deep hover:underline">Open My People</Link>} />
          {feed.map((st) => (
            <StoryCard key={st.id} story={st} />
          ))}
        </section>

        <aside className="space-y-5">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Upcoming</h3>
              <Link href="/app/bookings" className="text-[12.5px] font-semibold text-muted hover:text-ink">All bookings</Link>
            </div>
            {upcoming.length === 0 && <p className="text-sm text-muted">No upcoming plans yet.</p>}
            <ul className="space-y-3">
              {upcoming.map((b) => {
                const plan = s.plans.find((p) => p.id === b.planId)!;
                return (
                  <li key={b.id}>
                    <Link href={`/app/bookings/${plan.id}`} className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-canvas">
                      <div className="grid w-12 shrink-0 place-items-center rounded-xl bg-canvas py-1.5 text-center">
                        <div className="text-[10px] font-bold uppercase text-sunrise-deep">{DAYS[weekdayIndex(plan.date)]}</div>
                        <div className="font-display text-lg font-semibold leading-none">{plan.date.slice(8)}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{plan.title}</div>
                        <div className="text-[12px] text-muted">{fmtTime(plan.start)} · {plan.venue.area}</div>
                      </div>
                      <StatusChip status={b.status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-base font-semibold">Free when you are</h3>
            <p className="mb-3 text-[12.5px] text-muted">Members who shared overlapping days. Exact hours stay private.</p>
            <ul className="space-y-2.5">
              {freeWithMe.map(({ person, overlap }) => {
                const connected = s.connections.some((c) => c.personId === person.id);
                return (
                  <li key={person.id} className="flex items-center gap-3">
                    <Avatar src={person.avatar} name={person.name} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        {person.name} {connected && <Badge tone="iris">Connection</Badge>}
                      </div>
                      <div className="truncate text-[12px] text-muted">Free {overlap.map((d) => DAYS[d]).join(", ")} · {person.occupation.split(" · ")[0]}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Your circles</h3>
              <Link href="/app/people?tab=circles" className="text-[12.5px] font-semibold text-muted hover:text-ink">View</Link>
            </div>
            <ul className="space-y-3">
              {s.circles.map((c) => {
                const Icon = CIRCLE_ICON[c.icon];
                return (
                  <li key={c.id} className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-sunrise-soft text-sunrise-deep">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{c.name}</div>
                      <div className="truncate text-[12px] text-muted">{c.rhythm}</div>
                    </div>
                    <AvatarStack people={c.memberIds.map((id) => PEOPLE.find((p) => p.id === id)!).filter(Boolean)} max={3} size={22} />
                  </li>
                );
              })}
            </ul>
          </Card>
          <p className="flex items-center gap-1.5 px-1 text-[12px] text-muted">
            <Users className="size-3.5" /> Gurugram Central hub · {fmtDate(s.now.split("T")[0])}
          </p>
        </aside>
      </div>
    </div>
  );
}

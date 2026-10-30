"use client";

import { ArrowRight, CalendarDays, IndianRupee, Layers, Repeat, Ticket, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { BUSINESS_ID } from "@/components/business/business-shell";
import { OccupancyChart } from "@/components/business/occupancy-chart";
import { Avatar, Badge, Button, Card, Cover, SectionTitle, Stat } from "@/components/ui";
import { PEOPLE } from "@/data/seed";
import { businessMetrics } from "@/lib/business";
import { activeParticipants } from "@/lib/matching";
import { fmtDate, fmtTime, greeting, inrPlain } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

export default function BusinessOverview() {
  const plans = useDemo((s) => s.plans);
  const now = useDemo((s) => s.now);
  const org = useDemo((s) => s.organisers.find((o) => o.id === BUSINESS_ID));
  const m = businessMetrics(plans, BUSINESS_ID, now);
  const review = m.mine.filter((p) => p.status === "review");
  const recent = m.mine
    .flatMap((p) => activeParticipants(p).map((pt) => ({ p, pt })))
    .slice(-6)
    .reverse();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Business view</div>
          <h1 className="mt-1 font-display text-[30px] font-semibold leading-tight">{greeting(now)}, {org?.owner.split(" ")[0]}.</h1>
          <p className="mt-1 text-[15px] text-muted">Here&apos;s how After Hours is filling {org?.name}&apos;s quiet hours.</p>
        </div>
        <Link href="/business/create">
          <Button variant="accent">
            Publish an experience <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Experiences" value={m.totalExperiences} hint={`${m.upcoming.length} upcoming`} icon={<Layers className="size-4" />} />
        <Stat label="Total bookings" value={m.bookings} hint="Since Sep 2026" icon={<Ticket className="size-4" />} />
        <Stat label="Upcoming events" value={m.upcoming.length} icon={<CalendarDays className="size-4" />} />
        <Stat label="Capacity used" value={`${Math.round(m.upcomingUtilisation * 100)}%`} hint="Upcoming sessions" icon={<Users className="size-4" />} />
        <Stat label="Revenue (net)" value={inrPlain(m.net)} hint="After 12% commission" icon={<IndianRupee className="size-4" />} />
        <Stat label="Repeat customers" value={`${Math.round(m.repeatRate * 100)}%`} hint="Of attendees" icon={<Repeat className="size-4" />} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        <Card className="p-5">
          <SectionTitle title="Your quiet hours, filled" sub="Weekday occupancy by hour, before and after hosting sessions (illustrative)." />
          <OccupancyChart />
        </Card>
        <Card className="flex flex-col p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-sunrise" />
            <h3 className="font-display text-base font-semibold">Demand near you</h3>
          </div>
          <p className="mt-1 text-[13px] text-muted">Members within 3 km who shared free time, by window. Counts only, no personal data.</p>
          <ul className="mt-4 space-y-3">
            {[
              ["Wed 2–6 PM", 46, "coffee, board games"],
              ["Thu 11 AM–4 PM", 31, "networking, art"],
              ["Fri 3–7 PM", 38, "film, coffee"],
              ["Sat 10 AM–2 PM", 52, "brunch, walks"],
            ].map(([w, n, top]) => (
              <li key={w as string}>
                <div className="flex justify-between text-[13px]">
                  <span className="font-semibold">{w}</span>
                  <span className="text-muted">{n} members</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-canvas">
                  <div className="free-band h-full rounded-full" style={{ width: `${((n as number) / 60) * 100}%` }} />
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted">Top interests: {top}</div>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4">
            <div className="rounded-xl bg-sunrise-soft p-3 text-[12.5px] text-sunrise-deep">
              <span className="font-semibold">23 members requested</span> a coffee-and-conversation session on Friday afternoons.
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        <div>
          <SectionTitle title="Your experiences" action={<Link href="/business/bookings" className="text-[13px] font-semibold text-sunrise-deep hover:underline">Manage bookings</Link>} />
          <div className="space-y-3">
            {m.mine.map((p) => {
              const taken = activeParticipants(p).length;
              return (
                <Card key={p.id} className="flex items-center gap-4 p-3">
                  <Cover image={p.image} alt={p.title} className="size-16 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold">{p.title}</span>
                      {p.status === "review" && <Badge tone="warn">In review</Badge>}
                      {p.status === "live" && <Badge tone="ok">Live</Badge>}
                      {p.status === "completed" && <Badge tone="iris">Completed</Badge>}
                      {p.status === "cancelled" && <Badge tone="danger">Cancelled</Badge>}
                    </div>
                    <div className="text-[12.5px] text-muted">
                      {fmtDate(p.date)} · {fmtTime(p.start)} · {inrPlain(p.price)}
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas">
                      <div className="h-full rounded-full bg-ink" style={{ width: `${(taken / p.capacity) * 100}%` }} />
                    </div>
                  </div>
                  <div className="hidden text-right text-[12.5px] sm:block">
                    <div className="font-display text-lg font-semibold">
                      {taken}/{p.capacity}
                    </div>
                    <div className="text-muted">booked</div>
                  </div>
                </Card>
              );
            })}
          </div>
          {review.length > 0 && <p className="mt-3 text-[12.5px] text-muted">Listings in review are checked by the After Hours hub team before members can see them.</p>}
        </div>
        <Card className="h-fit p-5">
          <h3 className="font-display text-base font-semibold">Recent bookings</h3>
          <ul className="mt-3 space-y-3">
            {recent.map(({ p, pt }, i) => {
              const person = PEOPLE.find((x) => x.id === pt.personId);
              const name = pt.personId === "riya" ? "Riya" : person?.name ?? "Member";
              return (
                <li key={i} className="flex items-center gap-3">
                  <Avatar src={pt.personId === "riya" ? useDemo.getState().profile.avatar : person?.avatar} name={name} size={32} />
                  <div className="min-w-0 flex-1 text-[13px]">
                    <span className="font-semibold">{name}</span> <span className="text-muted">booked {p.title}</span>
                  </div>
                  <Badge tone={pt.status === "pending" ? "neutral" : "ok"}>{pt.status === "pending" ? "Applied" : "Paid"}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

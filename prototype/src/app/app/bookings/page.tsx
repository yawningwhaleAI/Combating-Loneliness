"use client";

import { Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge, Card, Chip, Cover, EmptyState, StatusChip } from "@/components/ui";
import { cn, fmtDate, fmtTime, inr } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

type Tab = "upcoming" | "past" | "cancelled";

export default function Bookings() {
  const bookings = useDemo((s) => s.bookings);
  const plans = useDemo((s) => s.plans);
  const [tab, setTab] = useState<Tab>("upcoming");
  const list = bookings
    .filter((b) => (tab === "cancelled" ? b.status === "cancelled" : tab === "past" ? b.status === "attended" : b.status !== "cancelled" && b.status !== "attended"))
    .map((b) => ({ b, plan: plans.find((p) => p.id === b.planId)! }))
    .filter((x) => x.plan)
    .sort((a, b) => a.plan.date.localeCompare(b.plan.date) || a.plan.start - b.plan.start);

  return (
    <div>
      <h1 className="font-display text-[30px] font-semibold">Bookings</h1>
      <p className="mt-1 text-[15px] text-muted">Confirmed, provisional and pending places look different, so you always know where you stand.</p>
      <div className="mt-5 flex gap-2">
        {(["upcoming", "past", "cancelled"] as Tab[]).map((t) => (
          <Chip key={t} selected={tab === t} onClick={() => setTab(t)} className="capitalize">
            {t}
          </Chip>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {list.length === 0 && (
          <EmptyState
            icon={<Ticket className="size-5" />}
            title={tab === "upcoming" ? "No upcoming plans" : tab === "past" ? "Nothing attended yet" : "No cancellations"}
            body={tab === "upcoming" ? "Find something that fits your free time." : "Your history will show up here."}
            action={tab === "upcoming" ? <Link href="/app/free" className="text-sm font-semibold underline">Open Free With Me</Link> : undefined}
          />
        )}
        {list.map(({ b, plan }) => (
          <Link key={b.id} href={b.status === "cancelled" ? `/app/plans/${plan.id}` : `/app/bookings/${plan.id}`}>
            <Card className={cn("flex items-center gap-4 p-3 transition hover:shadow-[var(--shadow-lift)]", b.status === "cancelled" && "opacity-75")}>
              <Cover image={plan.image} alt={plan.title} className="size-20 shrink-0 rounded-xl sm:size-24" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip status={b.status} />
                  {b.refund !== "none" && <Badge tone={b.refund === "refunded" ? "ok" : "warn"}>Refund {b.refund}</Badge>}
                </div>
                <div className="mt-1.5 truncate font-display text-[17px] font-semibold">{plan.title}</div>
                <div className="text-[13px] text-muted">
                  {fmtDate(plan.date)} · {fmtTime(plan.start)} · {plan.venue.name}
                </div>
              </div>
              <div className="hidden text-right sm:block">
                <div className="font-display text-lg font-semibold">{inr(b.amount)}</div>
                <div className="text-[11.5px] text-muted">{b.method === "free" ? "No payment" : `Paid by ${b.method === "upi" ? "UPI" : b.method === "card" ? "card" : "card hold"} (simulated)`}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

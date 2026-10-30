"use client";

import { Check, CheckCircle2, ClipboardCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BUSINESS_ID } from "@/components/business/business-shell";
import { Avatar, Badge, Button, Card, Confirm, EmptyState, StatusChip } from "@/components/ui";
import { interestLabel } from "@/data/catalog";
import { PEOPLE } from "@/data/seed";
import { settlementFor } from "@/lib/economics";
import { activeParticipants } from "@/lib/matching";
import { cn, fmtDate, fmtTime, inrPlain } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

export default function BusinessBookings() {
  const s = useDemo();
  const setFlag = s.setFlag;
  useEffect(() => setFlag("visitedBizBookings"), [setFlag]);
  const mine = s.plans.filter((p) => p.organiserId === BUSINESS_ID && p.status !== "rejected");
  const [selected, setSelected] = useState(mine.find((p) => p.id === "p_coffee")?.id ?? mine[0]?.id);
  const [confirm, setConfirm] = useState<"complete" | "cancel" | null>(null);
  const plan = mine.find((p) => p.id === selected);

  if (!plan) return <EmptyState icon={<ClipboardCheck className="size-5" />} title="No experiences yet" body="Publish your first experience to start receiving bookings." />;

  const all = plan.participants;
  const confirmed = all.filter((p) => p.status === "confirmed" || p.status === "provisional");
  const pending = all.filter((p) => p.status === "pending");
  const checkedIn = confirmed.filter((p) => p.checkedIn).length;
  const taken = activeParticipants(plan).length;
  const settlement = settlementFor(plan);
  const person = (id: string) => (id === "riya" ? { name: "Riya", avatar: s.profile.avatar, interests: s.profile.interests } : PEOPLE.find((p) => p.id === id));
  const editable = plan.status === "live";

  return (
    <div>
      <h1 className="font-display text-[30px] font-semibold">Manage bookings</h1>
      <p className="mt-1 text-[15px] text-muted">Approve applications, check people in and complete the event to trigger settlement.</p>

      <div className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-1">
        {mine.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={cn("shrink-0 rounded-2xl border px-4 py-2.5 text-left transition", p.id === selected ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink/30")}
          >
            <div className="text-[13.5px] font-semibold">{p.title}</div>
            <div className={cn("text-[11.5px]", p.id === selected ? "text-white/65" : "text-muted")}>
              {fmtDate(p.date)} · {fmtTime(p.start)} · {p.status === "review" ? "In review" : p.status}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Confirmed", confirmed.length],
              ["Pending applications", pending.length],
              ["Available", Math.max(0, plan.capacity - taken)],
              ["Checked in", `${checkedIn}/${confirmed.length}`],
            ].map(([k, v]) => (
              <Card key={k as string} className="p-4">
                <div className="text-[12px] font-semibold text-muted">{k}</div>
                <div className="mt-1 font-display text-2xl font-semibold">{v}</div>
              </Card>
            ))}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-ink" style={{ width: `${(taken / plan.capacity) * 100}%` }} />
          </div>

          {plan.status === "review" && <Card className="border-warn/30 bg-warn-soft/50 p-4 text-sm">This experience is waiting for After Hours review. Bookings open once it&apos;s approved.</Card>}
          {plan.status === "cancelled" && <Card className="border-danger/30 bg-danger-soft/50 p-4 text-sm">Cancelled. All attendees were notified and refunds are processing.</Card>}

          {pending.length > 0 && (
            <Card className="overflow-hidden">
              <div className="border-b border-line px-5 py-3 font-display text-base font-semibold">Pending applications</div>
              <ul className="divide-y divide-line">
                {pending.map((pt) => {
                  const p = person(pt.personId);
                  return (
                    <li key={pt.personId} className="flex flex-wrap items-center gap-3 px-5 py-3">
                      <Avatar src={p?.avatar} name={p?.name ?? "?"} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{p?.name}</div>
                        <div className="truncate text-[12px] text-muted">{p?.interests.slice(0, 3).map(interestLabel).join(", ")}</div>
                      </div>
                      <Button size="sm" variant="secondary" disabled={!editable} onClick={() => { s.declineApplication(plan.id, pt.personId); toast(`${p?.name}'s application declined`); }}>
                        <X className="size-3.5" /> Decline
                      </Button>
                      <Button size="sm" disabled={!editable} onClick={() => { s.approveApplication(plan.id, pt.personId); toast.success(`${p?.name} approved and placed in a group`); }}>
                        <Check className="size-3.5" /> Approve
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <span className="font-display text-base font-semibold">Participants</span>
              <span className="text-[12px] text-muted">First names only · contact via After Hours</span>
            </div>
            {confirmed.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">No confirmed participants yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="text-left text-[11.5px] uppercase tracking-wide text-muted">
                      <th className="px-5 py-2 font-semibold">Member</th>
                      <th className="px-2 py-2 font-semibold">Status</th>
                      <th className="px-2 py-2 font-semibold">Group</th>
                      <th className="px-5 py-2 text-right font-semibold">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {confirmed.map((pt) => {
                      const p = person(pt.personId);
                      const g = plan.groups.find((x) => x.id === pt.groupId);
                      return (
                        <tr key={pt.personId}>
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar src={p?.avatar} name={p?.name ?? "?"} size={30} />
                              <span className="font-semibold">{p?.name}</span>
                              {pt.personId === "riya" && <Badge tone="accent">Demo member</Badge>}
                            </div>
                          </td>
                          <td className="px-2 py-2.5"><StatusChip status={pt.status} /></td>
                          <td className="px-2 py-2.5 text-muted">{g?.label ?? "–"}</td>
                          <td className="px-5 py-2.5 text-right">
                            <button
                              disabled={plan.status === "cancelled"}
                              onClick={() => s.toggleAttendance(plan.id, pt.personId)}
                              className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition disabled:opacity-40", pt.checkedIn ? "bg-ok-soft text-ok" : "bg-canvas text-muted hover:text-ink")}
                            >
                              {pt.checkedIn ? <><Check className="size-3" strokeWidth={3} /> Checked in</> : "Mark checked in"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="font-display text-base font-semibold">Event actions</h3>
            <div className="mt-3 space-y-2">
              <Button className="w-full" disabled={!editable} onClick={() => setConfirm("complete")}>
                <CheckCircle2 className="size-4" /> Complete event
              </Button>
              <Button className="w-full" variant="secondary" disabled={!editable} onClick={() => setConfirm("cancel")}>
                Cancel experience
              </Button>
            </div>
            {plan.status === "completed" && <p className="mt-3 rounded-xl bg-ok-soft p-3 text-[12.5px] font-semibold text-ok">Completed. Settlement scheduled.</p>}
          </Card>
          <Card className="p-5 text-[13px]">
            <h3 className="font-display text-base font-semibold">Settlement preview</h3>
            <div className="mt-3 space-y-1.5">
              <Row k="Confirmed bookings" v={String(settlement.bookings)} />
              <Row k="Bookings value (GMV)" v={inrPlain(settlement.gmv)} />
              <Row k="After Hours commission (12%)" v={`−${inrPlain(settlement.commission)}`} />
              <div className="flex justify-between border-t border-line pt-1.5 font-bold">
                <span>Net settlement</span>
                <span>{inrPlain(settlement.net)}</span>
              </div>
            </div>
            <p className="mt-2 text-[11.5px] text-muted">Paid to your bank account 3 working days after the event is completed. Simulated.</p>
          </Card>
        </aside>
      </div>

      <Confirm
        open={confirm === "complete"}
        onClose={() => setConfirm(null)}
        title="Complete this event?"
        body={`${checkedIn} of ${confirmed.length} people are checked in. Completing locks attendance and schedules a settlement of ${inrPlain(settlement.net)}.`}
        confirmLabel="Complete event"
        onConfirm={() => {
          s.completePlan(plan.id);
          toast.success("Event completed. Settlement scheduled.");
        }}
      />
      <Confirm
        open={confirm === "cancel"}
        onClose={() => setConfirm(null)}
        title="Cancel this experience?"
        body="Everyone booked is notified straight away and refunded in full. Frequent cancellations affect your listing's ranking."
        confirmLabel="Cancel experience"
        tone="danger"
        onConfirm={() => {
          s.cancelPlan(plan.id);
          toast.success("Experience cancelled. Refunds are processing.");
        }}
      />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

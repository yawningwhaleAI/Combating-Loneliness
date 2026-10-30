"use client";

import { ArrowLeft, CalendarDays, Check, Clock, Copy, Flag, MapPin, Phone, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BookingFlow, modeCopy, PriceBreakdown } from "@/components/member/booking-flow";
import { groupFormat, participantPeople, usePlanEval } from "@/components/member/plan-card";
import { ReportModal } from "@/components/member/safety";
import { MiniMap } from "@/components/shared/mini-map";
import { Avatar, Badge, Button, Card, Confirm, Cover, EmptyState, Modal, StatusChip, Verified } from "@/components/ui";
import { imageUrl } from "@/data/catalog";
import { PEOPLE } from "@/data/seed";
import { cn, fmtDate, fmtDuration, fmtRange, inr } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const plan = useDemo((s) => s.plans.find((p) => p.id === id));
  const organiser = useDemo((s) => s.organisers.find((o) => o.id === plan?.organiserId));
  const booking = useDemo((s) => s.bookings.find((b) => b.planId === id && b.status !== "cancelled"));
  const avatar = useDemo((s) => s.profile.avatar);
  const connections = useDemo((s) => s.connections);
  const cancelBooking = useDemo((s) => s.cancelBooking);
  const ev = usePlanEval(plan);
  const [bookOpen, setBookOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!plan || !ev) return <EmptyState icon={<X className="size-5" />} title="This plan isn't available" body="It may have been cancelled or removed." action={<Link href="/app/free" className="text-sm font-semibold underline">Back to Free With Me</Link>} />;

  const people = participantPeople(plan, avatar);
  const copy = modeCopy(plan);
  const live = plan.status === "live";
  const filled = plan.capacity - ev.spotsLeft;

  return (
    <div>
      <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Back
      </button>
      <Cover image={plan.image} alt={plan.title} className="aspect-[16/9] rounded-3xl sm:aspect-[21/8]">
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-8">
          <div className="flex flex-wrap gap-2">
            <Badge tone="dark" className="bg-white/15 backdrop-blur">{plan.category}</Badge>
            {plan.communityHosted && <Badge tone="dark" className="bg-white/15 backdrop-blur">Community host · free listing</Badge>}
            <Badge tone="dark" className="bg-white/15 backdrop-blur">Demo listing</Badge>
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-[42px]">{plan.title}</h1>
          <p className="mt-1 text-white/80">{plan.tagline}</p>
        </div>
      </Cover>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact icon={CalendarDays} k="Date" v={fmtDate(plan.date)} />
            <Fact icon={Clock} k="Time" v={fmtRange(plan.start, plan.start + plan.durationMin)} />
            <Fact icon={MapPin} k="Distance" v={`${plan.venue.distanceKm} km away`} />
            <Fact icon={Users} k="Format" v={plan.groupSize ? `Groups of ${plan.groupSize}` : "Open group"} />
          </div>

          <section>
            <H>About this experience</H>
            <p className="text-[15px] leading-relaxed text-ink/85">{plan.description}</p>
          </section>

          <section>
            <H>What&apos;s included</H>
            <ul className="grid gap-2 sm:grid-cols-2">
              {plan.inclusions.map((i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="grid size-5 place-items-center rounded-full bg-ok-soft text-ok">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {i}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <H>Who&apos;s going</H>
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold">
                  {filled} of {plan.capacity} places taken · {groupFormat(plan)}
                </span>
                <span className="text-muted">{ev.spotsLeft} spots left</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas">
                <div className="h-full rounded-full bg-ink" style={{ width: `${(filled / plan.capacity) * 100}%` }} />
              </div>
              {plan.groupSize && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {plan.groups.map((g) => (
                    <div key={g.id} className="rounded-xl border border-line px-3 py-2">
                      <div className="text-[11.5px] font-semibold text-muted">{g.label}</div>
                      <div className="mt-1 flex gap-1">
                        {Array.from({ length: plan.groupSize! }).map((_, i) => (
                          <span key={i} className={cn("size-2.5 rounded-full", i < g.memberIds.length ? (g.memberIds[i] === "riya" ? "bg-sunrise" : "bg-ink") : "bg-line")} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                {people.map((p) => {
                  const known = connections.some((c) => c.personId === p.id);
                  return (
                    <div key={p.id} className="flex w-16 flex-col items-center text-center">
                      <Avatar src={p.avatar} name={p.name} size={44} className={known ? "ring-2 ring-iris ring-offset-2" : ""} />
                      <span className="mt-1 truncate text-[12px] font-semibold">{p.name}</span>
                      {known && <span className="text-[10px] font-semibold text-iris">Met before</span>}
                    </div>
                  );
                })}
              </div>
              {plan.groupSize && <p className="mt-4 text-[12.5px] text-muted">You&apos;ll be placed at one table with up to {plan.groupSize - 1} others, matched on shared interests and people you&apos;ve met.</p>}
            </Card>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <div className="text-[12px] font-semibold text-muted">Hosted by</div>
              <div className="mt-2 flex items-center gap-3">
                <Avatar src={organiser ? imageUrl(organiser.avatar, 200) : undefined} name={organiser?.name ?? "Host"} size={44} />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{organiser?.name}</div>
                  {organiser && <Verified status={organiser.verification} label={organiser.type === "business" ? "Verified business" : "ID-verified host"} />}
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">{organiser?.bio}</p>
              {organiser?.rating && <div className="mt-2 text-[12.5px] font-semibold">★ {organiser.rating} from past members</div>}
            </Card>
            <Card className="p-5">
              <div className="text-[12px] font-semibold text-muted">Venue</div>
              <div className="mt-2 font-semibold">{plan.venue.name}</div>
              <div className="text-[13px] text-muted">{plan.venue.address}</div>
              <MiniMap className="mt-3" />
              <div className="mt-2 flex gap-2">
                <Badge>{plan.venue.type}</Badge>
                <Badge>{plan.venue.distanceKm} km from {plan.venue.area === "DLF Phase 4" ? "you" : "DLF Phase 4"}</Badge>
              </div>
            </Card>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <H>Good to know</H>
              <ul className="space-y-1.5 text-sm text-ink/85">
                {plan.rules.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
                <li>• Eligibility: {plan.eligibility}</li>
              </ul>
            </div>
            <div>
              <H>Cancellation policy</H>
              <p className="text-sm leading-relaxed text-ink/85">{plan.cancellation}</p>
            </div>
          </section>

          <section className="rounded-2xl bg-ink p-5 text-white sm:p-6">
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <ShieldCheck className="size-5 text-dawn" /> Trust & safety
            </div>
            <div className="mt-4 grid gap-4 text-[13px] text-white/75 sm:grid-cols-3">
              <div>
                <div className="font-semibold text-white">Public venue</div>
                Reviewed for capacity, hours and permissions before listing.
              </div>
              <div>
                <div className="font-semibold text-white">Named event lead</div>
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3" /> {plan.eventLead.name} · {plan.eventLead.phone}
                </span>
              </div>
              <div>
                <div className="font-semibold text-white">Verification, explained</div>
                We check ID and documents. That doesn&apos;t guarantee anyone&apos;s behaviour, so reporting is always one tap away.
              </div>
            </div>
            <button onClick={() => setReportOpen(true)} className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/80 hover:text-white">
              <Flag className="size-3.5" /> Report this experience
            </button>
          </section>
        </div>

        <aside>
          <div className="sticky top-20 space-y-4">
            <Card className="p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl font-semibold">{inr(plan.price)}</span>
                <span className="text-[13px] text-muted">per person</span>
              </div>
              <div className="mt-1 text-[13px] text-muted">
                {fmtDate(plan.date, true)} · {fmtDuration(plan.durationMin)}
              </div>

              <div className="mt-4 space-y-1.5 rounded-2xl bg-canvas p-3.5">
                <div className="mb-1 text-[11.5px] font-bold uppercase tracking-wide text-muted">Fit check</div>
                {ev.checks.map((c) => (
                  <div key={c.key} className="flex items-start gap-2 text-[13px]">
                    {c.ok ? <Check className="mt-0.5 size-3.5 shrink-0 text-ok" strokeWidth={3} /> : <X className="mt-0.5 size-3.5 shrink-0 text-danger" strokeWidth={3} />}
                    <span className={c.ok ? "" : "font-semibold"}>{c.label}</span>
                  </div>
                ))}
              </div>

              {booking ? (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-2xl border border-line p-3">
                    <span className="text-sm font-semibold">Your place</span>
                    <StatusChip status={booking.status} />
                  </div>
                  <Button className="w-full" size="lg" onClick={() => router.push(`/app/bookings/${plan.id}`)}>
                    {plan.groupSize && booking.status !== "pending" ? "View my group" : "View booking"}
                  </Button>
                  {booking.status !== "attended" && (
                    <Button className="w-full" variant="ghost" onClick={() => setCancelOpen(true)}>
                      Cancel booking
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <p className="text-[12.5px] leading-relaxed text-muted">{copy.explain}</p>
                  <Button className="w-full" size="lg" variant="accent" disabled={!live || ev.spotsLeft === 0 || ev.past} onClick={() => setBookOpen(true)}>
                    {!live ? "Not open for booking" : ev.spotsLeft === 0 ? "Full" : ev.past ? "Already started" : copy.cta}
                  </Button>
                  {!ev.fits && live && !ev.past && ev.spotsLeft > 0 && <p className="text-center text-[12px] font-semibold text-warn">This is outside your shared free time. You can still book.</p>}
                  <Button className="w-full" variant="secondary" onClick={() => setInviteOpen(true)}>
                    <UserPlus className="size-4" /> Invite a friend
                  </Button>
                </div>
              )}
            </Card>
            <PriceBreakdown plan={plan} className="bg-surface" />
          </div>
        </aside>
      </div>

      <BookingFlow plan={plan} open={bookOpen} onClose={() => setBookOpen(false)} />
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} planId={plan.id} title={plan.title} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} kind="experience" targetId={plan.id} targetLabel={plan.title} />
      <Confirm
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this booking?"
        body={<>{plan.cancellation} {booking?.amount ? "Your refund will be processed to the original payment method." : ""}</>}
        confirmLabel="Cancel booking"
        tone="danger"
        onConfirm={() => {
          if (booking) cancelBooking(booking.id);
          toast.success(booking?.amount ? `Booking cancelled. Refund of ${inr(booking.amount)} is processing.` : "Booking cancelled");
        }}
      />
    </div>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 font-display text-lg font-semibold">{children}</h2>;
}

function Fact({ icon: Icon, k, v }: { icon: typeof Clock; k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <Icon className="size-4 text-sunrise" />
      <div className="mt-2 text-[11.5px] font-semibold text-muted">{k}</div>
      <div className="text-[13.5px] font-semibold">{v}</div>
    </div>
  );
}

const NONE: string[] = [];

function InviteModal({ open, onClose, planId, title }: { open: boolean; onClose: () => void; planId: string; title: string }) {
  const connections = useDemo((s) => s.connections);
  const invite = useDemo((s) => s.invite);
  const already = useDemo((s) => s.invites.find((i) => i.planId === planId)?.personIds) ?? NONE;
  const [sel, setSel] = useState<string[]>([]);
  const link = `https://afterhours.app/p/${planId}`;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 sm:p-7">
        <h3 className="pr-10 font-display text-xl font-semibold">Invite a friend</h3>
        <p className="mt-1 text-sm text-muted">They&apos;ll see {title} and whether it fits their own free time.</p>
        <div className="mt-5 space-y-2">
          {connections.map((c) => {
            const p = PEOPLE.find((x) => x.id === c.personId)!;
            const done = already.includes(p.id);
            const on = sel.includes(p.id);
            return (
              <button
                key={p.id}
                disabled={done}
                onClick={() => setSel((x) => (on ? x.filter((y) => y !== p.id) : [...x, p.id]))}
                className={cn("flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition", on ? "border-ink" : "border-line hover:border-ink/30", done && "opacity-60")}
              >
                <Avatar src={p.avatar} name={p.name} size={36} />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-[12px] text-muted">Met at {c.viaLabel}</div>
                </div>
                {done ? <Badge tone="ok">Invited</Badge> : <span className={cn("grid size-5 place-items-center rounded-md border", on ? "border-ink bg-ink text-white" : "border-line")}>{on && <Check className="size-3" strokeWidth={3} />}</span>}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-canvas p-2 pl-3.5 text-[13px]">
          <span className="flex-1 select-all truncate font-mono text-[12px] text-muted">{link}</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              navigator.clipboard?.writeText(link).then(
                () => toast.success("Invite link copied"),
                () => toast("Select the link above to copy it"),
              );
            }}
          >
            <Copy className="size-3.5" /> Copy
          </Button>
        </div>
        <Button
          className="mt-5 w-full"
          size="lg"
          disabled={!sel.length}
          onClick={() => {
            invite(planId, [...already, ...sel]);
            toast.success(`Invitation sent to ${sel.map((id) => PEOPLE.find((p) => p.id === id)?.name).join(", ")}`);
            setSel([]);
            onClose();
          }}
        >
          Send invitation{sel.length > 1 ? "s" : ""}
        </Button>
      </div>
    </Modal>
  );
}

"use client";

import { ArrowLeft, CalendarDays, Check, Clock3, Flag, Heart, Info, MapPin, MessageSquareText, MoreHorizontal, Phone, QrCode, Send, ShieldBan, Sparkles, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { MeetAgainModal } from "@/components/member/meet-again";
import { ReportModal } from "@/components/member/safety";
import { Annotation, Avatar, Badge, Button, Card, Confirm, EmptyState, Modal, StatusChip } from "@/components/ui";
import { interestLabel } from "@/data/catalog";
import { PEOPLE } from "@/data/seed";
import { explainGroup, sharedInterests } from "@/lib/matching";
import type { Person } from "@/lib/types";
import { cn, fmtDate, fmtRange } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const s = useDemo();
  const plan = s.plans.find((p) => p.id === id);
  const booking = s.bookings.find((b) => b.planId === id && b.status !== "cancelled");
  const group = plan?.groups.find((g) => g.id === booking?.groupId);
  const meet = s.meetAgain.find((m) => m.planId === id);
  const [meetOpen, setMeetOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [profileOf, setProfileOf] = useState<Person | null>(null);
  const [reportOf, setReportOf] = useState<Person | null>(null);
  const [blockOf, setBlockOf] = useState<Person | null>(null);
  const [checking, setChecking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const membersRef = useRef<HTMLDivElement>(null);
  const setFlag = s.setFlag;

  useEffect(() => {
    if (group) setFlag("viewedGroup");
  }, [group, setFlag]);

  const members = useMemo(() => (group?.memberIds ?? []).filter((m) => m !== "riya" && !s.blocked.includes(m)).map((m) => PEOPLE.find((p) => p.id === m)!).filter(Boolean), [group, s.blocked]);
  const explanation = useMemo(() => explainGroup(group?.memberIds ?? [], s.profile.interests, PEOPLE, s.connections), [group, s.profile.interests, s.connections]);

  if (!plan || !booking)
    return (
      <EmptyState
        icon={<Users className="size-5" />}
        title="No booking for this plan"
        body="Book a place first and your group will appear here."
        action={
          <Link href={plan ? `/app/plans/${plan.id}` : "/app/free"} className="text-sm font-semibold underline">
            {plan ? "View the plan" : "Find a plan"}
          </Link>
        }
      />
    );

  const attended = booking.status === "attended";
  const messages = s.messages.filter((m) => m.planId === plan.id && m.groupId === group?.id);
  const organiser = s.organisers.find((o) => o.id === plan.organiserId);

  return (
    <div>
      <button onClick={() => router.push("/app/bookings")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> My bookings
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={booking.status} />
            {group && <Badge tone="dark">{group.label} · {group.memberIds.length} members</Badge>}
          </div>
          <h1 className="mt-2 font-display text-[30px] font-semibold leading-tight">{plan.title}</h1>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />{fmtDate(plan.date, true)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" />{fmtRange(plan.start, plan.start + plan.durationMin)}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{plan.venue.name}</span>
          </div>
        </div>
      </div>

      {booking.status === "pending" && (
        <Card className="mt-6 p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 size-5 text-muted" />
            <div>
              <div className="font-semibold">Your application is with {organiser?.name}</div>
              <p className="mt-1 text-sm text-muted">Your place isn&apos;t secured yet and you haven&apos;t been charged. Once the host approves, you&apos;ll be placed in a small group and it will show here.</p>
            </div>
          </div>
        </Card>
      )}

      {!group && booking.status !== "pending" && (
        <Card className="mt-6 p-5">
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 size-5 text-muted" />
            <div>
              <div className="font-semibold">Open-group experience</div>
              <p className="mt-1 text-sm text-muted">
                No assigned tables here. Event lead: {plan.eventLead.name} ({plan.eventLead.phone}). Meet at {plan.venue.address}.
              </p>
              <Link href={`/app/plans/${plan.id}`} className="mt-2 inline-block text-sm font-semibold text-sunrise-deep hover:underline">
                View event details
              </Link>
            </div>
          </div>
        </Card>
      )}

      {group && (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => membersRef.current?.scrollIntoView({ behavior: "smooth" })}><Users className="size-4" /> View group</Button>
            <Button variant="secondary" size="sm" onClick={() => setIntroOpen(true)}><Sparkles className="size-4" /> Introduce yourself</Button>
            <Button variant="secondary" size="sm" onClick={() => { chatRef.current?.scrollIntoView({ behavior: "smooth" }); chatRef.current?.querySelector("input")?.focus(); }}><MessageSquareText className="size-4" /> Message group</Button>
            <Button variant="secondary" size="sm" onClick={() => router.push(`/app/plans/${plan.id}`)}><Info className="size-4" /> View event details</Button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="min-w-0 space-y-6">
              <Card className="overflow-hidden">
                <div className="bg-ink p-5 text-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-dawn">Why this group</span>
                    <Annotation label="Rules-based matching" className="border-white/20 bg-white/10 text-white" />
                  </div>
                  <p className="mt-2 font-display text-xl font-semibold leading-snug">{explanation.sentence}</p>
                  {explanation.familiar.length > 0 && <p className="mt-1 text-sm text-white/75">You&apos;re seated with {explanation.familiar.map((f) => f.name).join(", ")}, who you&apos;ve met before.</p>}
                </div>
                <div className="grid gap-px bg-line sm:grid-cols-3">
                  {[
                    ["Shared interests", [...explanation.sharedCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([i, n]) => `${interestLabel(i)} (${n} of ${members.length})`).join(" · ") || "Balanced for new introductions"],
                    ["Familiar faces", explanation.familiar.length ? `${explanation.familiar.length} person you know, kept together` : "All new introductions"],
                    ["Group size", `${group.memberIds.length} of ${plan.groupSize}, your preferred size is ${s.profile.groupSize}`],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-surface p-4">
                      <div className="text-[11.5px] font-bold uppercase tracking-wide text-muted">{k}</div>
                      <div className="mt-1 text-[13px] font-semibold">{v}</div>
                    </div>
                  ))}
                </div>
                <p className="border-t border-line px-5 py-3 text-[12px] text-muted">Matching uses explainable rules, not AI: interests you chose, people you&apos;ve met, and table size. Nothing else.</p>
              </Card>

              <div ref={membersRef} className="scroll-mt-20">
                <h2 className="mb-3 font-display text-lg font-semibold">Your table</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {members.map((p) => {
                    const shared = sharedInterests(s.profile.interests, p.interests);
                    const known = s.connections.find((c) => c.personId === p.id);
                    return (
                      <Card key={p.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar src={p.avatar} name={p.name} size={52} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold">{p.name}, {p.age}</span>
                              {known && <Badge tone="iris">Met at {known.viaLabel}</Badge>}
                            </div>
                            <div className="text-[12px] text-muted">{p.occupation.split(" · ")[0]}</div>
                          </div>
                          <PersonMenu onProfile={() => setProfileOf(p)} onReport={() => setReportOf(p)} onBlock={() => setBlockOf(p)} />
                        </div>
                        <p className="mt-3 text-[13px] leading-relaxed text-ink/80">{p.intro}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {p.interests.map((i) => (
                            <span key={i} className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-semibold", shared.includes(i) ? "bg-sunrise-soft text-sunrise-deep" : "bg-canvas text-muted")}>
                              {interestLabel(i)}
                            </span>
                          ))}
                        </div>
                        {shared.length > 0 && <div className="mt-2 text-[11.5px] font-semibold text-sunrise-deep">{shared.length} shared interest{shared.length > 1 ? "s" : ""}</div>}
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <Card className="p-5">
                <h3 className="font-display text-base font-semibold">On the day</h3>
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-canvas p-3 text-[13px]">
                  <span className="grid size-9 place-items-center rounded-full bg-surface"><UserRound className="size-4" /></span>
                  <div>
                    <div className="font-semibold">Event lead: {plan.eventLead.name}</div>
                    <div className="inline-flex items-center gap-1 text-muted"><Phone className="size-3" /> {plan.eventLead.phone}</div>
                  </div>
                </div>
                {!attended && !booking.checkedIn && (
                  <Button
                    className="mt-4 w-full"
                    size="lg"
                    loading={checking}
                    onClick={() => {
                      setChecking(true);
                      setTimeout(() => {
                        s.checkIn(plan.id);
                        setChecking(false);
                        toast.success(`Checked in at ${plan.venue.name}`);
                      }, 900);
                    }}
                  >
                    <QrCode className="size-4" /> Check in at venue
                  </Button>
                )}
                {!attended && booking.checkedIn && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 rounded-2xl bg-ok-soft p-3 text-sm font-semibold text-ok"><Check className="size-4" strokeWidth={3} /> Checked in. Enjoy!</div>
                    <Button
                      className="w-full"
                      size="lg"
                      variant="accent"
                      onClick={() => {
                        s.finishExperience(plan.id);
                        setMeetOpen(true);
                      }}
                    >
                      Experience finished
                    </Button>
                  </div>
                )}
                {!attended && <p className="mt-3 text-[11.5px] text-muted">Demo: check-in is simulated (normally a QR code at the venue). Finishing moves the demo clock forward.</p>}
                {attended && !meet && (
                  <div className="mt-4 rounded-2xl border border-sunrise/30 bg-sunrise-soft/60 p-4">
                    <div className="flex items-center gap-1.5 font-semibold"><Heart className="size-4 text-sunrise" /> How was it?</div>
                    <p className="mt-1 text-[13px] text-muted">Privately choose who you&apos;d like to meet again.</p>
                    <Button className="mt-3 w-full" variant="accent" onClick={() => setMeetOpen(true)}>Meet again?</Button>
                  </div>
                )}
                {attended && meet && (
                  <div className="mt-4 rounded-2xl bg-canvas p-4 text-[13px]">
                    <div className="font-semibold">Meet again: saved</div>
                    {meet.mutual.length ? (
                      <p className="mt-1 text-muted">
                        Mutual with <span className="font-semibold text-ink">{meet.mutual.map((m) => PEOPLE.find((p) => p.id === m)?.name).join(", ")}</span>. You&apos;re connected.
                      </p>
                    ) : (
                      <p className="mt-1 text-muted">No mutual choices yet.</p>
                    )}
                    <Link href="/app/people" className="mt-2 inline-block font-semibold text-sunrise-deep hover:underline">Open My People</Link>
                  </div>
                )}
              </Card>

              <Card className="flex max-h-[460px] flex-col overflow-hidden">
                <div className="border-b border-line px-5 py-3.5">
                  <h3 className="font-display text-base font-semibold">{group.label} chat</h3>
                  <p className="text-[12px] text-muted">Only your table can see this. Closes 48 hours after the event.</p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {messages.length === 0 && <p className="text-center text-[13px] text-muted">No messages yet. Say hello!</p>}
                  {messages.map((m) => {
                    const mine = m.authorId === "riya";
                    const person = PEOPLE.find((p) => p.id === m.authorId);
                    return (
                      <div key={m.id} className={cn("flex gap-2", mine && "flex-row-reverse")}>
                        {!mine && <Avatar src={person?.avatar} name={person?.name ?? "?"} size={26} />}
                        <div className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-[13px]", mine ? "bg-ink text-white" : "bg-canvas")}>
                          {!mine && <div className="text-[11px] font-bold text-muted">{person?.name}</div>}
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div ref={chatRef} className="scroll-mt-24">
                  <ChatInput onSend={(t) => s.sendMessage(plan.id, group.id, t)} />
                </div>
              </Card>
            </aside>
          </div>
        </>
      )}

      {group && <MeetAgainModal plan={plan} memberIds={group.memberIds} open={meetOpen} onClose={() => setMeetOpen(false)} />}

      <Modal open={introOpen} onClose={() => setIntroOpen(false)}>
        <IntroComposer
          name={s.profile.name}
          interests={s.profile.interests.slice(0, 3).map(interestLabel)}
          onSend={(t) => {
            if (group) s.sendMessage(plan.id, group.id, t);
            setIntroOpen(false);
            toast.success(`Introduction sent to ${group?.label}`);
          }}
        />
      </Modal>

      <Modal open={!!profileOf} onClose={() => setProfileOf(null)}>
        {profileOf && (
          <div className="p-6 text-center sm:p-7">
            <Avatar src={profileOf.avatar} name={profileOf.name} size={88} className="mx-auto" />
            <h3 className="mt-3 font-display text-2xl font-semibold">{profileOf.name}, {profileOf.age}</h3>
            <div className="text-sm text-muted">{profileOf.area} · {profileOf.occupation.split(" · ")[0]}</div>
            <p className="mx-auto mt-3 max-w-sm text-sm">{profileOf.intro}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {profileOf.interests.map((i) => <Badge key={i}>{interestLabel(i)}</Badge>)}
            </div>
            <div className="mt-4 text-[12px] text-muted">Phone verified{profileOf.verified.workEmail ? " · Work email verified" : ""}. Verification doesn&apos;t guarantee behaviour.</div>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setReportOf(profileOf); setProfileOf(null); }}><Flag className="size-3.5" /> Report</Button>
              <Button variant="secondary" size="sm" onClick={() => { setBlockOf(profileOf); setProfileOf(null); }}><ShieldBan className="size-3.5" /> Block</Button>
            </div>
          </div>
        )}
      </Modal>
      {reportOf && <ReportModal open={!!reportOf} onClose={() => setReportOf(null)} kind="user" targetId={reportOf.id} targetLabel={reportOf.name} offerBlock />}
      <Confirm
        open={!!blockOf}
        onClose={() => setBlockOf(null)}
        title={`Block ${blockOf?.name}?`}
        body="They won't be placed in your groups, see your stories or availability, or be able to message you. They aren't notified."
        confirmLabel="Block"
        tone="danger"
        onConfirm={() => {
          if (blockOf) s.block(blockOf.id);
          toast.success(`${blockOf?.name} blocked`);
        }}
      />
    </div>
  );
}

function PersonMenu({ onProfile, onReport, onBlock }: { onProfile: () => void; onReport: () => void; onBlock: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="More options" className="grid size-8 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink">
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-[var(--shadow-lift)]">
            {[
              ["View profile", onProfile],
              ["Report", onReport],
              ["Block", onBlock],
            ].map(([l, fn]) => (
              <button key={l as string} onClick={() => { setOpen(false); (fn as () => void)(); }} className={cn("block w-full px-3.5 py-2 text-left text-[13px] font-semibold hover:bg-canvas", l !== "View profile" && "text-danger")}>
                {l as string}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChatInput({ onSend }: { onSend: (t: string) => void }) {
  const [t, setT] = useState("");
  return (
    <form
      className="flex gap-2 border-t border-line p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!t.trim()) return;
        onSend(t.trim());
        setT("");
      }}
    >
      <input id="group-chat" value={t} onChange={(e) => setT(e.target.value)} placeholder="Message your table…" className="h-10 flex-1 rounded-full border border-line px-4 text-[13px] outline-none focus:border-ink/40" />
      <button aria-label="Send" disabled={!t.trim()} className="grid size-10 place-items-center rounded-full bg-ink text-white disabled:opacity-40">
        <Send className="size-4" />
      </button>
    </form>
  );
}

function IntroComposer({ name, interests, onSend }: { name: string; interests: string[]; onSend: (t: string) => void }) {
  const [t, setT] = useState(`Hi everyone! I'm ${name}. I work rotational shifts, so weekday afternoons are my weekend. Into ${interests.join(", ").toLowerCase()}. Looking forward to meeting you all!`);
  return (
    <div className="p-6 sm:p-7">
      <h3 className="pr-10 font-display text-xl font-semibold">Introduce yourself</h3>
      <p className="mt-1 text-sm text-muted">A short hello makes the first five minutes easier for everyone.</p>
      <textarea id="intro-text" rows={5} className="mt-4 w-full rounded-2xl border border-line p-3.5 text-sm outline-none focus:border-ink/40" value={t} onChange={(e) => setT(e.target.value)} />
      <Button className="mt-4 w-full" size="lg" disabled={!t.trim()} onClick={() => onSend(t.trim())}>
        Send to my table
      </Button>
    </div>
  );
}

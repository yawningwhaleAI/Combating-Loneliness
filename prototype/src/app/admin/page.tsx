"use client";

import { AlertTriangle, BadgeCheck, Ban, CheckCircle2, Flag, IndianRupee, Phone, ShieldAlert, ShieldCheck, Users, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { DemoClock } from "@/components/member/member-shell";
import { Logo } from "@/components/shared/logo";
import { ViewSwitcher } from "@/components/shared/view-switcher";
import { Annotation, Avatar, Badge, Button, Card, Confirm, Cover, EmptyState, Modal, PageSkeleton, Stat, StatusChip, Verified } from "@/components/ui";
import { HUB, imageUrl } from "@/data/catalog";
import { HUB_STATS, PEOPLE } from "@/data/seed";
import { COMMISSION_RATE } from "@/lib/economics";
import { activeParticipants } from "@/lib/matching";
import type { Plan } from "@/lib/types";
import { cn, fmtDate, fmtRange, inrPlain } from "@/lib/utils";
import { useDemo, useHydrated } from "@/store/demo-store";

const TABS = [
  { id: "overview", label: "Hub overview" },
  { id: "experiences", label: "Experience approvals" },
  { id: "businesses", label: "Business verification" },
  { id: "members", label: "Members" },
  { id: "reports", label: "Reports" },
  { id: "bookings", label: "Bookings & refunds" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function Admin() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const router = useRouter();
  const tab = (params.get("tab") as Tab) ?? "overview";
  const s = useDemo();
  const guideOpen = s.guideOpen;
  const setRole = s.setRole;
  const setFlag = s.setFlag;
  useEffect(() => {
    if (!hydrated) return;
    setRole("admin");
    if (tab === "reports") setFlag("visitedAdminReports");
  }, [hydrated, tab, setRole, setFlag]);

  const reviewCount = s.plans.filter((p) => p.status === "review").length;
  const openReports = s.reports.filter((r) => r.status !== "resolved").length;

  return (
    <div className={cn("min-h-dvh transition-[padding] duration-300", guideOpen && "xl:pr-[380px]")}>
      <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo href="/admin" />
            <Badge tone="dark" className="hidden sm:inline-flex">Operations</Badge>
          </div>
          <div className="flex items-center gap-3">
            <DemoClock className="hidden md:inline-flex" />
            <ViewSwitcher />
          </div>
        </div>
        <nav className="scrollbar-none mx-auto flex max-w-[1240px] gap-1 overflow-x-auto px-4 sm:px-6">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => router.replace(`/admin?tab=${t.id}`)} className={cn("relative whitespace-nowrap px-3 pb-3 pt-1 text-[13.5px] font-semibold", tab === t.id ? "text-ink" : "text-muted hover:text-ink")}>
              {t.label}
              {t.id === "experiences" && reviewCount > 0 && <span className="ml-1.5 rounded-full bg-sunrise px-1.5 text-[10px] text-white">{reviewCount}</span>}
              {t.id === "reports" && openReports > 0 && <span className="ml-1.5 rounded-full bg-danger px-1.5 text-[10px] text-white">{openReports}</span>}
              {tab === t.id && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ink" />}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[1240px] px-4 pb-24 pt-6 sm:px-6">
        {!hydrated ? (
          <PageSkeleton />
        ) : (
          <>
            {tab === "overview" && <Overview />}
            {tab === "experiences" && <Experiences />}
            {tab === "businesses" && <Businesses />}
            {tab === "members" && <Members />}
            {tab === "reports" && <Reports />}
            {tab === "bookings" && <BookingsTab />}
          </>
        )}
      </main>
    </div>
  );
}

function Title({ title, sub, annotation }: { title: string; sub: string; annotation?: string }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-[28px] font-semibold">{title}</h1>
        {annotation && <Annotation label={annotation} />}
      </div>
      <p className="mt-1 text-[15px] text-muted">{sub}</p>
    </div>
  );
}

function Overview() {
  const s = useDemo();
  const ns = HUB_STATS.weeklyNorthStarBase + s.northStar.length;
  const series = [
    { w: "W40", v: 18 },
    { w: "W41", v: 24 },
    { w: "W42", v: 31 },
    { w: "W43", v: 37 },
    { w: "W44", v: 42 },
    { w: "W45", v: ns },
  ];
  const review = s.plans.filter((p) => p.status === "review").length;
  const refunds = s.bookings.filter((b) => b.refund === "processing").length + 2;
  return (
    <div className="space-y-6">
      <Title title={`${HUB.name} hub`} sub={`${HUB.city} · ${HUB.areas.length} neighbourhoods · demo week of 2 Nov 2026`} annotation="Trust operations" />
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-5">
          <div className="text-[12px] font-bold uppercase tracking-wide text-muted">North Star · this week</div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-display text-5xl font-semibold">{ns}</span>
            <Badge tone="ok">+{ns - 42} vs last week</Badge>
          </div>
          <p className="mt-1 max-w-md text-[13px] text-muted">Weekly unique members attending a gathering with someone they met through After Hours at an earlier gathering.</p>
          {s.northStar.length > 0 && <p className="mt-2 text-[12.5px] font-semibold text-iris">Includes Riya, joining Film & Chai with Kabir.</p>}
          <div className="mt-4 h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e6e8ee" />
                <XAxis dataKey="w" tick={{ fontSize: 11, fill: "#646b84" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#646b84" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e8ee", fontSize: 12 }} />
                <Line type="monotone" dataKey="v" name="Members" stroke="#f2643a" strokeWidth={2.5} dot={{ r: 3, fill: "#f2643a" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Active members" value={HUB_STATS.activeMembers} icon={<Users className="size-4" />} />
          <Stat label="Fill rate" value={`${Math.round(HUB_STATS.fillRate * 100)}%`} hint="Places booked / offered" />
          <Stat label="Bookings this week" value={HUB_STATS.bookingsThisWeek + s.bookings.filter((b) => b.status !== "cancelled").length} />
          <Stat label="Commission (12%)" value={inrPlain(HUB_STATS.gmvThisWeek * COMMISSION_RATE)} hint={`On ${inrPlain(HUB_STATS.gmvThisWeek)} GMV`} icon={<IndianRupee className="size-4" />} />
          <Stat label="Awaiting approval" value={review} hint="Experiences" />
          <Stat label="Open reports" value={s.reports.filter((r) => r.status !== "resolved").length} hint={`${refunds} refunds processing`} />
        </div>
      </div>
      <p className="text-[12px] text-muted">Hub metrics are illustrative demo data. The North Star counter responds to the demo journey.</p>
    </div>
  );
}

const REJECT_REASONS = ["Venue capacity doesn't match listing", "Missing cancellation terms", "Private or unsuitable venue", "Organiser not yet verified"];

function Experiences() {
  const s = useDemo();
  const [reject, setReject] = useState<Plan | null>(null);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const queue = s.plans.filter((p) => p.status === "review");
  const live = s.plans.filter((p) => p.status === "live" || p.status === "completed" || p.status === "rejected");
  return (
    <div>
      <Title title="Experience approvals" sub="Every listing is reviewed before members can see it." annotation="Trust operations" />
      {queue.length === 0 && <EmptyState icon={<CheckCircle2 className="size-5" />} title="Queue is clear" body="New listings from businesses and community hosts appear here for review." />}
      <div className="space-y-4">
        {queue.map((p) => {
          const org = s.organisers.find((o) => o.id === p.organiserId);
          const checks = [
            { ok: org?.verification === "verified", label: `Organiser ${org?.verification === "verified" ? "verified" : "verification pending"}` },
            { ok: p.venue.type !== "Private home", label: `Public venue (${p.venue.type})` },
            { ok: p.capacity <= 24, label: `Capacity ${p.capacity} within venue limit` },
            { ok: !!p.cancellation, label: "Price, inclusions and cancellation terms published" },
            { ok: true, label: `Event lead named: ${p.eventLead.name}` },
          ];
          const allOk = checks.every((c) => c.ok);
          return (
            <Card key={p.id} className="overflow-hidden">
              <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                <Cover image={p.image} alt={p.title} className="aspect-[16/10] md:aspect-auto md:h-full" />
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="warn">In review</Badge>
                    {p.createdByDemo && <Badge tone="accent">Just submitted</Badge>}
                  </div>
                  <h3 className="mt-2 font-display text-xl font-semibold">{p.title}</h3>
                  <div className="text-[13px] text-muted">
                    {org?.name} · {fmtDate(p.date)} · {fmtRange(p.start, p.start + p.durationMin)} · {inrPlain(p.price)} · {p.capacity} places
                  </div>
                  <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {checks.map((c) => (
                      <li key={c.label} className="flex items-center gap-2 text-[13px]">
                        {c.ok ? <CheckCircle2 className="size-4 text-ok" /> : <AlertTriangle className="size-4 text-warn" />}
                        {c.label}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="accent"
                      onClick={() => {
                        s.approvePlan(p.id);
                        toast.success(`${p.title} is live for members`);
                      }}
                    >
                      <CheckCircle2 className="size-4" /> Approve & publish
                    </Button>
                    <Button variant="secondary" onClick={() => { setReject(p); setReason(allOk ? REJECT_REASONS[0] : REJECT_REASONS[3]); }}>
                      <XCircle className="size-4" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <h2 className="mb-3 mt-10 font-display text-lg font-semibold">Published experiences</h2>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wide text-muted">
                <th className="px-5 py-2 font-semibold">Experience</th>
                <th className="px-2 py-2 font-semibold">Organiser</th>
                <th className="px-2 py-2 font-semibold">Event lead</th>
                <th className="px-2 py-2 text-right font-semibold">Booked</th>
                <th className="px-5 py-2 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {live.map((p) => {
                const org = s.organisers.find((o) => o.id === p.organiserId);
                return (
                  <tr key={p.id}>
                    <td className="px-5 py-2.5">
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-[12px] text-muted">{fmtDate(p.date)} · {p.venue.name}</div>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="text-[13px]">{org?.name}</div>
                      {org && <Verified status={org.verification} />}
                    </td>
                    <td className="px-2 py-2.5 text-[12.5px] text-muted">
                      <span className="inline-flex items-center gap-1"><Phone className="size-3" />{p.eventLead.name}</span>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{activeParticipants(p).length}/{p.capacity}</td>
                    <td className="px-5 py-2.5 text-right">
                      <Badge tone={p.status === "live" ? "ok" : p.status === "rejected" ? "danger" : "iris"}>{p.status === "live" ? "Live" : p.status === "rejected" ? "Rejected" : "Completed"}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!reject} onClose={() => setReject(null)}>
        <div className="p-6 sm:p-7">
          <h3 className="pr-10 font-display text-xl font-semibold">Reject “{reject?.title}”?</h3>
          <p className="mt-1 text-sm text-muted">The organiser sees this reason and can resubmit.</p>
          <div className="mt-4 space-y-2">
            {REJECT_REASONS.map((r) => (
              <button key={r} onClick={() => setReason(r)} className={cn("block w-full rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold", reason === r ? "border-ink bg-ink text-white" : "border-line")}>
                {r}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setReject(null)}>Keep in review</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (reject) s.rejectPlan(reject.id, reason);
                toast(`Rejected: ${reason}`);
                setReject(null);
              }}
            >
              Reject listing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Businesses() {
  const s = useDemo();
  return (
    <div>
      <Title title="Business verification" sub="We verify identity and organising authority. Verification explains what we checked; it doesn't guarantee behaviour." />
      <div className="grid gap-3 md:grid-cols-2">
        {s.organisers.map((o) => (
          <Card key={o.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar src={imageUrl(o.avatar, 200)} name={o.name} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{o.name}</span>
                  <Badge>{o.type === "business" ? "Business" : "Individual host"}</Badge>
                </div>
                <div className="text-[12.5px] text-muted">{o.owner} · {o.area} · since {o.since}</div>
                <div className="mt-2">
                  <Verified status={o.verification} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {o.docs.map((d) => (
                    <Badge key={d} tone={d.includes("missing") ? "danger" : "neutral"}>{d}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
              {o.verification !== "verified" && (
                <Button size="sm" onClick={() => { s.setVerification(o.id, "verified"); toast.success(`${o.name} verified`); }}>
                  <BadgeCheck className="size-3.5" /> Mark verified
                </Button>
              )}
              {o.verification !== "rejected" && (
                <Button size="sm" variant="secondary" onClick={() => { s.setVerification(o.id, "rejected"); toast(`${o.name} marked not verified`); }}>
                  Reject verification
                </Button>
              )}
              {o.verification !== "pending" && (
                <Button size="sm" variant="ghost" onClick={() => { s.setVerification(o.id, "pending"); toast(`${o.name} moved back to pending`); }}>
                  Request documents
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Members() {
  const s = useDemo();
  const [suspend, setSuspend] = useState<string | null>(null);
  const rows = [{ id: "riya", name: s.profile.name, avatar: s.profile.avatar, area: s.profile.area, occupation: "Rotational shifts", verified: { phone: true, workEmail: true } }, ...PEOPLE];
  return (
    <div>
      <Title title="Members" sub={`${HUB_STATS.activeMembers} active in the hub. Showing members in this demo.`} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wide text-muted">
                <th className="px-5 py-2 font-semibold">Member</th>
                <th className="px-2 py-2 font-semibold">Verification</th>
                <th className="px-2 py-2 font-semibold">Reports</th>
                <th className="px-2 py-2 font-semibold">Status</th>
                <th className="px-5 py-2 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((m) => {
                const status = s.memberStatus[m.id] ?? "active";
                const reports = s.reports.filter((r) => r.targetId === m.id).length;
                return (
                  <tr key={m.id}>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={m.avatar} name={m.name} size={32} />
                        <div>
                          <div className="font-semibold">{m.name}</div>
                          <div className="text-[12px] text-muted">{m.area} · {m.occupation.split(" · ")[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        <Badge tone="iris">Phone</Badge>
                        {m.verified.workEmail ? <Badge tone="iris">Work email</Badge> : <Badge>Email pending</Badge>}
                      </div>
                    </td>
                    <td className="px-2 py-2.5">{reports ? <Badge tone="danger">{reports}</Badge> : <span className="text-muted">0</span>}</td>
                    <td className="px-2 py-2.5"><Badge tone={status === "active" ? "ok" : "danger"}>{status === "active" ? "Active" : "Suspended"}</Badge></td>
                    <td className="px-5 py-2.5 text-right">
                      {status === "active" ? (
                        <Button size="sm" variant="ghost" className="text-danger" onClick={() => setSuspend(m.id)}>
                          <Ban className="size-3.5" /> Suspend
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => { s.setMemberStatus(m.id, "active"); toast(`${m.name} reactivated`); }}>
                          Reactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Confirm
        open={!!suspend}
        onClose={() => setSuspend(null)}
        title="Suspend this member?"
        body="They're removed from upcoming groups and can't book until the review is finished. Upcoming bookings are refunded."
        confirmLabel="Suspend"
        tone="danger"
        onConfirm={() => {
          if (suspend) s.setMemberStatus(suspend, "suspended");
          toast.success("Member suspended pending review");
        }}
      />
    </div>
  );
}

function Reports() {
  const s = useDemo();
  const [resolve, setResolve] = useState<string | null>(null);
  const [outcome, setOutcome] = useState("Warning sent and guidelines shared");
  return (
    <div>
      <Title title="Reports" sub="Severity-ranked. High-severity reports during events go to the event lead immediately." annotation="Trust operations" />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          [ShieldAlert, "Report user / experience", "One tap from any profile, group or listing."],
          [Ban, "Block", "Blocked members are never grouped with you again."],
          [ShieldCheck, "Named event lead", "Every listing has a reachable person on the day."],
        ].map(([Icon, t, b]) => {
          const I = Icon as typeof Ban;
          return (
            <Card key={t as string} className="flex gap-3 p-4">
              <I className="mt-0.5 size-5 shrink-0 text-sunrise" />
              <div>
                <div className="text-sm font-semibold">{t as string}</div>
                <div className="text-[12.5px] text-muted">{b as string}</div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="space-y-3">
        {s.reports.map((r) => (
          <Card key={r.id} className={cn("p-4", r.severity === "high" && r.status !== "resolved" && "border-danger/40")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Flag className={cn("size-4", r.severity === "high" ? "text-danger" : r.severity === "medium" ? "text-warn" : "text-muted")} />
                  <span className="font-semibold">{r.targetLabel}</span>
                  <Badge tone={r.severity === "high" ? "danger" : r.severity === "medium" ? "warn" : "neutral"}>{r.severity} severity</Badge>
                  <Badge tone={r.status === "resolved" ? "ok" : r.status === "reviewing" ? "iris" : "neutral"}>{r.status === "open" ? "Open" : r.status === "reviewing" ? "Under review" : "Resolved"}</Badge>
                </div>
                <p className="mt-1.5 text-[13.5px]">{r.reason}</p>
                <div className="mt-1 text-[12px] text-muted">Reported by {r.reporter} · {r.createdAt} · {r.kind === "user" ? "Member report" : "Experience report"}</div>
                {r.resolution && <div className="mt-1 text-[12.5px] font-semibold text-ok">Outcome: {r.resolution}</div>}
              </div>
              {r.status !== "resolved" && (
                <div className="flex flex-wrap gap-2">
                  {r.status === "open" && (
                    <Button size="sm" variant="secondary" onClick={() => { s.updateReport(r.id, "reviewing"); toast("Marked as under review"); }}>
                      Start review
                    </Button>
                  )}
                  {r.kind === "user" && (
                    <Button size="sm" variant="secondary" className="text-danger" onClick={() => { s.setMemberStatus(r.targetId, "suspended"); s.updateReport(r.id, "resolved", "Member suspended from the hub"); toast.success("Member suspended and report resolved"); }}>
                      <Ban className="size-3.5" /> Suspend member
                    </Button>
                  )}
                  <Button size="sm" onClick={() => setResolve(r.id)}>
                    Resolve
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      <Modal open={!!resolve} onClose={() => setResolve(null)}>
        <div className="p-6 sm:p-7">
          <h3 className="pr-10 font-display text-xl font-semibold">Resolve report</h3>
          <div className="mt-4 space-y-2">
            {["Warning sent and guidelines shared", "Organiser contacted; refund issued", "No violation found", "Member blocked from future groups with reporter"].map((o) => (
              <button key={o} onClick={() => setOutcome(o)} className={cn("block w-full rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold", outcome === o ? "border-ink bg-ink text-white" : "border-line")}>
                {o}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setResolve(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (resolve) s.updateReport(resolve, "resolved", outcome);
                toast.success("Report resolved. Reporter notified.");
                setResolve(null);
              }}
            >
              Resolve
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function BookingsTab() {
  const s = useDemo();
  const rows = [
    ...s.bookings.map((b) => ({ id: b.id, member: s.profile.name, plan: s.plans.find((p) => p.id === b.planId)?.title ?? "", amount: b.amount, status: b.status as string, refund: b.refund, live: true })),
    { id: "x1", member: "Nikhil", plan: "Wednesday Open Mic", amount: 199, status: "cancelled", refund: "refunded", live: false },
    { id: "x2", member: "Zoya", plan: "Old Gurugram Food Trail", amount: 499, status: "cancelled", refund: "processing", live: false },
    { id: "x3", member: "Dev", plan: "Board Games Social", amount: 249, status: "provisional", refund: "none", live: false },
  ];
  return (
    <div>
      <Title title="Bookings & refunds" sub="Cancellation and refund status across the hub. Payments are simulated." />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wide text-muted">
                <th className="px-5 py-2 font-semibold">Member</th>
                <th className="px-2 py-2 font-semibold">Experience</th>
                <th className="px-2 py-2 text-right font-semibold">Amount</th>
                <th className="px-2 py-2 font-semibold">Booking</th>
                <th className="px-2 py-2 font-semibold">Refund</th>
                <th className="px-5 py-2 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-2.5 font-semibold">{r.member}</td>
                  <td className="px-2 py-2.5">{r.plan}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{inrPlain(r.amount)}</td>
                  <td className="px-2 py-2.5"><StatusChip status={r.status} /></td>
                  <td className="px-2 py-2.5">{r.refund === "none" ? <span className="text-muted">–</span> : <Badge tone={r.refund === "refunded" ? "ok" : "warn"}>{r.refund === "refunded" ? "Refunded" : "Processing"}</Badge>}</td>
                  <td className="px-5 py-2.5 text-right">
                    {r.refund === "processing" && r.live && (
                      <Button size="sm" onClick={() => { s.processRefund(r.id); toast.success(`Refund of ${inrPlain(r.amount)} sent (simulated)`); }}>
                        Process refund
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense>
      <Admin />
    </Suspense>
  );
}

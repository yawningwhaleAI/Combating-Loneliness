"use client";

import { CalendarPlus, Heart, ImagePlus, Lock, Plus, Sparkles, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { CIRCLE_ICON } from "@/components/member/circle-icon";
import { StoryCard } from "@/components/member/story-card";
import { Avatar, AvatarStack, Badge, Button, Card, Chip, Cover, EmptyState, Field, inputCls, Modal } from "@/components/ui";
import { COVER_CHOICES, interestLabel } from "@/data/catalog";
import { PEOPLE } from "@/data/seed";
import type { Invitation } from "@/lib/types";
import { cn, DEMO_WEEK, fmtDate, fmtTime } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

const TABS = [
  { id: "stories", label: "Stories" },
  { id: "connections", label: "Connections" },
  { id: "circles", label: "Circles" },
  { id: "meet", label: "Meet again" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function People() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = (params.get("tab") as TabId) ?? "stories";
  const s = useDemo();
  const [composer, setComposer] = useState(false);
  const [circleOpen, setCircleOpen] = useState(false);
  const stories = s.stories.filter((st) => !s.blocked.includes(st.authorId));
  const pendingMeet = s.bookings.filter((b) => b.status === "attended" && !s.meetAgain.some((m) => m.planId === b.planId) && s.plans.find((p) => p.id === b.planId)?.groupSize);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-semibold">My People</h1>
          <p className="mt-1 text-[15px] text-muted">
            {s.connections.length} connections · {s.circles.length} circles. The people you&apos;ve met, and what they&apos;re up to.
          </p>
        </div>
        <Button variant="accent" onClick={() => setComposer(true)}>
          <Plus className="size-4" /> Share an update
        </Button>
      </div>

      <div className="scrollbar-none mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => router.replace(`/app/people?tab=${t.id}`)}
            className={cn("relative whitespace-nowrap px-4 pb-3 pt-1 text-sm font-semibold transition", tab === t.id ? "text-ink" : "text-muted hover:text-ink")}
          >
            {t.label}
            {t.id === "meet" && pendingMeet.length > 0 && <span className="ml-1.5 rounded-full bg-sunrise px-1.5 text-[10px] text-white">{pendingMeet.length}</span>}
            {tab === t.id && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-ink" />}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "stories" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="min-w-0 space-y-4">
              <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
                {s.connections.map((c) => {
                  const p = PEOPLE.find((x) => x.id === c.personId)!;
                  const has = stories.some((st) => st.authorId === p.id);
                  return (
                    <div key={p.id} className="flex w-16 shrink-0 flex-col items-center">
                      <span className={cn("rounded-full p-[2.5px]", has ? "free-band" : "bg-line")}>
                        <span className="block rounded-full bg-surface p-[2px]">
                          <Avatar src={p.avatar} name={p.name} size={50} />
                        </span>
                      </span>
                      <span className="mt-1 truncate text-[12px] font-semibold">{p.name}</span>
                    </div>
                  );
                })}
              </div>
              {stories.map((st) => (
                <StoryCard key={st.id} story={st} />
              ))}
            </div>
            <aside className="space-y-4">
              <Card className="p-5">
                <h3 className="font-display text-base font-semibold">Stories that lead to plans</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  Add an invitation to any update. Friends can tap <span className="font-semibold text-ink">Join me</span>, and we check it against their free time first.
                </p>
              </Card>
              <Card className="p-5 text-[13px] text-muted">
                <div className="flex items-center gap-1.5 font-semibold text-ink">
                  <Lock className="size-3.5" /> Who sees your stories
                </div>
                Connections and members of your circles. No public feed, no follower counts.
              </Card>
            </aside>
          </div>
        )}

        {tab === "connections" && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {s.connections.map((c) => {
              const p = PEOPLE.find((x) => x.id === c.personId)!;
              const isNew = c.viaPlanId.startsWith("p_");
              return (
                <Card key={p.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={p.avatar} name={p.name} size={52} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        {p.name}, {p.age} {isNew && <Badge tone="accent">New</Badge>}
                      </div>
                      <div className="truncate text-[12.5px] text-muted">Met at {c.viaLabel} · {c.since}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.interests.slice(0, 4).map((i) => (
                      <Badge key={i}>{interestLabel(i)}</Badge>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl bg-canvas px-3 py-2 text-[12.5px] text-muted">{p.freeLabel}</div>
                </Card>
              );
            })}
            {s.connections.length === 0 && <EmptyState icon={<Users className="size-5" />} title="No connections yet" body="After an experience, choose who you'd like to meet again. If it's mutual, they appear here." />}
          </div>
        )}

        {tab === "circles" && (
          <div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {s.circles.map((c) => {
                const Icon = CIRCLE_ICON[c.icon];
                const members = c.memberIds.map((id) => PEOPLE.find((p) => p.id === id)!).filter(Boolean);
                const posts = s.stories.filter((st) => st.circleId === c.id).length;
                return (
                  <Card key={c.id} className="p-5">
                    <div className="flex items-start justify-between">
                      <span className="grid size-11 place-items-center rounded-2xl bg-sunrise-soft text-sunrise-deep">
                        <Icon className="size-5" />
                      </span>
                      <AvatarStack people={[{ name: s.profile.name, avatar: s.profile.avatar }, ...members]} max={4} size={26} />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold">{c.name}</h3>
                    <p className="mt-0.5 text-[13px] text-muted">{c.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
                      <Badge>{members.length + 1} members</Badge>
                      <Badge>{posts} updates</Badge>
                      <Badge tone="accent">{c.rhythm}</Badge>
                    </div>
                  </Card>
                );
              })}
              <button onClick={() => setCircleOpen(true)} className="grid min-h-[200px] place-items-center rounded-2xl border-2 border-dashed border-line text-muted transition hover:border-ink/30 hover:text-ink">
                <span className="flex flex-col items-center gap-2 text-sm font-semibold">
                  <Plus className="size-5" /> Start a circle
                </span>
              </button>
            </div>
            <p className="mt-5 text-[13px] text-muted">Circles are persistent groups who choose to stay connected. Plans adapt to whoever is free that week.</p>
          </div>
        )}

        {tab === "meet" && (
          <div className="max-w-2xl space-y-3">
            <Card className="flex gap-3 p-5 text-[13px] text-muted">
              <Heart className="mt-0.5 size-4 shrink-0 text-sunrise" />
              <div>
                <span className="font-semibold text-ink">How Meet again works.</span> After each experience you privately pick who you&apos;d like to see again. If they pick you too, you connect. If not, nobody is ever told.
              </div>
            </Card>
            {pendingMeet.map((b) => {
              const plan = s.plans.find((p) => p.id === b.planId)!;
              return (
                <Card key={b.id} className="flex items-center gap-4 p-4">
                  <Cover image={plan.image} alt={plan.title} className="size-16 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{plan.title}</div>
                    <div className="text-[12.5px] text-muted">{fmtDate(plan.date)} · waiting for your choices</div>
                  </div>
                  <Link href={`/app/bookings/${plan.id}`}>
                    <Button size="sm" variant="accent">Choose</Button>
                  </Link>
                </Card>
              );
            })}
            {s.meetAgain.map((m) => {
              const plan = s.plans.find((p) => p.id === m.planId)!;
              return (
                <Card key={m.planId} className="flex items-center gap-4 p-4">
                  <Cover image={plan.image} alt={plan.title} className="size-16 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{plan.title}</div>
                    <div className="text-[12.5px] text-muted">
                      {m.mutual.length ? `Mutual with ${m.mutual.map((id) => PEOPLE.find((p) => p.id === id)?.name).join(", ")}` : "No mutual choices"} · other choices stay private
                    </div>
                  </div>
                  <Badge tone={m.mutual.length ? "ok" : "neutral"}>{m.mutual.length ? "Connected" : "Saved"}</Badge>
                </Card>
              );
            })}
            {pendingMeet.length === 0 && s.meetAgain.length === 0 && (
              <EmptyState icon={<Sparkles className="size-5" />} title="Nothing to choose yet" body="After you attend a small-group experience, you'll be asked who you'd like to meet again." action={<Link href="/app/bookings" className="text-sm font-semibold underline">See your bookings</Link>} />
            )}
          </div>
        )}
      </div>

      <Composer open={composer} onClose={() => setComposer(false)} />
      <NewCircle open={circleOpen} onClose={() => setCircleOpen(false)} />
    </div>
  );
}

function Composer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const post = useDemo((s) => s.postStory);
  const circles = useDemo((s) => s.circles);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [withInvite, setWithInvite] = useState(false);
  const [inv, setInv] = useState<Invitation>({ title: "", date: DEMO_WEEK[5], start: 11 * 60, durationMin: 90, venue: "", price: 0 });
  const [circleId, setCircleId] = useState<string | undefined>();
  const [error, setError] = useState("");
  const times = Array.from({ length: 30 }, (_, i) => 7 * 60 + i * 30);

  return (
    <Modal open={open} onClose={onClose}>
      <form
        className="p-6 sm:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return setError("Write a short update first.");
          if (withInvite && (!inv.title.trim() || !inv.venue.trim())) return setError("Add a title and a public place for your invitation.");
          post({ text: text.trim(), image, invitation: withInvite ? inv : undefined, circleId });
          toast.success(withInvite ? "Invitation shared with your people" : "Update shared");
          setText("");
          setImage(undefined);
          setWithInvite(false);
          setError("");
          onClose();
        }}
      >
        <h3 className="pr-10 font-display text-xl font-semibold">Share an update</h3>
        <textarea id="story-text" rows={3} className={cn(inputCls, "mt-4")} placeholder="Tuesday is finally my weekend…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="mt-3">
          <div className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold">
            <ImagePlus className="size-4" /> Add a photo
          </div>
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
            {COVER_CHOICES.slice(0, 8).map((k) => (
              <button type="button" key={k} onClick={() => setImage(image === k ? undefined : k)} className={cn("relative shrink-0 overflow-hidden rounded-xl ring-2 ring-offset-2 transition", image === k ? "ring-ink" : "ring-transparent")}>
                <Cover image={k} alt={k} className="size-16" />
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip selected={!circleId} onClick={() => setCircleId(undefined)} className="text-[12px]">All connections</Chip>
          {circles.map((c) => (
            <Chip key={c.id} selected={circleId === c.id} onClick={() => setCircleId(c.id)} className="text-[12px]">
              {c.name}
            </Chip>
          ))}
        </div>
        <button type="button" onClick={() => setWithInvite((w) => !w)} className={cn("mt-4 flex w-full items-center gap-2 rounded-2xl border p-3 text-sm font-semibold transition", withInvite ? "border-sunrise bg-sunrise-soft/50" : "border-line")}>
          <CalendarPlus className="size-4 text-sunrise" /> {withInvite ? "Invitation added" : "Add a “Join me” invitation"}
          {withInvite && <X className="ml-auto size-4" />}
        </button>
        {withInvite && (
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="col-span-2">
              <Field label="What">
                <input id="inv-title" className={inputCls} value={inv.title} onChange={(e) => setInv({ ...inv, title: e.target.value })} placeholder="Badminton doubles" />
              </Field>
            </div>
            <Field label="Day">
              <select id="inv-date" className={inputCls} value={inv.date} onChange={(e) => setInv({ ...inv, date: e.target.value })}>
                {DEMO_WEEK.map((d) => <option key={d} value={d}>{fmtDate(d)}</option>)}
              </select>
            </Field>
            <Field label="Time">
              <select id="inv-time" className={inputCls} value={inv.start} onChange={(e) => setInv({ ...inv, start: Number(e.target.value) })}>
                {times.map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="Public place" hint="Invitations are for public places only.">
                <input id="inv-venue" className={inputCls} value={inv.venue} onChange={(e) => setInv({ ...inv, venue: e.target.value })} placeholder="Rally Courts, Sector 54" />
              </Field>
            </div>
          </div>
        )}
        {error && <p className="mt-3 text-[13px] font-semibold text-danger">{error}</p>}
        <Button type="submit" className="mt-5 w-full" size="lg">
          Share
        </Button>
      </form>
    </Modal>
  );
}

function NewCircle({ open, onClose }: { open: boolean; onClose: () => void }) {
  const connections = useDemo((s) => s.connections);
  const create = useDemo((s) => s.createCircle);
  const [name, setName] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [error, setError] = useState("");
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 sm:p-7">
        <h3 className="pr-10 font-display text-xl font-semibold">Start a circle</h3>
        <p className="mt-1 text-sm text-muted">A persistent group of connections who want to keep meeting.</p>
        <div className="mt-4">
          <Field label="Name">
            <input id="circle-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Wednesday Coffee Crew" />
          </Field>
        </div>
        <div className="mt-4 text-[13px] font-semibold">Invite connections</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {connections.map((c) => {
            const p = PEOPLE.find((x) => x.id === c.personId)!;
            const on = sel.includes(p.id);
            return (
              <Chip key={p.id} selected={on} onClick={() => setSel((x) => (on ? x.filter((y) => y !== p.id) : [...x, p.id]))}>
                {p.name}
              </Chip>
            );
          })}
        </div>
        {error && <p className="mt-3 text-[13px] font-semibold text-danger">{error}</p>}
        <Button
          className="mt-5 w-full"
          size="lg"
          onClick={() => {
            if (!name.trim()) return setError("Give your circle a name.");
            if (!sel.length) return setError("Invite at least one connection.");
            create(name.trim(), sel, "coffee", "A circle you started.");
            toast.success(`${name.trim()} created`);
            setName("");
            setSel([]);
            setError("");
            onClose();
          }}
        >
          Create circle
        </Button>
      </div>
    </Modal>
  );
}

export default function PeoplePage() {
  return (
    <Suspense>
      <People />
    </Suspense>
  );
}

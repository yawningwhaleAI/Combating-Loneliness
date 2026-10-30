"use client";

import { motion } from "framer-motion";
import { CalendarClock, Check, Hand, Heart, MapPin, MessageCircle, Send, Star, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, Badge, Button, Card, Cover, Modal } from "@/components/ui";
import { PEOPLE } from "@/data/seed";
import { evaluatePlan } from "@/lib/matching";
import type { Story } from "@/lib/types";
import { cn, fmtDate, fmtRange, fmtTime, inr } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";
import { useEvalCtx } from "./plan-card";

export function authorOf(id: string, riya: { name: string; avatar: string }) {
  if (id === "riya") return { name: riya.name, avatar: riya.avatar };
  const p = PEOPLE.find((x) => x.id === id);
  return { name: p?.name ?? "Member", avatar: p?.avatar };
}

export function StoryCard({ story, compact }: { story: Story; compact?: boolean }) {
  const profile = useDemo((s) => s.profile);
  const circles = useDemo((s) => s.circles);
  const like = useDemo((s) => s.likeStory);
  const reply = useDemo((s) => s.replyStory);
  const interested = useDemo((s) => s.toggleInterested);
  const [replyOpen, setReplyOpen] = useState(false);
  const [text, setText] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const author = authorOf(story.authorId, profile);
  const circle = circles.find((c) => c.id === story.circleId);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 p-4 pb-3">
        <Avatar src={author.avatar} name={author.name} size={38} />
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold">{author.name}</div>
          <div className="text-[12px] text-muted">
            {story.when}
            {circle && <> · {circle.name}</>}
          </div>
        </div>
        {story.invitation && <Badge tone="accent">Join me</Badge>}
      </div>
      <p className="px-4 text-[14.5px] leading-relaxed">{story.text}</p>
      {story.image && !compact && <Cover image={story.image} alt={story.text.slice(0, 30)} className="mx-4 mt-3 aspect-[16/9] rounded-xl" />}
      {story.invitation && (
        <div className="mx-4 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sunrise/25 bg-sunrise-soft/60 p-3">
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold">{story.invitation.title}</div>
            <div className="mt-0.5 flex flex-wrap gap-x-3 text-[12px] text-muted">
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3" />
                {fmtDate(story.invitation.date)} · {fmtTime(story.invitation.start)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {story.invitation.venue}
              </span>
            </div>
          </div>
          {story.joinedByMe ? (
            <Badge tone="ok">
              <Check className="size-3" strokeWidth={3} /> You&apos;re in
            </Badge>
          ) : (
            <Button size="sm" variant="accent" onClick={() => setJoinOpen(true)}>
              <Hand className="size-3.5" /> Join me
            </Button>
          )}
        </div>
      )}
      <div className="mt-3 flex items-center gap-1 border-t border-line px-2 py-1.5">
        <Action active={story.likedByMe} onClick={() => like(story.id)} icon={<Heart className={cn("size-4", story.likedByMe && "fill-sunrise text-sunrise")} />} label={String(story.likes)} />
        <Action active={replyOpen} onClick={() => setReplyOpen((o) => !o)} icon={<MessageCircle className="size-4" />} label={story.replies.length ? String(story.replies.length) : "Reply"} />
        {story.invitation && (
          <Action
            active={story.interestedByMe}
            onClick={() => {
              interested(story.id);
              if (!story.interestedByMe) toast(`${author.name} can see you're interested`);
            }}
            icon={<Star className={cn("size-4", story.interestedByMe && "fill-dawn text-dawn")} />}
            label={`Interested · ${story.interested}`}
          />
        )}
      </div>
      {(replyOpen || (story.replies.length > 0 && !compact)) && (
        <div className="space-y-2 border-t border-line bg-canvas/60 px-4 py-3">
          {story.replies.map((r, i) => {
            const a = authorOf(r.authorId, profile);
            return (
              <div key={i} className="flex gap-2 text-[13px]">
                <Avatar src={a.avatar} name={a.name} size={22} />
                <div>
                  <span className="font-semibold">{a.name}</span> <span className="text-ink/80">{r.text}</span>
                </div>
              </div>
            );
          })}
          {replyOpen && (
            <form
              className="flex gap-2 pt-1"
              onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim()) return;
                reply(story.id, text.trim());
                setText("");
                toast.success(`Reply sent to ${author.name}`);
              }}
            >
              <input id={`reply-${story.id}`} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Reply to ${author.name}…`} className="h-9 flex-1 rounded-full border border-line bg-surface px-3.5 text-[13px] outline-none focus:border-ink/40" />
              <button type="submit" aria-label="Send reply" className="grid size-9 place-items-center rounded-full bg-ink text-white disabled:opacity-40" disabled={!text.trim()}>
                <Send className="size-3.5" />
              </button>
            </form>
          )}
        </div>
      )}
      {story.invitation && <JoinCheck open={joinOpen} onClose={() => setJoinOpen(false)} story={story} authorName={author.name} />}
    </Card>
  );
}

function Action({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition hover:bg-ink/5", active ? "text-ink" : "text-muted")}>
      {icon}
      {label}
    </button>
  );
}

/** "Join me" runs the same availability check as Free With Me, then offers plans that do fit. */
function JoinCheck({ open, onClose, story, authorName }: { open: boolean; onClose: () => void; story: Story; authorName: string }) {
  const check = useDemo((s) => s.checkInvitation);
  const join = useDemo((s) => s.joinInvitation);
  const plans = useDemo((s) => s.plans);
  const bookings = useDemo((s) => s.bookings);
  const rosterUpdated = useDemo((s) => s.rosterUpdated);
  const ctx = useEvalCtx();
  const [result, setResult] = useState<{ fits: boolean; reason: string } | null>(null);
  const [checking, setChecking] = useState(false);

  // Plans the inviter is going to come first, then plans with other people Riya knows.
  const alternatives = useMemo(
    () =>
      plans
        .filter((p) => p.status === "live" && !bookings.some((b) => b.planId === p.id && b.status !== "cancelled"))
        .map((p) => ({ plan: p, ev: evaluatePlan(p, ctx) }))
        .filter((x) => x.ev.fits)
        .sort(
          (a, b) =>
            Number(b.ev.familiar.includes(story.authorId)) - Number(a.ev.familiar.includes(story.authorId)) ||
            b.ev.familiar.length - a.ev.familiar.length ||
            b.ev.score - a.ev.score,
        )
        .slice(0, 2),
    [plans, bookings, ctx, story.authorId],
  );

  const run = () => {
    setChecking(true);
    setResult(null);
    setTimeout(() => {
      setResult(check(story.id));
      setChecking(false);
    }, 900);
  };

  const inv = story.invitation!;
  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setResult(null);
      }}
    >
      <div className="p-6 sm:p-7">
        <div className="font-mono text-[11px] uppercase tracking-wider text-muted">Invitation from {authorName}</div>
        <h3 className="mt-1 pr-10 font-display text-xl font-semibold">{inv.title}</h3>
        <p className="mt-1 text-sm text-muted">
          {fmtDate(inv.date, true)} · {fmtRange(inv.start, inv.start + inv.durationMin)} · {inv.venue} · {inr(inv.price)}
        </p>

        {!result && !checking && (
          <div className="mt-6">
            <p className="text-sm text-muted">We&apos;ll check this against your shared free time before you commit.</p>
            <Button className="mt-4 w-full" size="lg" onClick={run}>
              Check my availability
            </Button>
          </div>
        )}
        {checking && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-canvas p-4 text-sm font-semibold">
            <span className="size-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink" /> Checking your free windows…
          </div>
        )}
        {result?.fits && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <div className="flex items-center gap-2 rounded-2xl bg-ok-soft p-4 text-sm font-semibold text-ok">
              <Check className="size-4" strokeWidth={3} /> This fits your free time.
            </div>
            <Button
              className="mt-4 w-full"
              size="lg"
              variant="accent"
              onClick={() => {
                join(story.id);
                toast.success(`You're in. ${authorName} has been told.`);
                onClose();
                setResult(null);
              }}
            >
              Join {authorName}
            </Button>
          </motion.div>
        )}
        {result && !result.fits && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <div className="flex items-start gap-2 rounded-2xl bg-warn-soft p-4 text-sm">
              <X className="mt-0.5 size-4 shrink-0 text-warn" strokeWidth={3} />
              <div>
                <div className="font-semibold text-warn">This one doesn&apos;t fit.</div>
                <div className="mt-0.5 text-ink/75">{result.reason}.</div>
                <div className="mt-1 text-[12px] text-muted">{authorName} only sees “Can&apos;t make this one”. Your reason stays private.</div>
              </div>
            </div>
            <div className="mt-5 text-sm font-semibold">Plans that fit your free time{alternatives.some((a) => a.ev.familiar.length) ? ", with people you know" : ""}</div>
            <div className="mt-2 space-y-2">
              {alternatives.map(({ plan, ev }) => {
                const names = ev.familiar.map((id) => PEOPLE.find((p) => p.id === id)?.name).join(", ");
                return (
                  <Link key={plan.id} href={`/app/plans/${plan.id}`} onClick={onClose} className="flex items-center gap-3 rounded-2xl border border-line p-2.5 transition hover:border-ink/30">
                    <Cover image={plan.image} alt={plan.title} className="size-14 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{plan.title}</div>
                      <div className="text-[12px] text-muted">
                        {fmtDate(plan.date)} · {fmtTime(plan.start)} · {inr(plan.price)}
                      </div>
                      {names && <div className="mt-0.5 text-[12px] font-semibold text-iris">{names} going</div>}
                    </div>
                  </Link>
                );
              })}
              {alternatives.length === 0 && (
                <div className="rounded-2xl bg-canvas p-3 text-[13px] text-muted">
                  Nothing fits right now.{" "}
                  {!rosterUpdated && (
                    <Link href="/app/availability" className="font-semibold text-ink underline" onClick={onClose}>
                      Update your availability
                    </Link>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}

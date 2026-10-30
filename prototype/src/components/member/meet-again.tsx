"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Annotation, Avatar, Button, Modal } from "@/components/ui";
import { PEOPLE } from "@/data/seed";
import type { Plan } from "@/lib/types";
import { cn, DAYS_LONG, weekdayIndex } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

/** Private, mutual-only reconnection (Slide 6). One-sided choices are never revealed. */
export function MeetAgainModal({ plan, memberIds, open, onClose }: { plan: Plan; memberIds: string[]; open: boolean; onClose: () => void }) {
  const submit = useDemo((s) => s.submitMeetAgain);
  const createCircle = useDemo((s) => s.createCircle);
  const blocked = useDemo((s) => s.blocked);
  const router = useRouter();
  const [picks, setPicks] = useState<string[]>([]);
  const [phase, setPhase] = useState<"pick" | "checking" | "result">("pick");
  const [mutual, setMutual] = useState<string[]>([]);
  const [circleMade, setCircleMade] = useState(false);
  const others = memberIds.filter((id) => id !== "riya" && !blocked.includes(id)).map((id) => PEOPLE.find((p) => p.id === id)!).filter(Boolean);
  const circleName = `${DAYS_LONG[weekdayIndex(plan.date)]} ${plan.activity === "coffee" ? "Coffee" : plan.title.split(" ")[0]} Crew`;

  const go = () => {
    setPhase("checking");
    setTimeout(() => {
      setMutual(submit(plan.id, picks));
      setPhase("result");
    }, 1400);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 sm:p-7">
        <AnimatePresence mode="wait">
          {phase === "pick" && (
            <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted">After {plan.title}</span>
                <Annotation label="Mutual connection" />
              </div>
              <h3 className="mt-1 pr-10 font-display text-2xl font-semibold">Would you like to meet them again?</h3>
              <p className="mt-1.5 flex items-start gap-1.5 text-[13px] text-muted">
                <Lock className="mt-0.5 size-3.5 shrink-0" /> Your choices are private. You&apos;ll only connect with someone if they choose you too. Nobody is told about a one-sided choice.
              </p>
              <div className="mt-5 space-y-2">
                {others.map((p) => {
                  const on = picks.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPicks((x) => (on ? x.filter((y) => y !== p.id) : [...x, p.id]))}
                      className={cn("flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition", on ? "border-sunrise bg-sunrise-soft/50" : "border-line hover:border-ink/25")}
                    >
                      <Avatar src={p.avatar} name={p.name} size={42} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{p.name}</div>
                        <div className="truncate text-[12px] text-muted">{p.intro}</div>
                      </div>
                      <span className={cn("grid size-9 place-items-center rounded-full transition", on ? "bg-sunrise text-white" : "bg-canvas text-subtle")}>
                        <Heart className={cn("size-4", on && "fill-white")} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-between gap-2">
                <Button variant="ghost" onClick={go}>
                  Skip for now
                </Button>
                <Button variant="accent" onClick={go} disabled={!picks.length}>
                  Save my choices
                </Button>
              </div>
            </motion.div>
          )}
          {phase === "checking" && (
            <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center">
              <div className="mx-auto size-10 animate-spin rounded-full border-[3px] border-sunrise/20 border-t-sunrise" />
              <div className="mt-4 font-semibold">Checking for mutual choices…</div>
              <div className="mt-1 text-[13px] text-muted">Everyone at your table answers privately.</div>
            </motion.div>
          )}
          {phase === "result" && (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              {mutual.length ? (
                <>
                  <div className="mx-auto flex w-fit items-center">
                    <Avatar src={useDemo.getState().profile.avatar} name="You" size={64} ring />
                    {mutual.map((id) => (
                      <motion.span key={id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="-ml-3">
                        <Avatar src={PEOPLE.find((p) => p.id === id)?.avatar} name={PEOPLE.find((p) => p.id === id)?.name ?? id} size={64} ring />
                      </motion.span>
                    ))}
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold">It&apos;s mutual!</h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
                    You and {mutual.map((id) => PEOPLE.find((p) => p.id === id)?.name).join(" and ")} both want to meet again. You&apos;re now connected and will see each other&apos;s stories and invitations.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-2 font-display text-2xl font-semibold">Choices saved</h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-muted">No mutual matches yet. If someone chooses you later, we&apos;ll let you know.</p>
                </>
              )}
              {picks.length > mutual.length && (
                <p className="mx-auto mt-3 max-w-sm rounded-xl bg-canvas p-3 text-[12.5px] text-muted">
                  <Lock className="mr-1 inline size-3" /> Other choices stay private. We never reveal a one-sided choice, to them or to you.
                </p>
              )}
              <div className="mt-6 flex flex-col gap-2">
                {mutual.length > 0 && !circleMade && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      createCircle(circleName, mutual, "coffee", `Started after ${plan.title}. Meets when enough of you are free.`);
                      setCircleMade(true);
                      toast.success(`${circleName} created`);
                    }}
                  >
                    <Sparkles className="size-4" /> Keep this table going: start “{circleName}”
                  </Button>
                )}
                <Button
                  variant="accent"
                  onClick={() => {
                    onClose();
                    router.push("/app/people");
                  }}
                >
                  Go to My People
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

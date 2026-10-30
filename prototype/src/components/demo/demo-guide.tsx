"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Presentation, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Confirm, Toggle } from "@/components/ui";
import { useDemo, useHydrated } from "@/store/demo-store";
import { cn } from "@/lib/utils";
import { STEPS } from "./steps";

export function DemoGuide() {
  const hydrated = useHydrated();
  const state = useDemo();
  const router = useRouter();
  const pathname = usePathname();
  const [confirmReset, setConfirmReset] = useState(false);
  if (!hydrated) return null;

  const doneIds = new Set(STEPS.filter((s) => s.done(state)).map((s) => s.id));
  const current = STEPS.find((s) => !doneIds.has(s.id));
  const progress = Math.round((doneIds.size / STEPS.length) * 100);
  const acts = [...new Set(STEPS.map((s) => s.act))];

  const go = (href: string, role: typeof state.role) => {
    state.setRole(role);
    if (role === "member" && href !== "/" && href !== "/onboarding" && !state.onboarded) state.enterAsRiya();
    router.push(href);
  };

  const onLanding = pathname === "/" || pathname === "/demo";

  return (
    <>
      {!state.guideOpen && (
        <button
          onClick={() => state.setGuideOpen(true)}
          className={cn(
            "fixed right-4 z-40 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-white shadow-[var(--shadow-lift)] transition hover:bg-ink-2",
            onLanding ? "bottom-5" : "bottom-24 lg:bottom-5",
          )}
          style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <Presentation className="size-4" />
          Demo guide
          <span className="rounded-full bg-white/15 px-1.5 font-mono text-[10.5px]">{progress}%</span>
        </button>
      )}
      <AnimatePresence>
        {state.guideOpen && (
          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[45] flex w-full max-w-[380px] flex-col border-l border-white/10 bg-ink text-white shadow-2xl"
            aria-label="Presentation guide"
          >
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/50">Presentation mode</div>
                <div className="font-display text-lg font-semibold">Demo guide</div>
              </div>
              <button onClick={() => state.setGuideOpen(false)} aria-label="Close guide" className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <X className="size-4" />
              </button>
            </div>
            <div className="px-5">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="free-band h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[11.5px] text-white/60">
                <span>
                  {doneIds.size} of {STEPS.length} steps
                </span>
                <span>About 6 minutes end to end</span>
              </div>
            </div>

            {current ? (
              <div className="mx-5 mt-4 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                <div className="font-mono text-[10.5px] uppercase tracking-wider text-dawn">Next · {current.act}</div>
                <div className="mt-1 font-display text-[17px] font-semibold">{current.title}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">{current.say}</p>
                <Button variant="accent" size="sm" className="mt-3" onClick={() => go(current.href, current.role)}>
                  Go there <ArrowRight className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="mx-5 mt-4 rounded-2xl bg-ok/20 p-4 text-sm ring-1 ring-ok/40">
                All steps shown. Reset the demo to run it again.
              </div>
            )}

            <div className="mt-4 flex-1 space-y-4 overflow-y-auto px-5 pb-4">
              {acts.map((act) => (
                <div key={act}>
                  <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/45">{act}</div>
                  <ol className="space-y-1">
                    {STEPS.filter((s) => s.act === act).map((s) => {
                      const done = doneIds.has(s.id);
                      const isCurrent = current?.id === s.id;
                      return (
                        <li key={s.id}>
                          <button
                            onClick={() => go(s.href, s.role)}
                            className={cn(
                              "flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition hover:bg-white/[0.07]",
                              isCurrent && "bg-white/[0.07]",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                                done ? "border-ok bg-ok text-white" : isCurrent ? "border-dawn" : "border-white/25",
                              )}
                            >
                              {done && <Check className="size-2.5" strokeWidth={4} />}
                            </span>
                            <span className="min-w-0">
                              <span className={cn("font-semibold", done && "text-white/60")}>{s.title}</span>
                              {s.annotation && <span className="ml-1.5 font-mono text-[10px] uppercase tracking-wide text-iris-soft/70">{s.annotation}</span>}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-white/10 px-5 py-4" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))" }}>
              <div className="[&_span[role=switch]]:bg-white/20 [&_span[aria-checked=true]]:bg-sunrise">
                <Toggle checked={state.annotations} onChange={state.setAnnotations} label="Show feature annotations in the product" />
              </div>
              <div className="flex gap-2">
                <Link href="/demo" className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold hover:bg-white/20">
                  Presentation home
                </Link>
                <button onClick={() => setConfirmReset(true)} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/10 text-[13px] font-semibold hover:bg-white/20">
                  <RotateCcw className="size-3.5" /> Reset demo
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <Confirm
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset the demo?"
        body="All bookings, connections, listings and approvals go back to the starting data. Use this before each presentation."
        confirmLabel="Reset demo"
        tone="danger"
        onConfirm={() => {
          state.reset();
          state.setGuideOpen(true);
          router.push("/");
          toast.success("Demo reset to starting data");
        }}
      />
    </>
  );
}

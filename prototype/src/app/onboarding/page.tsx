"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Briefcase, Check, Clapperboard, Coffee, Dice5, Footprints, Leaf, Palette, Sofa, Trophy, Utensils, Zap, PartyPopper } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { AvailabilityEditor } from "@/components/member/availability-editor";
import { Logo } from "@/components/shared/logo";
import { Avatar, Button, Chip, Field, inputCls } from "@/components/ui";
import { ACTIVITIES, AREAS, ENVIRONMENTS, INTERESTS } from "@/data/catalog";
import { PLANS, RIYA_AVAILABILITY, RIYA_DEFAULT } from "@/data/seed";
import { evaluatePlan } from "@/lib/matching";
import type { ActivityId, Availability, Budget, Environment, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { START_NOW, useDemo } from "@/store/demo-store";

const ACT_ICON: Record<ActivityId, typeof Coffee> = { coffee: Coffee, workshops: Palette, sports: Trophy, games: Dice5, food: Utensils, film: Clapperboard, walks: Footprints, networking: Briefcase };
const ENV_ICON: Record<Environment, typeof Coffee> = { cosy: Sofa, lively: PartyPopper, outdoors: Leaf, active: Zap };
const STEPS = ["About you", "Interests", "Activities", "Preferences", "Free time", "Ready"];

function Onboarding() {
  const router = useRouter();
  const params = useSearchParams();
  const fresh = params.get("new") === "1";
  const complete = useDemo((s) => s.completeOnboarding);
  const connections = useDemo((s) => s.connections);
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(() => (fresh ? { ...RIYA_DEFAULT, name: "", interests: [], activities: [], environments: [] } : { ...RIYA_DEFAULT }));
  const [availability, setAvailability] = useState<Availability>(() => (fresh ? { windows: [], blocked: [] } : JSON.parse(JSON.stringify(RIYA_AVAILABILITY))));
  const [error, setError] = useState("");

  const set = (p: Partial<Profile>) => setProfile((x) => ({ ...x, ...p }));
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const fitting = useMemo(
    () => PLANS.filter((p) => p.status === "live").filter((p) => evaluatePlan(p, { profile, availability, connections, now: START_NOW }).fits),
    [profile, availability, connections],
  );

  const validate = () => {
    if (step === 0) {
      if (!profile.name.trim()) return "Add your first name so your group knows what to call you.";
      if (profile.age < 18 || profile.age > 80) return "After Hours is for members aged 18 and over.";
    }
    if (step === 1 && profile.interests.length < 3) return "Pick at least three interests. They're used to match your small group.";
    if (step === 2 && profile.activities.length < 1) return "Pick at least one kind of activity.";
    if (step === 3 && profile.environments.length < 1) return "Choose at least one kind of place you're comfortable in.";
    if (step === 4 && availability.windows.length < 1) return "Add at least one free window so we can find plans that fit.";
    return "";
  };

  const next = () => {
    const e = validate();
    setError(e);
    if (e) return;
    if (step === STEPS.length - 1) {
      complete(profile, availability);
      router.push("/app");
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <Logo />
          <span className="font-mono text-[12px] text-muted">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <div className="h-1 bg-line">
          <div className="free-band h-full transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1100px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[200px_1fr]">
        <ol className="hidden space-y-1 lg:block">
          {STEPS.map((s, i) => (
            <li key={s} className={cn("flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold", i === step ? "bg-surface text-ink shadow-sm" : i < step ? "text-ink/70" : "text-subtle")}>
              <span className={cn("grid size-5 place-items-center rounded-full text-[10px]", i < step ? "bg-ok text-white" : i === step ? "bg-ink text-white" : "bg-line text-muted")}>
                {i < step ? <Check className="size-3" strokeWidth={3} /> : i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              {step === 0 && (
                <Section title={fresh ? "Let's set up your profile" : "Hi Riya, let's set up your profile"} sub="Only your first name and interests are shown to your group.">
                  <div className="grid max-w-xl gap-4 sm:grid-cols-[auto_1fr]">
                    <Avatar src={profile.avatar} name={profile.name || "?"} size={72} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="First name">
                        <input id="ob-name" className={inputCls} value={profile.name} onChange={(e) => set({ name: e.target.value })} placeholder="Your first name" />
                      </Field>
                      <Field label="Age">
                        <input id="ob-age" type="number" className={inputCls} value={profile.age} min={18} onChange={(e) => set({ age: Number(e.target.value) })} />
                      </Field>
                      <Field label="Where in Gurugram?" hint="We start with one hub: Gurugram Central.">
                        <select id="ob-area" className={inputCls} value={profile.area} onChange={(e) => set({ area: e.target.value })}>
                          {AREAS.map((a) => (
                            <option key={a}>{a}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                </Section>
              )}
              {step === 1 && (
                <Section title="What are you into?" sub="Pick three or more. We use these to explain why you're matched with people.">
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((i) => (
                      <Chip key={i.id} selected={profile.interests.includes(i.id)} onClick={() => set({ interests: toggle(profile.interests, i.id) })} className="px-4 py-2 text-sm">
                        {profile.interests.includes(i.id) && <Check className="size-3.5" strokeWidth={3} />}
                        {i.label}
                      </Chip>
                    ))}
                  </div>
                </Section>
              )}
              {step === 2 && (
                <Section title="What would you like to do?" sub="These shape which plans we recommend first.">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {ACTIVITIES.map((a) => {
                      const Icon = ACT_ICON[a.id];
                      const on = profile.activities.includes(a.id);
                      return (
                        <SelectCard key={a.id} on={on} onClick={() => set({ activities: toggle(profile.activities, a.id) })}>
                          <Icon className={cn("size-5", on ? "text-sunrise" : "text-muted")} />
                          <div className="mt-3 font-semibold">{a.label}</div>
                          <div className="mt-0.5 text-[12.5px] text-muted">{a.hint}</div>
                        </SelectCard>
                      );
                    })}
                  </div>
                </Section>
              )}
              {step === 3 && (
                <Section title="Your preferences" sub="You can change these any time from your profile.">
                  <div className="space-y-7">
                    <div>
                      <div className="mb-2 text-sm font-semibold">Budget per plan</div>
                      <div className="inline-flex flex-wrap gap-2">
                        {([300, 600, 1000, 5000] as Budget[]).map((b) => (
                          <Chip key={b} selected={profile.budget === b} onClick={() => set({ budget: b })} className="px-4 py-2 text-sm">
                            {b === 5000 ? "Any budget" : `Up to ₹${b.toLocaleString("en-IN")}`}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-sm font-semibold">Preferred group size</div>
                      <div className="grid max-w-xl gap-3 sm:grid-cols-3">
                        {([4, 6, 8] as const).map((g) => (
                          <SelectCard key={g} on={profile.groupSize === g} onClick={() => set({ groupSize: g })}>
                            <div className="font-display text-2xl font-semibold">{g}</div>
                            <div className="text-[12.5px] text-muted">{g === 4 ? "Intimate" : g === 6 ? "Small group" : "Bigger table"}</div>
                          </SelectCard>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-sm font-semibold">Places you&apos;re comfortable in</div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {ENVIRONMENTS.map((e) => {
                          const Icon = ENV_ICON[e.id];
                          const on = profile.environments.includes(e.id);
                          return (
                            <SelectCard key={e.id} on={on} onClick={() => set({ environments: toggle(profile.environments, e.id) })}>
                              <Icon className={cn("size-5", on ? "text-sunrise" : "text-muted")} />
                              <div className="mt-3 font-semibold">{e.label}</div>
                              <div className="mt-0.5 text-[12.5px] text-muted">{e.hint}</div>
                            </SelectCard>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Section>
              )}
              {step === 4 && (
                <Section title="When are you usually free?" sub="Share free windows, not your work roster. We only recommend plans that fit inside them.">
                  <AvailabilityEditor value={availability} onChange={setAvailability} />
                </Section>
              )}
              {step === 5 && (
                <Section title={`You're all set, ${profile.name || "friend"}.`} sub="Here's what your free time already unlocks this week.">
                  <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
                    <Summary n={fitting.length} label="plans fit your free windows" />
                    <Summary n={availability.windows.length} label="free windows shared" />
                    <Summary n={profile.interests.length} label="interests to match on" />
                  </div>
                  <div className="mt-6 max-w-3xl rounded-2xl border border-line bg-surface p-5">
                    <div className="text-sm font-semibold">Top matches</div>
                    <ul className="mt-3 divide-y divide-line">
                      {fitting.slice(0, 4).map((p) => (
                        <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                          <span className="font-semibold">{p.title}</span>
                          <span className="text-muted">{p.price ? `₹${p.price}` : "Free"}</span>
                        </li>
                      ))}
                      {fitting.length === 0 && <li className="py-2.5 text-sm text-muted">No plans fit yet. Try adding a weekday afternoon window.</li>}
                    </ul>
                  </div>
                </Section>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p className="mt-5 text-sm font-semibold text-danger">{error}</p>}
          <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
            <Button variant="ghost" onClick={() => (step === 0 ? router.push("/") : setStep((s) => s - 1))}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button size="lg" variant={step === STEPS.length - 1 ? "accent" : "primary"} onClick={next}>
              {step === STEPS.length - 1 ? "Go to my dashboard" : "Continue"} <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-[28px] font-semibold leading-tight sm:text-[34px]">{title}</h1>
      <p className="mb-7 mt-1.5 text-[15px] text-muted">{sub}</p>
      {children}
    </div>
  );
}

function SelectCard({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border bg-surface p-4 text-left transition-all hover:-translate-y-0.5",
        on ? "border-ink shadow-[0_0_0_1px_var(--color-ink)]" : "border-line hover:border-ink/25",
      )}
    >
      {on && (
        <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-ink text-white">
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
      {children}
    </button>
  );
}

function Summary({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="font-display text-4xl font-semibold text-sunrise">{n}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <Onboarding />
    </Suspense>
  );
}

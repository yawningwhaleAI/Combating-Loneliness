"use client";

import { motion } from "framer-motion";
import { Banknote, Check, CreditCard, Hourglass, PartyPopper, Smartphone, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Annotation, Badge, Button, Cover, Field, inputCls, Modal, StatusChip } from "@/components/ui";
import { PEOPLE } from "@/data/seed";
import type { PaymentMethod, Plan } from "@/lib/types";
import { cn, fmtDate, fmtDuration, fmtRange, inr } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

const STEP_LABELS = ["Review", "Your details", "Payment", "Confirm"];

export function modeCopy(plan: Plan) {
  if (plan.mode === "application")
    return { cta: "Apply to join", outcome: "pending", explain: "The host reviews applications to balance the group. Your place is not secured until they approve it. You won't be charged until then." };
  if (plan.mode === "provisional")
    return {
      cta: "Join experience",
      outcome: "provisional",
      explain: `This runs once ${plan.minParticipants} people join. Your place is held provisionally and confirmed automatically when the minimum is reached; if it isn't, you're refunded in full.`,
    };
  return { cta: "Join experience", outcome: "confirmed", explain: "Instant confirmation. Your place is secured as soon as you book." };
}

export function BookingFlow({ plan, open, onClose }: { plan: Plan; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const profile = useDemo((s) => s.profile);
  const book = useDemo((s) => s.book);
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("98110 4•••• ");
  const [share, setShare] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [agree, setAgree] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof book> | null>(null);
  const [error, setError] = useState("");
  const free = plan.price === 0;
  const copy = modeCopy(plan);
  const labels = free ? STEP_LABELS.filter((l) => l !== "Payment") : STEP_LABELS;
  const current = labels[step];

  const close = () => {
    onClose();
    setTimeout(() => {
      setStep(0);
      setResult(null);
      setAgree(false);
      setError("");
    }, 250);
  };

  const next = () => {
    if (current === "Your details" && !share) return setError("Sharing your first name and interests with your group is required for small-group experiences.");
    if (current === "Confirm") {
      if (!agree) return setError("Please accept the cancellation policy to continue.");
      setError("");
      setProcessing(true);
      setTimeout(() => {
        const r = book(plan.id, free ? "free" : method);
        setResult(r);
        setProcessing(false);
        if (r.northStar) toast.success("You're joining someone you met before. That's our North Star.");
      }, 1200);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  return (
    <Modal open={open} onClose={close}>
      {!result ? (
        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-1.5 pr-10">
            {labels.map((l, i) => (
              <div key={l} className="flex-1">
                <div className={cn("h-1 rounded-full", i <= step ? "bg-ink" : "bg-line")} />
                <div className={cn("mt-1.5 text-[11px] font-semibold", i === step ? "text-ink" : "text-subtle")}>{l}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 min-h-[260px]">
            {current === "Review" && (
              <div>
                <div className="flex gap-3">
                  <Cover image={plan.image} alt={plan.title} className="size-20 shrink-0 rounded-2xl" />
                  <div>
                    <h3 className="font-display text-lg font-semibold leading-snug">{plan.title}</h3>
                    <div className="mt-1 text-[13px] text-muted">
                      {fmtDate(plan.date, true)} · {fmtRange(plan.start, plan.start + plan.durationMin)}
                    </div>
                    <div className="text-[13px] text-muted">
                      {plan.venue.name}, {plan.venue.area}
                    </div>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-canvas p-4 text-[13px] leading-relaxed">
                  <div className="mb-1.5">
                    <StatusChip status={copy.outcome} />
                  </div>
                  {copy.explain}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                  <Info k="Duration" v={fmtDuration(plan.durationMin)} />
                  <Info k="Group format" v={plan.groupSize ? `Small group of ${plan.groupSize}` : "Open group"} />
                  <Info k="Price" v={inr(plan.price)} />
                  <Info k="Eligibility" v={plan.eligibility} />
                </dl>
              </div>
            )}
            {current === "Your details" && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold">Confirm your details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name">
                    <input id="bk-name" className={inputCls} value={profile.name} readOnly />
                  </Field>
                  <Field label="Verified phone" hint="Only the event lead can see it.">
                    <input id="bk-phone" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </Field>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-3.5 text-[13px]">
                  <input id="bk-share" type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} className="mt-0.5 size-4 accent-[#141a33]" />
                  <span>
                    <span className="font-semibold">Share my first name, photo and interests with my small group</span>
                    <span className="block text-muted">Never your surname, phone, workplace or availability.</span>
                  </span>
                </label>
              </div>
            )}
            {current === "Payment" && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">Payment</h3>
                  <Badge tone="warn">Simulated, no real payment</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  {([
                    ["upi", "UPI", "Pay with any UPI app", Smartphone],
                    ["card", "Card", "Debit or credit card", CreditCard],
                    ["venue", "Pay at venue", "Held with a card, paid on arrival", Banknote],
                  ] as const).map(([id, t, sub, Icon]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMethod(id)}
                      className={cn("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition", method === id ? "border-ink shadow-[0_0_0_1px_var(--color-ink)]" : "border-line hover:border-ink/30")}
                    >
                      <span className="grid size-10 place-items-center rounded-xl bg-canvas">
                        <Icon className="size-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{t}</span>
                        <span className="block text-[12px] text-muted">{sub}</span>
                      </span>
                      <span className={cn("size-4 rounded-full border-2", method === id ? "border-[5px] border-ink" : "border-line")} />
                    </button>
                  ))}
                </div>
                <PriceBreakdown plan={plan} className="mt-4" />
              </div>
            )}
            {current === "Confirm" && (
              <div>
                <h3 className="font-display text-lg font-semibold">Confirm your {plan.mode === "application" ? "application" : "booking"}</h3>
                <PriceBreakdown plan={plan} className="mt-4" />
                <div className="mt-4 rounded-2xl bg-canvas p-4 text-[13px] leading-relaxed text-muted">
                  <span className="font-semibold text-ink">Cancellation: </span>
                  {plan.cancellation}
                </div>
                <label className="mt-4 flex cursor-pointer items-center gap-3 text-[13px] font-semibold">
                  <input id="bk-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="size-4 accent-[#141a33]" />I accept the cancellation policy and community guidelines
                </label>
              </div>
            )}
          </div>

          {error && <p className="mt-3 text-[13px] font-semibold text-danger">{error}</p>}
          <div className="mt-6 flex justify-between gap-2">
            <Button variant="ghost" onClick={() => (step === 0 ? close() : setStep((s) => s - 1))}>
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            <Button variant={current === "Confirm" ? "accent" : "primary"} loading={processing} onClick={next}>
              {current === "Confirm" ? (plan.mode === "application" ? "Send application" : free ? "Confirm booking" : `Pay ${inr(plan.price)} & confirm`) : "Continue"}
            </Button>
          </div>
        </div>
      ) : (
        <Success plan={plan} result={result} onGroup={() => { close(); router.push(`/app/bookings/${plan.id}`); }} onClose={close} />
      )}
    </Modal>
  );
}

function Success({ plan, result, onGroup, onClose }: { plan: Plan; result: { booking: { status: string }; groupId?: string; northStar: boolean }; onGroup: () => void; onClose: () => void }) {
  const status = result.booking.status;
  const group = plan.groups.find((g) => g.id === result.groupId);
  const connections = useDemo((s) => s.connections);
  const livePlan = useDemo((s) => s.plans.find((p) => p.id === plan.id));
  const liveGroup = livePlan?.groups.find((g) => g.id === result.groupId) ?? group;
  const familiar = (liveGroup?.memberIds ?? []).filter((id) => connections.some((c) => c.personId === id)).map((id) => PEOPLE.find((p) => p.id === id)?.name);
  const Icon = status === "confirmed" ? PartyPopper : Hourglass;
  return (
    <div className="p-6 text-center sm:p-8">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 14 }} className={cn("mx-auto grid size-16 place-items-center rounded-full", status === "confirmed" ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn")}>
        <Icon className="size-7" />
      </motion.div>
      <h3 className="mt-4 font-display text-2xl font-semibold">
        {status === "confirmed" ? "You're in!" : status === "provisional" ? "Place held provisionally" : "Application sent"}
      </h3>
      <div className="mt-2 flex justify-center">
        <StatusChip status={status} />
      </div>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
        {status === "confirmed" && `${plan.title} on ${fmtDate(plan.date, true)}. Your place is secured.`}
        {status === "provisional" && `We'll confirm automatically once ${plan.minParticipants} people have joined. You'll get a notification either way.`}
        {status === "pending" && "The host will review your application. Your place isn't secured yet, and you haven't been charged."}
      </p>
      {liveGroup && status !== "pending" && (
        <div className="mx-auto mt-5 max-w-sm rounded-2xl bg-canvas p-4 text-left text-[13px]">
          <div className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="size-4 text-sunrise" /> You&apos;ve been placed in {liveGroup.label}
          </div>
          <div className="mt-0.5 text-muted">{liveGroup.memberIds.length} members, matched on shared interests.</div>
          {familiar.length > 0 && <div className="mt-2 font-semibold text-iris">Including {familiar.join(", ")}, who you&apos;ve met before.</div>}
        </div>
      )}
      {result.northStar && (
        <div className="mt-3 flex justify-center">
          <Annotation label="North Star +1" />
        </div>
      )}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        {status !== "pending" && plan.groupSize ? (
          <Button size="lg" variant="accent" onClick={onGroup}>
            <Check className="size-4" /> Meet your group
          </Button>
        ) : (
          <Button size="lg" onClick={onGroup}>
            View booking
          </Button>
        )}
        <Button size="lg" variant="secondary" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <dt className="text-[11.5px] font-semibold text-muted">{k}</dt>
      <dd className="mt-0.5 font-semibold">{v}</dd>
    </div>
  );
}

export function PriceBreakdown({ plan, className }: { plan: Plan; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-line p-4 text-[13px]", className)}>
      <Row k={`Experience (${plan.inclusions[0]?.toLowerCase() ?? "entry"} included)`} v={inr(plan.price)} />
      <Row k="After Hours platform fee" v="₹0" muted />
      <Row k="Taxes" v="Included" muted />
      <div className="mt-2 flex justify-between border-t border-line pt-2 text-sm font-bold">
        <span>Total</span>
        <span>{inr(plan.price)}</span>
      </div>
      <p className="mt-2 text-[11.5px] text-muted">Members never pay a platform fee. The organiser pays After Hours a booking commission.</p>
    </div>
  );
}

function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className={cn("flex justify-between py-0.5", muted && "text-muted")}>
      <span>{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

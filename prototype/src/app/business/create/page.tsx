"use client";

import { CheckCircle2, ImagePlus, Plus, Sparkles, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { BUSINESS_ID } from "@/components/business/business-shell";
import { Badge, Button, Card, Chip, Cover, Field, inputCls } from "@/components/ui";
import { COVER_CHOICES } from "@/data/catalog";
import { COMMISSION_RATE } from "@/lib/economics";
import type { BookingMode, Plan } from "@/lib/types";
import { cn, DEMO_WEEK, fmtDate, fmtTime, inrPlain, uid } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

const VENUES = [
  { name: "Kettle & Kin Café · main floor", capacity: 24 },
  { name: "Kettle & Kin Café · garden tables", capacity: 12 },
];
const CANCEL = [
  "Free cancellation up to 6 hours before start. Later cancellations are non-refundable.",
  "Free cancellation up to 24 hours before start. 50% refund after that.",
  "Non-refundable, but you can transfer your place to a friend.",
];
const INCLUSION_IDEAS = ["One handcrafted coffee or tea", "Butter croissant", "Hosted introductions", "Conversation cards", "Board games", "Snack platter"];

interface Form {
  title: string;
  description: string;
  image: string;
  venue: string;
  date: string;
  start: number;
  durationMin: number;
  capacity: number;
  groupSize: number;
  price: number;
  mode: BookingMode;
  inclusions: string[];
  cancellation: string;
}

const EMPTY: Form = { title: "", description: "", image: "", venue: VENUES[0].name, date: DEMO_WEEK[4], start: 15 * 60, durationMin: 90, capacity: 18, groupSize: 6, price: 299, mode: "instant", inclusions: [], cancellation: CANCEL[0] };

const TEMPLATE: Form = {
  title: "Coffee & Conversations: Friday edition",
  description: "Our Wednesday favourite, now on Friday afternoons when the café is quiet. Tables of six, matched on shared interests, with a host to get conversations going.",
  image: "table",
  venue: VENUES[0].name,
  date: DEMO_WEEK[4],
  start: 15 * 60,
  durationMin: 90,
  capacity: 18,
  groupSize: 6,
  price: 299,
  mode: "instant",
  inclusions: ["One handcrafted coffee or tea", "Butter croissant", "Hosted introductions"],
  cancellation: CANCEL[0],
};

export default function CreateExperience() {
  const createPlan = useDemo((s) => s.createPlan);
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [custom, setCustom] = useState("");
  const [done, setDone] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (p: Partial<Form>) => setF((x) => ({ ...x, ...p }));
  const times = Array.from({ length: 28 }, (_, i) => 8 * 60 + i * 30);
  const venueCap = VENUES.find((v) => v.name === f.venue)?.capacity ?? 24;

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (f.title.trim().length < 5) e.title = "Give your experience a clear name (at least 5 characters).";
    if (f.description.trim().length < 30) e.description = "Describe what happens in a sentence or two (30+ characters).";
    if (!f.image) e.image = "Choose or upload a cover image.";
    if (f.capacity < 4) e.capacity = "Capacity must be at least 4.";
    if (f.capacity > venueCap) e.capacity = `This venue holds up to ${venueCap} people.`;
    if (f.price < 0) e.price = "Price can't be negative.";
    if (!f.inclusions.length) e.inclusions = "List at least one thing that's included.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      toast.error("A few fields need attention");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const plan: Plan = {
        id: uid("p"),
        title: f.title.trim(),
        tagline: f.description.trim().split(".")[0],
        description: f.description.trim(),
        category: "Social",
        activity: "coffee",
        interests: ["cafes", "music", "exploring", "networking"],
        image: f.image,
        organiserId: BUSINESS_ID,
        venue: { name: "Kettle & Kin Café", area: "DLF Phase 4", address: "Shop 14, Galleria Market, DLF Phase 4", distanceKm: 1.2, type: "Public café" },
        date: f.date,
        start: f.start,
        durationMin: f.durationMin,
        price: f.price,
        capacity: f.capacity,
        groupSize: f.groupSize || null,
        mode: f.mode,
        minParticipants: f.mode === "provisional" ? Math.ceil(f.capacity / 2) : undefined,
        inclusions: f.inclusions,
        rules: ["Arrive within 10 minutes of start", "Be kind; no sales pitches", "Ask before taking photos of others"],
        cancellation: f.cancellation,
        eligibility: "18+ · verified phone",
        eventLead: { name: "Meher (Kettle & Kin)", phone: "+91 98•••• ••21" },
        participants: [],
        groups: f.groupSize ? Array.from({ length: Math.ceil(f.capacity / f.groupSize) }, (_, i) => ({ id: `n${i + 1}`, label: `Group ${String(i + 1).padStart(2, "0")}`, memberIds: [] })) : [],
        status: "review",
        createdByDemo: true,
      };
      createPlan(plan);
      setDone(plan);
      setSaving(false);
      toast.success("Sent to After Hours for review");
    }, 900);
  };

  if (done)
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-ok-soft text-ok">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Submitted for review</h1>
        <p className="mt-2 text-muted">
          <span className="font-semibold text-ink">{done.title}</span> is with the After Hours hub team. We check venue capacity, timings, pricing and terms, usually within 24 hours. Members can&apos;t see it until it&apos;s approved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/admin?tab=experiences">
            <Button variant="accent">Open admin review (demo)</Button>
          </Link>
          <Link href="/business/bookings">
            <Button variant="secondary">Manage bookings</Button>
          </Link>
          <Button variant="ghost" onClick={() => { setDone(null); setF(EMPTY); }}>
            Create another
          </Button>
        </div>
      </div>
    );

  const gross = f.price * f.capacity;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-semibold leading-tight">Create an experience</h1>
          <p className="mt-1 text-[15px] text-muted">Publish into a quiet slot. After Hours handles discovery, groups and introductions.</p>
        </div>
        <Button variant="secondary" onClick={() => { setF(TEMPLATE); setErrors({}); }}>
          <Sparkles className="size-4" /> Use the Friday template
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card className="space-y-4 p-5">
            <Field label="Experience name" error={errors.title}>
              <input id="exp-title" className={inputCls} value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="Coffee & Conversations" />
            </Field>
            <Field label="Description" error={errors.description} hint="What happens, who it's for, what makes it easy to join alone.">
              <textarea id="exp-desc" rows={4} className={inputCls} value={f.description} onChange={(e) => set({ description: e.target.value })} />
            </Field>
            <div>
              <div className="mb-1.5 text-[13px] font-semibold">Cover image</div>
              <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
                <button type="button" onClick={() => fileRef.current?.click()} className="grid size-20 shrink-0 place-items-center rounded-xl border-2 border-dashed border-line text-muted hover:border-ink/30 hover:text-ink">
                  <span className="flex flex-col items-center gap-1 text-[11px] font-semibold">
                    <Upload className="size-4" /> Upload
                  </span>
                </button>
                <input
                  ref={fileRef}
                  id="exp-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 1.5 * 1024 * 1024) {
                      setErrors((x) => ({ ...x, image: "That image is over 1.5 MB. Choose a smaller one for this demo." }));
                      return;
                    }
                    const r = new FileReader();
                    r.onload = () => set({ image: String(r.result) });
                    r.onerror = () => setErrors((x) => ({ ...x, image: "Couldn't read that file. Try another image." }));
                    r.readAsDataURL(file);
                  }}
                />
                {f.image.startsWith("data:") && (
                  <span className="relative shrink-0 rounded-xl ring-2 ring-ink ring-offset-2">
                    <Cover image={f.image} alt="Uploaded" className="size-20 rounded-xl" />
                  </span>
                )}
                {COVER_CHOICES.map((k) => (
                  <button type="button" key={k} onClick={() => set({ image: k })} className={cn("shrink-0 rounded-xl ring-2 ring-offset-2 transition", f.image === k ? "ring-ink" : "ring-transparent")}>
                    <Cover image={k} alt={k} className="size-20 rounded-xl" />
                  </button>
                ))}
              </div>
              {errors.image && <p className="mt-1 text-xs font-semibold text-danger">{errors.image}</p>}
            </div>
          </Card>

          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Venue">
              <select id="exp-venue" className={inputCls} value={f.venue} onChange={(e) => set({ venue: e.target.value })}>
                {VENUES.map((v) => (
                  <option key={v.name}>{v.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <select id="exp-date" className={inputCls} value={f.date} onChange={(e) => set({ date: e.target.value })}>
                {DEMO_WEEK.map((d) => (
                  <option key={d} value={d}>{fmtDate(d)}</option>
                ))}
              </select>
            </Field>
            <Field label="Start time" hint="Tip: 2–6 PM on weekdays is when nearby members are free.">
              <select id="exp-start" className={inputCls} value={f.start} onChange={(e) => set({ start: Number(e.target.value) })}>
                {times.map((t) => (
                  <option key={t} value={t}>{fmtTime(t)}</option>
                ))}
              </select>
            </Field>
            <Field label="Duration">
              <select id="exp-duration" className={inputCls} value={f.durationMin} onChange={(e) => set({ durationMin: Number(e.target.value) })}>
                {[60, 90, 120, 150].map((d) => (
                  <option key={d} value={d}>{d} minutes</option>
                ))}
              </select>
            </Field>
            <Field label="Capacity" error={errors.capacity} hint={`Venue maximum: ${venueCap}`}>
              <input id="exp-capacity" type="number" className={inputCls} value={f.capacity} onChange={(e) => set({ capacity: Number(e.target.value) })} />
            </Field>
            <Field label="Small-group size" hint="After Hours seats members in tables of this size.">
              <select id="exp-group" className={inputCls} value={f.groupSize} onChange={(e) => set({ groupSize: Number(e.target.value) })}>
                <option value={4}>Tables of 4</option>
                <option value={6}>Tables of 6</option>
                <option value={0}>No small groups</option>
              </select>
            </Field>
            <Field label="Price per person (₹)" error={errors.price}>
              <input id="exp-price" type="number" className={inputCls} value={f.price} onChange={(e) => set({ price: Number(e.target.value) })} />
            </Field>
            <Field label="How people join">
              <select id="exp-mode" className={inputCls} value={f.mode} onChange={(e) => set({ mode: e.target.value as BookingMode })}>
                <option value="instant">Instant booking</option>
                <option value="provisional">Provisional until half full</option>
                <option value="application">By application (I approve)</option>
              </select>
            </Field>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <div className="mb-1.5 text-[13px] font-semibold">What&apos;s included</div>
              <div className="flex flex-wrap gap-1.5">
                {[...new Set([...INCLUSION_IDEAS, ...f.inclusions])].map((i) => {
                  const on = f.inclusions.includes(i);
                  return (
                    <Chip key={i} selected={on} onClick={() => set({ inclusions: on ? f.inclusions.filter((x) => x !== i) : [...f.inclusions, i] })} className="text-[12.5px]">
                      {i}
                    </Chip>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-2">
                <input id="exp-incl" className={cn(inputCls, "h-9 py-1.5")} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add your own" />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (!custom.trim()) return;
                    set({ inclusions: [...f.inclusions, custom.trim()] });
                    setCustom("");
                  }}
                >
                  <Plus className="size-3.5" /> Add
                </Button>
              </div>
              {errors.inclusions && <p className="mt-1 text-xs font-semibold text-danger">{errors.inclusions}</p>}
            </div>
            <div>
              <div className="mb-1.5 text-[13px] font-semibold">Cancellation terms</div>
              <div className="space-y-2">
                {CANCEL.map((c) => (
                  <button type="button" key={c} onClick={() => set({ cancellation: c })} className={cn("block w-full rounded-xl border px-3.5 py-2.5 text-left text-[13px] transition", f.cancellation === c ? "border-ink font-semibold" : "border-line text-muted hover:border-ink/30")}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <aside>
          <div className="sticky top-20 space-y-4">
            <div className="text-[12px] font-bold uppercase tracking-wide text-muted">Member preview</div>
            <Card className="overflow-hidden">
              {f.image ? (
                <Cover image={f.image} alt={f.title || "Cover"} className="aspect-[16/10]" />
              ) : (
                <div className="grid aspect-[16/10] place-items-center bg-canvas text-subtle">
                  <ImagePlus className="size-6" />
                </div>
              )}
              <div className="p-4">
                <Badge tone="warn">In review after submit</Badge>
                <div className="mt-2 font-display text-[17px] font-semibold">{f.title || "Your experience name"}</div>
                <div className="mt-1 text-[13px] text-muted">
                  {fmtDate(f.date)} · {fmtTime(f.start)} · Kettle & Kin Café
                </div>
                <div className="text-[13px] text-muted">{f.groupSize ? `${Math.ceil(f.capacity / f.groupSize)} small groups of ${f.groupSize}` : "Open group"} · {inrPlain(f.price)}</div>
              </div>
            </Card>
            <Card className="p-4 text-[13px]">
              <div className="font-semibold">If every place sells</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between"><span className="text-muted">Bookings value</span><span className="font-semibold">{inrPlain(gross)}</span></div>
                <div className="flex justify-between"><span className="text-muted">After Hours commission ({COMMISSION_RATE * 100}%)</span><span className="font-semibold">−{inrPlain(gross * COMMISSION_RATE)}</span></div>
                <div className="flex justify-between border-t border-line pt-1 font-bold"><span>Your settlement</span><span>{inrPlain(gross * (1 - COMMISSION_RATE))}</span></div>
              </div>
              <p className="mt-2 text-[11.5px] text-muted">Members pay no platform fee. Settlement is paid after the event is completed.</p>
            </Card>
            <Button className="w-full" size="lg" variant="accent" loading={saving} onClick={submit}>
              Submit for review
            </Button>
            {Object.keys(errors).length > 0 && (
              <button onClick={() => setErrors({})} className="flex w-full items-center justify-center gap-1 text-[12px] font-semibold text-muted">
                <X className="size-3" /> Clear warnings
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

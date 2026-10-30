"use client";

import { ArrowRight, Play, RotateCcw, Shield, Store, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LogoMark } from "@/components/shared/logo";
import { Avatar, Confirm } from "@/components/ui";
import { RIYA_DEFAULT } from "@/data/seed";
import { useDemo } from "@/store/demo-store";

const QUESTIONS = [
  ["What problem are we solving?", "Landing page and Riya's onboarding"],
  ["How does the product work?", "Home → Free With Me → booking"],
  ["How does availability-based discovery work?", "Availability calendar and the fit checks in Free With Me"],
  ["How do users meet compatible people?", "Small-group matching with explanations"],
  ["How does a first experience become a relationship?", "Meet again → Kabir's invite → Film & Chai"],
  ["How do businesses participate?", "Café dashboard → publish → manage bookings"],
  ["How does After Hours make money?", "Business analytics: GMV, 12% commission, settlement"],
];

export default function DemoHome() {
  const router = useRouter();
  const s = useDemo();
  const [confirm, setConfirm] = useState(false);

  const options = [
    {
      icon: Play,
      title: "Start demo",
      body: "Fresh data, guide open, starting at the landing page.",
      accent: true,
      run: () => {
        s.reset();
        s.setGuideOpen(true);
        router.push("/");
      },
    },
    {
      icon: UserRound,
      title: "Enter as Riya",
      body: "Member · rotational shifts · DLF Phase 4",
      run: () => {
        s.enterAsRiya();
        s.setRole("member");
        router.push("/app");
      },
    },
    {
      icon: Store,
      title: "Enter as Café owner",
      body: "Meher Kapoor · Kettle & Kin Café",
      run: () => {
        s.setRole("business");
        router.push("/business");
      },
    },
    {
      icon: Shield,
      title: "Enter as Admin",
      body: "Gurugram Central hub operations",
      run: () => {
        s.setRole("admin");
        router.push("/admin");
      },
    },
  ];

  return (
    <div className="min-h-dvh bg-ink text-white">
      <div className="mx-auto max-w-[1080px] px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-center gap-3">
          <LogoMark size={36} />
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">Presentation mode</div>
            <div className="font-display text-xl font-semibold">After Hours</div>
          </div>
        </div>
        <h1 className="mt-10 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">A 6-minute walk through the whole marketplace.</h1>
        <p className="mt-4 max-w-xl text-white/65">Pick a starting point. The demo guide (bottom right) tells you what to show next, and every action works and persists until you reset.</p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((o) => (
            <button
              key={o.title}
              onClick={o.run}
              className={`group flex flex-col rounded-2xl p-5 text-left ring-1 transition hover:-translate-y-0.5 ${o.accent ? "bg-sunrise ring-sunrise hover:bg-sunrise-deep" : "bg-white/[0.06] ring-white/10 hover:bg-white/[0.1]"}`}
            >
              <o.icon className="size-5" />
              <div className="mt-6 font-display text-lg font-semibold">{o.title}</div>
              <div className={`mt-1 text-[13px] ${o.accent ? "text-white/85" : "text-white/60"}`}>{o.body}</div>
              <ArrowRight className="mt-4 size-4 opacity-60 transition group-hover:translate-x-1 group-hover:opacity-100" />
            </button>
          ))}
        </div>
        <button onClick={() => setConfirm(true)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-[13px] font-semibold ring-1 ring-white/10 hover:bg-white/[0.1]">
          <RotateCcw className="size-3.5" /> Reset demo data
        </button>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <h2 className="font-display text-xl font-semibold">What the faculty will see answered</h2>
            <ol className="mt-4 divide-y divide-white/10 rounded-2xl ring-1 ring-white/10">
              {QUESTIONS.map(([q, a], i) => (
                <li key={q} className="flex gap-4 px-4 py-3.5">
                  <span className="font-mono text-[12px] text-dawn">{i + 1}</span>
                  <div>
                    <div className="text-[14px] font-semibold">{q}</div>
                    <div className="text-[12.5px] text-white/55">{a}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <Avatar src={RIYA_DEFAULT.avatar} name="Riya" size={44} />
              <div>
                <div className="font-semibold">Riya, 26</div>
                <div className="text-[12.5px] text-white/55">Rotational shifts · new to DLF Phase 4</div>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-white/70">
              Often free on weekday afternoons when her friends are at work. Likes cafés, music, board games and exploring new places.
            </p>
            <div className="mt-4 rounded-xl bg-white/[0.06] p-3 text-[12.5px] text-white/70">
              <div className="font-semibold text-white">The story</div>
              Coffee & Conversations on Wednesday → meets Kabir → both choose “meet again” → roster changes → Kabir&apos;s invite doesn&apos;t fit → Film & Chai on Friday with Kabir.
            </div>
          </div>
        </div>
        <p className="mt-12 text-[12px] text-white/40">All people, venues, prices and figures are fictional demo data. Payments and authentication are simulated.</p>
      </div>
      <Confirm
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Reset the demo?"
        body="All bookings, connections, listings and approvals return to the starting data."
        confirmLabel="Reset demo"
        tone="danger"
        onConfirm={() => {
          s.reset();
          toast.success("Demo reset to starting data");
        }}
      />
    </div>
  );
}

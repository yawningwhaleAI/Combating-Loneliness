"use client";

import { ArrowRight, CalendarClock, HeartHandshake, Lock, Presentation, ShieldCheck, Store, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/logo";
import { Button, Cover, Field, inputCls, Modal } from "@/components/ui";
import { useDemo } from "@/store/demo-store";

export default function Landing() {
  const router = useRouter();
  const setFlag = useDemo((s) => s.setFlag);
  const enterAsRiya = useDemo((s) => s.enterAsRiya);
  const onboarded = useDemo((s) => s.onboarded);
  const [login, setLogin] = useState(false);

  useEffect(() => setFlag("visitedLanding"), [setFlag]);

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-muted md:flex">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#business" className="hover:text-ink">For businesses</a>
            <a href="#trust" className="hover:text-ink">Trust & safety</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLogin(true)}>Log in</Button>
            <Button size="sm" onClick={() => router.push("/onboarding?new=1")}>Sign up</Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-sunrise-soft px-3 py-1 text-[12.5px] font-semibold text-sunrise-deep">
            <span className="size-1.5 rounded-full bg-sunrise" /> Now piloting in Gurugram
          </span>
          <h1 className="mt-5 font-display text-[44px] font-semibold leading-[1.02] tracking-tight sm:text-[60px]">
            Your free time deserves better plans.
          </h1>
          <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-muted">
            Discover experiences. Meet your kind of people. Make the most of the hours that are yours.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="accent"
              onClick={() => {
                router.push(onboarded ? "/app" : "/onboarding");
              }}
            >
              Continue as demo user <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => router.push("/demo")}>
              <Presentation className="size-4" /> Presentation mode
            </Button>
          </div>
          <p className="mt-4 text-[12.5px] text-muted">Demo account: Riya, rotational shifts, free on weekday afternoons. No real sign-up or payment.</p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-5 grid-rows-6 gap-3 h-[420px] sm:h-[480px]">
            <Cover image="laughing" alt="Friends at a café" className="col-span-3 row-span-4 rounded-3xl" />
            <Cover image="pottery" alt="Pottery workshop" className="col-span-2 row-span-3 rounded-3xl" />
            <Cover image="pickleball" alt="Pickleball" className="col-span-2 row-span-3 rounded-3xl" />
            <Cover image="coffee" alt="Coffee" className="col-span-3 row-span-2 rounded-3xl" />
          </div>
          <div className="absolute -bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-[300px] rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-lift)]">
            <div className="text-[12px] font-semibold text-muted">Riya is free Wed 2–6 PM</div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas">
              <div className="free-band ml-[30%] h-full w-[34%] rounded-full" />
            </div>
            <div className="mt-3 flex items-center justify-between text-[13px]">
              <span className="font-semibold">4 plans fit · 2 people you know</span>
              <ArrowRight className="size-4 text-sunrise" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-canvas">
        <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6">
          <blockquote className="max-w-3xl font-display text-[26px] font-semibold leading-snug sm:text-[32px]">
            “I am free, but my friends are not. What can I do, and who can I do it with?”
          </blockquote>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            Nurses, hospitality staff, support teams on US shifts, freelancers. Their free time falls outside the usual evenings and weekends, so suitable plans happen when they can&apos;t attend, and joining alone feels awkward.
          </p>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">How After Hours works</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { icon: CalendarClock, title: "Share your free windows", body: "Wednesday 2–6 PM, a swapped Friday. Only the windows you choose, never your roster." },
            { icon: Users, title: "Join a small group", body: "Plans that genuinely fit your time, budget and area. You're placed at a table of 4–6 people who share your interests." },
            { icon: HeartHandshake, title: "Meet again", body: "Privately choose who you'd like to see again. If it's mutual, you connect and the next plan is easier." },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl border border-line p-6">
              <div className="grid size-11 place-items-center rounded-xl bg-ink text-white">
                <s.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="business" className="bg-ink text-white">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-dawn">For cafés, studios and venues</span>
            <h2 className="mt-3 font-display text-3xl font-semibold">Fill your quiet hours with people who are actually free.</h2>
            <p className="mt-4 text-white/70">
              Publish an experience in your underused slots. Members book, we handle introductions, you get customers and performance data. You pay an agreed commission on bookings; members never pay a platform fee.
            </p>
            <Button variant="accent" className="mt-6" onClick={() => router.push("/business")}>
              <Store className="size-4" /> See the business view
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["3 PM", "occupancy 24% → 71%"],
              ["12%", "booking commission"],
              ["₹0", "member platform fee"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
                <div className="font-display text-2xl font-semibold">{a}</div>
                <div className="mt-1 text-[12px] text-white/60">{b}</div>
              </div>
            ))}
            <p className="col-span-3 text-[11.5px] text-white/45">Illustrative pilot figures.</p>
          </div>
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">Built for trust from the first meeting</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "Public venues at launch", b: "First meetings happen at reviewed public venues with a named event lead." },
            { icon: Lock, t: "Private availability", b: "Share free windows with everyone, connections, or selected people." },
            { icon: HeartHandshake, t: "Mutual-only reconnecting", b: "One-sided “meet again” choices are never revealed." },
            { icon: Users, t: "Report and block", b: "Reach a person during events; reports are reviewed by the hub team." },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl bg-canvas p-5">
              <x.icon className="size-5 text-sunrise" />
              <div className="mt-3 font-semibold">{x.t}</div>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{x.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[12.5px] text-muted">Verification explains what we checked. It doesn&apos;t guarantee anyone&apos;s behaviour.</p>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-8 text-[12.5px] text-muted sm:px-6">
          <Logo />
          <span>Academic prototype. All people, venues and listings are fictional demo data.</span>
          <Link href="/demo" className="font-semibold text-ink hover:underline">Presentation mode</Link>
        </div>
      </footer>

      <Modal open={login} onClose={() => setLogin(false)}>
        <form
          className="p-6 sm:p-7"
          onSubmit={(e) => {
            e.preventDefault();
            enterAsRiya();
            setLogin(false);
            toast.success("Welcome back, Riya");
            router.push("/app");
          }}
        >
          <h3 className="font-display text-xl font-semibold">Log in</h3>
          <p className="mt-1 text-sm text-muted">Authentication is simulated in this prototype. Any details log you in as Riya.</p>
          <div className="mt-5 space-y-3">
            <Field label="Phone or email">
              <input id="login-id" className={inputCls} defaultValue="riya@example.com" />
            </Field>
            <Field label="Password">
              <input id="login-pw" type="password" className={inputCls} defaultValue="demo-password" />
            </Field>
          </div>
          <Button type="submit" className="mt-6 w-full" size="lg">
            Log in as Riya
          </Button>
        </form>
      </Modal>
    </div>
  );
}

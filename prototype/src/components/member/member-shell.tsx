"use client";

import { CalendarClock, CalendarDays, Clock3, Compass, Home, Sparkles, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { ViewSwitcher } from "@/components/shared/view-switcher";
import { Avatar, PageSkeleton } from "@/components/ui";
import { availabilityStatus } from "@/lib/availability";
import { cn, fmtDate, fmtTime, nowParts } from "@/lib/utils";
import { useDemo, useHydrated } from "@/store/demo-store";

const NAV = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/free", label: "Free With Me", icon: Sparkles },
  { href: "/app/people", label: "My People", icon: Users },
  { href: "/app/around", label: "Around Me", icon: Compass },
  { href: "/app/bookings", label: "Bookings", icon: Ticket },
  { href: "/app/availability", label: "My availability", icon: CalendarClock },
];

export function DemoClock({ className }: { className?: string }) {
  const now = useDemo((s) => s.now);
  const { date, minutes } = nowParts(now);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-ink/[0.05] px-2.5 py-1 font-mono text-[11px] text-muted", className)} title="The demo runs on a fixed clock so the story is repeatable">
      <Clock3 className="size-3" /> Demo · {fmtDate(date)}, {fmtTime(minutes)}
    </span>
  );
}

export function MemberShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const onboarded = useDemo((s) => s.onboarded);
  const profile = useDemo((s) => s.profile);
  const availability = useDemo((s) => s.availability);
  const now = useDemo((s) => s.now);
  const guideOpen = useDemo((s) => s.guideOpen);
  const setRole = useDemo((s) => s.setRole);

  useEffect(() => {
    if (hydrated && !onboarded) router.replace("/onboarding");
  }, [hydrated, onboarded, router]);
  useEffect(() => {
    if (hydrated) setRole("member");
  }, [hydrated, setRole]);

  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));
  const status = hydrated ? availabilityStatus(availability, now) : null;

  return (
    <div className={cn("min-h-dvh transition-[padding] duration-300", guideOpen && "xl:pr-[380px]")}>
      {/* Desktop sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-surface px-4 py-5 lg:flex")}>
        <Logo href="/app" className="px-2" />
        <nav className="mt-8 space-y-0.5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition",
                isActive(n.href) ? "bg-ink text-white" : "text-muted hover:bg-ink/[0.04] hover:text-ink",
              )}
            >
              <n.icon className="size-[18px]" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 rounded-2xl bg-canvas p-3.5">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-muted">
            <CalendarDays className="size-3.5" /> Your free time
          </div>
          <div className="mt-1 text-[13px] font-semibold leading-snug">{status?.text}</div>
          <Link href="/app/availability" className="mt-2 inline-block text-[12px] font-semibold text-sunrise-deep hover:underline">
            Update availability
          </Link>
        </div>
        <Link href="/app/profile" className={cn("mt-auto flex items-center gap-3 rounded-xl p-2 transition hover:bg-ink/[0.04]", pathname === "/app/profile" && "bg-ink/[0.04]")}>
          <Avatar src={profile.avatar} name={profile.name} size={36} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{profile.name}</div>
            <div className="truncate text-xs text-muted">{profile.area}, Gurugram</div>
          </div>
        </Link>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-line/80 bg-canvas/85 backdrop-blur-md" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3 lg:hidden">
              <Logo href="/app" />
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <DemoClock />
              {status && (
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold", status.free ? "bg-sunrise-soft text-sunrise-deep" : "bg-ink/[0.05] text-muted")}>
                  <span className={cn("size-1.5 rounded-full", status.free ? "bg-sunrise" : "bg-subtle")} />
                  {status.text}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ViewSwitcher />
              <Link href="/app/profile" className="sm:hidden" aria-label="Profile">
                <Avatar src={profile.avatar} name={profile.name} size={32} />
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-6 sm:px-6 lg:pb-12">{hydrated && onboarded ? children : <PageSkeleton />}</main>
      </div>

      {/* Mobile tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {NAV.slice(0, 5).map((n) => (
          <Link key={n.href} href={n.href} className={cn("flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-semibold", isActive(n.href) ? "text-ink" : "text-subtle")}>
            <n.icon className={cn("size-5", isActive(n.href) && "text-sunrise")} />
            {n.label.replace("Free With Me", "Free")}
          </Link>
        ))}
      </nav>
    </div>
  );
}

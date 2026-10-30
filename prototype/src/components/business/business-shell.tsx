"use client";

import { BarChart3, ClipboardCheck, LayoutDashboard, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { DemoClock } from "@/components/member/member-shell";
import { Logo } from "@/components/shared/logo";
import { ViewSwitcher } from "@/components/shared/view-switcher";
import { Avatar, PageSkeleton, Verified } from "@/components/ui";
import { imageUrl } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { useDemo, useHydrated } from "@/store/demo-store";

const NAV = [
  { href: "/business", label: "Overview", icon: LayoutDashboard },
  { href: "/business/create", label: "Create experience", icon: PlusCircle },
  { href: "/business/bookings", label: "Bookings", icon: ClipboardCheck },
  { href: "/business/analytics", label: "Analytics", icon: BarChart3 },
];

export const BUSINESS_ID = "kettle";

export function BusinessShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const org = useDemo((s) => s.organisers.find((o) => o.id === BUSINESS_ID));
  const guideOpen = useDemo((s) => s.guideOpen);
  const setRole = useDemo((s) => s.setRole);
  const setFlag = useDemo((s) => s.setFlag);
  useEffect(() => {
    if (!hydrated) return;
    setRole("business");
    setFlag("visitedBusiness");
  }, [hydrated, setRole, setFlag]);
  const active = (h: string) => (h === "/business" ? pathname === h : pathname.startsWith(h));

  return (
    <div className={cn("min-h-dvh transition-[padding] duration-300", guideOpen && "xl:pr-[380px]")}>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-ink px-4 py-5 text-white lg:flex">
        <Logo href="/business" light className="px-2" />
        <div className="mt-1 px-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/45">for business</div>
        <div className="mt-6 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
          <div className="flex items-center gap-2.5">
            <Avatar src={imageUrl("cafe", 200)} name="Kettle" size={36} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{org?.name}</div>
              <div className="truncate text-[11.5px] text-white/55">{org?.owner} · Owner</div>
            </div>
          </div>
          <div className="mt-2 [&_*]:!text-dawn">{org && <Verified status={org.verification} label="Verified business" />}</div>
        </div>
        <nav className="mt-6 space-y-0.5">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition", active(n.href) ? "bg-white text-ink" : "text-white/65 hover:bg-white/[0.07] hover:text-white")}>
              <n.icon className="size-[18px]" />
              {n.label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto px-2 text-[11.5px] leading-relaxed text-white/40">Figures in this portal are illustrative demo data.</p>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="lg:hidden">
              <Logo href="/business" />
            </div>
            <DemoClock className="hidden lg:inline-flex" />
            <ViewSwitcher />
          </div>
          <nav className="scrollbar-none flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold", active(n.href) ? "bg-ink text-white" : "text-muted")}>
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-6 sm:px-6">{hydrated ? children : <PageSkeleton />}</main>
      </div>
    </div>
  );
}

"use client";

import { Shield, Store, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/store/demo-store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLES: { id: Role; label: string; href: string; icon: typeof UserRound }[] = [
  { id: "member", label: "Member", href: "/app", icon: UserRound },
  { id: "business", label: "Business", href: "/business", icon: Store },
  { id: "admin", label: "Admin", href: "/admin", icon: Shield },
];

/** Demo-only switch between the three stakeholder views. */
export function ViewSwitcher({ className, dark }: { className?: string; dark?: boolean }) {
  const role = useDemo((s) => s.role);
  const setRole = useDemo((s) => s.setRole);
  const onboarded = useDemo((s) => s.onboarded);
  const enter = useDemo((s) => s.enterAsRiya);
  const router = useRouter();
  return (
    <div className={cn("inline-flex rounded-full p-1", dark ? "bg-white/10" : "bg-ink/[0.05]", className)} role="tablist" aria-label="Demo view">
      {ROLES.map((r) => (
        <button
          key={r.id}
          role="tab"
          aria-selected={role === r.id}
          aria-label={r.label}
          onClick={() => {
            setRole(r.id);
            if (r.id === "member" && !onboarded) enter();
            router.push(r.href);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12.5px] font-semibold transition-all sm:px-3",
            role === r.id ? (dark ? "bg-white text-ink" : "bg-surface text-ink shadow-sm") : dark ? "text-white/70 hover:text-white" : "text-muted hover:text-ink",
          )}
        >
          <r.icon className="size-3.5" />
          <span className="hidden sm:inline">{r.label}</span>
        </button>
      ))}
    </div>
  );
}

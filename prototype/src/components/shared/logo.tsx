import Link from "next/link";
import { useId } from "react";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  // Unique gradient id: several logos can be on a page and a hidden one would break a shared id.
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ff7a4d" />
          <stop offset="1" stopColor="#ffb35c" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="#141a33" />
      <path d="M8 21a8 8 0 0 1 16 0z" fill={`url(#${id})`} />
      <rect x="6" y="22.5" width="20" height="2" rx="1" fill="#ffffff" opacity=".9" />
    </svg>
  );
}

export function Logo({ href = "/", className, light }: { href?: string; className?: string; light?: boolean }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className={cn("font-display text-[19px] font-semibold tracking-tight", light ? "text-white" : "text-ink")}>After Hours</span>
    </Link>
  );
}

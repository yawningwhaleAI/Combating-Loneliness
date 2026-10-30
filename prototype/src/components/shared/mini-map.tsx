import { cn } from "@/lib/utils";

/** Stylised map tile. A real map provider would replace this. */
export function MiniMap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 110" className={cn("w-full rounded-xl bg-[#eef1f5]", className)} aria-hidden>
      <path d="M0 70 C60 60 90 90 150 75 S240 40 300 55" stroke="#d6dbe5" strokeWidth="10" fill="none" />
      <path d="M110 0 L130 110" stroke="#d6dbe5" strokeWidth="7" />
      <path d="M220 0 L200 110" stroke="#e1e5ec" strokeWidth="5" />
      <rect x="20" y="15" width="60" height="30" rx="6" fill="#e2e8df" />
      <rect x="235" y="72" width="50" height="28" rx="6" fill="#e2e8df" />
      <circle cx="160" cy="52" r="16" fill="#f2643a" opacity=".18" />
      <circle cx="160" cy="52" r="6" fill="#f2643a" stroke="#fff" strokeWidth="2.5" />
    </svg>
  );
}

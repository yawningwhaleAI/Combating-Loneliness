"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Check, Clock3, Hourglass, Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { imageTone, imageUrl } from "@/data/catalog";
import { useDemo } from "@/store/demo-store";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger" | "outline";

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg"; loading?: boolean }) {
  const v: Record<Variant, string> = {
    primary: "bg-ink text-white hover:bg-ink-2 shadow-sm",
    accent: "bg-sunrise text-white hover:bg-sunrise-deep shadow-sm",
    secondary: "bg-surface text-ink border border-line hover:border-ink/20 hover:bg-canvas",
    outline: "border border-ink/15 text-ink hover:bg-ink hover:text-white",
    ghost: "text-ink hover:bg-ink/5",
    danger: "bg-danger text-white hover:brightness-95",
  };
  const s = { sm: "h-8 px-3 text-[13px] gap-1.5", md: "h-10 px-4 text-sm gap-2", lg: "h-12 px-6 text-[15px] gap-2" }[size];
  return (
    <button
      className={cn(
        "inline-flex select-none items-center justify-center rounded-full font-semibold transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        v[variant],
        s,
        className,
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={cn("rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]", className)}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "ok" | "warn" | "accent" | "danger" | "iris" | "dark"; className?: string }) {
  const t = {
    neutral: "bg-canvas text-muted border border-line",
    ok: "bg-ok-soft text-ok",
    warn: "bg-warn-soft text-warn",
    accent: "bg-sunrise-soft text-sunrise-deep",
    danger: "bg-danger-soft text-danger",
    iris: "bg-iris-soft text-iris",
    dark: "bg-ink text-white",
  }[tone];
  return <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold", t, className)}>{children}</span>;
}

/** Slide 5: applications, provisional and confirmed places must look different. */
export function StatusChip({ status, className }: { status: string; className?: string }) {
  if (status === "confirmed")
    return (
      <Badge tone="ok" className={className}>
        <Check className="size-3" strokeWidth={3} /> Confirmed
      </Badge>
    );
  if (status === "provisional")
    return (
      <Badge tone="warn" className={className}>
        <Hourglass className="size-3" /> Provisional
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge tone="neutral" className={cn("border-dashed", className)}>
        <Clock3 className="size-3" /> Application pending
      </Badge>
    );
  if (status === "attended")
    return (
      <Badge tone="iris" className={className}>
        <Check className="size-3" strokeWidth={3} /> Attended
      </Badge>
    );
  if (status === "cancelled") return <Badge tone="danger" className={className}>Cancelled</Badge>;
  return <Badge className={className}>{status}</Badge>;
}

export function Chip({ selected, onClick, children, className }: { selected?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all",
        selected ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink hover:border-ink/30",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Avatar({ src, name, size = 40, ring, className }: { src?: string; name: string; size?: number; ring?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name.slice(0, 1).toUpperCase();
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      role="img"
      aria-label={name}
      className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-display font-semibold text-white", ring && "ring-2 ring-white", className)}
      style={{ width: size, height: size, fontSize: size * 0.4, background: `hsl(${hue} 45% 45%)` }}
    >
      {initials}
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" aria-hidden className="absolute inset-0 size-full object-cover" onError={() => setFailed(true)} />
      ) : null}
    </span>
  );
}

export function AvatarStack({ people, max = 4, size = 28 }: { people: { name: string; avatar?: string }[]; max?: number; size?: number }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <Avatar key={p.name + i} src={p.avatar} name={p.name} size={size} ring className={i ? "-ml-2" : ""} />
      ))}
      {rest > 0 && (
        <span className="-ml-2 grid place-items-center rounded-full bg-canvas text-[11px] font-bold text-muted ring-2 ring-white" style={{ width: size, height: size }}>
          +{rest}
        </span>
      )}
    </div>
  );
}

/** Photo with a designed fallback, so a missing image never looks broken. */
export function Cover({ image, alt, className, children }: { image: string; alt: string; className?: string; children?: ReactNode }) {
  const [failed, setFailed] = useState(false);
  const [a, b] = imageTone(image);
  const src = imageUrl(image);
  return (
    <div className={cn("relative overflow-hidden bg-ink", className)} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
      {src && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      )}
      {(failed || !src) && (
        <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full" aria-label={alt} role="img">
          <circle cx="70" cy="62" r="26" fill="#fff" opacity=".14" />
          <circle cx="70" cy="62" r="16" fill="#fff" opacity=".14" />
          <rect x="0" y="56" width="100" height="4" fill="#fff" opacity=".1" />
        </svg>
      )}
      {children}
    </div>
  );
}

export function Modal({ open, onClose, children, className, wide }: { open: boolean; onClose: () => void; children: ReactNode; className?: string; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-surface shadow-[var(--shadow-lift)] sm:rounded-3xl",
              wide ? "sm:max-w-3xl" : "sm:max-w-lg",
              className,
            )}
          >
            <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-canvas text-muted hover:text-ink">
              <X className="size-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Confirm({
  open,
  title,
  body,
  confirmLabel,
  tone = "primary",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 sm:p-7">
        <h3 className="pr-10 font-display text-xl font-semibold">{title}</h3>
        <div className="mt-2 text-sm leading-relaxed text-muted">{body}</div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Keep as is
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-12 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-sunrise-soft text-sunrise">{icon}</div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between text-[12.5px] font-semibold text-muted">
        {label}
        {icon && <span className="text-subtle">{icon}</span>}
      </div>
      <div className="mt-2 font-display text-[26px] font-semibold tabular-nums leading-none">{value}</div>
      {hint && <div className="mt-2 text-xs text-muted">{hint}</div>}
    </Card>
  );
}

export function SectionTitle({ title, sub, action, annotation }: { title: string; sub?: string; action?: ReactNode; annotation?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl font-semibold sm:text-[22px]">{title}</h2>
          {annotation && <Annotation label={annotation} />}
        </div>
        {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/** Presentation annotation. Only visible when the demo guide's annotations are switched on. */
export function Annotation({ label, className }: { label: string; className?: string }) {
  const on = useDemo((s) => s.annotations && s.guideOpen);
  if (!on) return null;
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("inline-flex items-center gap-1 rounded-full border border-iris/30 bg-iris-soft px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider text-iris", className)}
    >
      <Sparkles className="size-3" /> {label}
    </motion.span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-ink/[0.06]", className)} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80" />
      <div className="grid gap-4 pt-4 sm:grid-cols-3">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}

export function Verified({ status, label }: { status: "verified" | "pending" | "rejected"; label?: string }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-iris">
        <BadgeCheck className="size-3.5" /> {label ?? "Verified"}
      </span>
    );
  if (status === "pending") return <Badge tone="warn">Verification pending</Badge>;
  return <Badge tone="danger">Not verified</Badge>;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-semibold">
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && onChange(!checked)}
        onClick={() => onChange(!checked)}
        className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-ink" : "bg-ink/15")}
      >
        <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", checked ? "left-[18px]" : "left-0.5")} />
      </span>
      {label}
    </label>
  );
}

export function Field({ label, children, hint, error }: { label: string; children: ReactNode; hint?: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-danger">{error}</span> : hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-ink/5 placeholder:text-subtle";

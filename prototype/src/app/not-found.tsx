import Link from "next/link";
import { LogoMark } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4 text-center">
      <div>
        <LogoMark size={44} className="mx-auto" />
        <h1 className="mt-5 font-display text-3xl font-semibold">This page is off shift</h1>
        <p className="mt-2 text-muted">The link may be old, or the plan was removed.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/app" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">Go to the app</Link>
          <Link href="/demo" className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold">Presentation mode</Link>
        </div>
      </div>
    </div>
  );
}

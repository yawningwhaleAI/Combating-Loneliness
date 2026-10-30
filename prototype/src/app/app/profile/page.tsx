"use client";

import { LogOut, RotateCcw, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, Badge, Button, Card, Chip, Confirm } from "@/components/ui";
import { INTERESTS } from "@/data/catalog";
import { PEOPLE } from "@/data/seed";
import type { Budget } from "@/lib/types";
import { useDemo } from "@/store/demo-store";

export default function Profile() {
  const s = useDemo();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const mine = s.reports.filter((r) => r.reporter === "Riya");
  const attended = s.bookings.filter((b) => b.status === "attended").length;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="h-fit p-6 text-center">
        <Avatar src={s.profile.avatar} name={s.profile.name} size={96} className="mx-auto" />
        <h1 className="mt-3 font-display text-2xl font-semibold">
          {s.profile.name}, {s.profile.age}
        </h1>
        <div className="text-sm text-muted">{s.profile.area}, Gurugram</div>
        <div className="mt-3 flex justify-center gap-1.5">
          <Badge tone="iris"><ShieldCheck className="size-3" /> Phone verified</Badge>
          <Badge tone="iris">Work email verified</Badge>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            [attended + 2, "attended"],
            [s.connections.length, "connections"],
            [s.circles.length, "circles"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-xl bg-canvas py-2.5">
              <div className="font-display text-xl font-semibold">{n}</div>
              <div className="text-[11px] text-muted">{l}</div>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="mt-5 w-full" onClick={() => router.push("/")}>
          <LogOut className="size-4" /> Back to landing page
        </Button>
      </Card>

      <div className="space-y-5">
        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold">Interests</h2>
          <p className="text-[13px] text-muted">Used to explain your group matches. Changes apply to future bookings.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {INTERESTS.map((i) => {
              const on = s.profile.interests.includes(i.id);
              return (
                <Chip key={i.id} selected={on} onClick={() => s.updateProfile({ interests: on ? s.profile.interests.filter((x) => x !== i.id) : [...s.profile.interests, i.id] })}>
                  {i.label}
                </Chip>
              );
            })}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold">Budget per plan</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {([300, 600, 1000, 5000] as Budget[]).map((b) => (
              <Chip key={b} selected={s.profile.budget === b} onClick={() => s.updateProfile({ budget: b })}>
                {b === 5000 ? "Any budget" : `Up to ₹${b.toLocaleString("en-IN")}`}
              </Chip>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold">Safety centre</h2>
          <div className="mt-3 text-sm font-semibold">Blocked members</div>
          {s.blocked.length === 0 && <p className="text-[13px] text-muted">You haven&apos;t blocked anyone.</p>}
          <ul className="mt-2 space-y-2">
            {s.blocked.map((id) => {
              const p = PEOPLE.find((x) => x.id === id);
              return (
                <li key={id} className="flex items-center gap-3">
                  <Avatar src={p?.avatar} name={p?.name ?? "?"} size={30} />
                  <span className="flex-1 text-sm font-semibold">{p?.name}</span>
                  <Button size="sm" variant="secondary" onClick={() => { s.unblock(id); toast(`${p?.name} unblocked`); }}>Unblock</Button>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 text-sm font-semibold">Your reports</div>
          {mine.length === 0 && <p className="text-[13px] text-muted">No reports sent.</p>}
          <ul className="mt-2 space-y-2">
            {mine.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-xl bg-canvas px-3 py-2 text-[13px]">
                <span className="truncate"><span className="font-semibold">{r.targetLabel}</span> · {r.reason}</span>
                <Badge tone={r.status === "resolved" ? "ok" : "warn"}>{r.status === "open" ? "Open" : r.status === "reviewing" ? "Under review" : "Resolved"}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold">Demo controls</h2>
          <p className="text-[13px] text-muted">Reset everything to the starting data before a presentation.</p>
          <Button variant="secondary" className="mt-3" onClick={() => setConfirm(true)}>
            <RotateCcw className="size-4" /> Reset demo
          </Button>
        </Card>
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
          toast.success("Demo reset");
          router.push("/");
        }}
      />
    </div>
  );
}

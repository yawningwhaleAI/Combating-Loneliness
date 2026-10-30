"use client";

import { CalendarPlus, EyeOff, Lock, Repeat, Timer, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, Chip, Field, inputCls } from "@/components/ui";
import { PEOPLE } from "@/data/seed";
import { audienceLabel } from "@/lib/availability";
import { windowLabel } from "@/lib/matching";
import type { Audience, Availability, AvailabilityWindow } from "@/lib/types";
import { cn, DAYS, DEMO_WEEK, fmtDate, fmtTime, uid, weekdayIndex } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

const START_H = 7;
const END_H = 23;
const HOURS = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);

function cellsFromWindows(windows: AvailabilityWindow[]) {
  const set = new Set<string>();
  for (const w of windows) {
    if (w.kind !== "recurring") continue;
    for (let m = w.start; m < w.end; m += 60) set.add(`${w.day}-${Math.floor(m / 60)}`);
  }
  return set;
}

function windowsFromCells(cells: Set<string>, previous: AvailabilityWindow[]): AvailabilityWindow[] {
  const out: AvailabilityWindow[] = [];
  for (let d = 0; d < 7; d++) {
    let runStart: number | null = null;
    for (let h = START_H; h <= END_H; h++) {
      const on = h < END_H && cells.has(`${d}-${h}`);
      if (on && runStart === null) runStart = h;
      if (!on && runStart !== null) {
        const prev = previous.find((w) => w.kind === "recurring" && w.day === d && w.start <= runStart! * 60 && w.end >= runStart! * 60);
        out.push({ id: prev?.id ?? uid("w"), kind: "recurring", day: d, start: runStart * 60, end: h * 60, audience: prev?.audience ?? "everyone", selectedIds: prev?.selectedIds });
        runStart = null;
      }
    }
  }
  return out;
}

export function AvailabilityEditor({ value, onChange, compact }: { value: Availability; onChange: (a: Availability) => void; compact?: boolean }) {
  const [cells, setCells] = useState(() => cellsFromWindows(value.windows));
  const drag = useRef<{ mode: "add" | "remove" } | null>(null);
  const connections = useDemo((s) => s.connections);

  useEffect(() => setCells(cellsFromWindows(value.windows)), [value.windows]);

  const commit = (next: Set<string>) => {
    const recurring = windowsFromCells(next, value.windows);
    const temporary = value.windows.filter((w) => w.kind === "temporary");
    onChange({ ...value, windows: [...recurring, ...temporary] });
  };

  const cellsRef = useRef(cells);
  cellsRef.current = cells;

  const paint = (key: string, mode: "add" | "remove") => {
    const next = new Set(cellsRef.current);
    if (mode === "add") next.add(key);
    else next.delete(key);
    cellsRef.current = next;
    setCells(next);
  };

  useEffect(() => {
    const up = () => {
      if (drag.current) {
        drag.current = null;
        commit(cellsRef.current);
      }
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const temp = value.windows.filter((w) => w.kind === "temporary");
  const recurring = value.windows.filter((w) => w.kind === "recurring").sort((a, b) => (a.day ?? 0) - (b.day ?? 0) || a.start - b.start);

  const setAudience = (id: string, audience: Audience, selectedIds?: string[]) =>
    onChange({ ...value, windows: value.windows.map((w) => (w.id === id ? { ...w, audience, selectedIds: selectedIds ?? w.selectedIds } : w)) });

  return (
    <div className={cn("grid gap-5", !compact && "xl:grid-cols-[1fr_340px]")}>
      <Card className="overflow-hidden p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-display text-base font-semibold">Weekly free time</div>
            <p className="text-[12.5px] text-muted">Click or drag across the hours you&apos;re usually free. Week of 2 Nov 2026.</p>
          </div>
          <div className="flex items-center gap-3 text-[11.5px] font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="free-band size-3 rounded" /> Recurring
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded border-2 border-dashed border-iris bg-iris-soft" /> Temporary
            </span>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <div className="grid min-w-[560px] select-none grid-cols-[44px_repeat(7,1fr)] gap-x-1.5" style={{ touchAction: "pan-y" }}>
            <div />
            {DEMO_WEEK.map((date, d) => {
              const blocked = value.blocked.find((b) => b.date === date);
              return (
                <div key={date} className="pb-2 text-center">
                  <div className="text-[12px] font-bold">{DAYS[d]}</div>
                  <div className="font-mono text-[10.5px] text-subtle">{date.slice(8)} Nov</div>
                  {blocked && <div className="mt-1 rounded-full bg-ink px-1.5 py-0.5 text-[9.5px] font-bold text-white">Working</div>}
                </div>
              );
            })}
            {HOURS.map((h) => (
              <Row key={h} h={h}>
                {DEMO_WEEK.map((date, d) => {
                  const key = `${d}-${h}`;
                  const on = cells.has(key);
                  const blocked = value.blocked.some((b) => b.date === date);
                  const tempOn = temp.some((w) => w.date === date && w.start <= h * 60 && w.end > h * 60);
                  const prevOn = cells.has(`${d}-${h - 1}`);
                  const nextOn = cells.has(`${d}-${h + 1}`);
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={`${DAYS[d]} ${fmtTime(h * 60)} ${on ? "free" : "not free"}`}
                      aria-pressed={on}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        const mode = on ? "remove" : "add";
                        drag.current = { mode };
                        paint(key, mode);
                      }}
                      onPointerEnter={() => drag.current && paint(key, drag.current.mode)}
                      className={cn(
                        "relative h-7 border-x border-line/60 transition-colors",
                        on ? "free-band border-transparent" : "bg-canvas hover:bg-sunrise-soft",
                        on && !prevOn && "rounded-t-lg",
                        on && !nextOn && "rounded-b-lg",
                        blocked && on && "opacity-30",
                        blocked && "bg-[repeating-linear-gradient(135deg,rgb(20_26_51/.06)_0_5px,transparent_5px_10px)]",
                      )}
                    >
                      {tempOn && <span className="pointer-events-none absolute inset-0.5 rounded-md border-2 border-dashed border-iris bg-iris-soft/80" />}
                    </button>
                  );
                })}
              </Row>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-2 font-display text-base font-semibold">
            <Repeat className="size-4 text-sunrise" /> Your windows
          </div>
          <div className="mt-3 space-y-2.5">
            {recurring.length === 0 && temp.length === 0 && <p className="text-sm text-muted">No free time yet. Paint a few hours on the calendar.</p>}
            {[...recurring, ...temp].map((w) => (
              <WindowRow key={w.id} w={w} connections={connections.map((c) => c.personId)} onAudience={setAudience} onRemove={() => onChange({ ...value, windows: value.windows.filter((x) => x.id !== w.id) })} />
            ))}
          </div>
        </Card>
        <TemporaryForm onAdd={(w) => onChange({ ...value, windows: [...value.windows, w] })} />
        <div className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-[12.5px] leading-relaxed text-muted">
          <Lock className="mt-0.5 size-4 shrink-0 text-ink" />
          <div>
            <span className="font-semibold text-ink">Your roster stays private.</span> After Hours only stores the free windows you choose. Other members see a day-level hint like “Free Wed afternoon”, never your hours or shifts.
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ h, children }: { h: number; children: React.ReactNode }) {
  return (
    <>
      <div className="-mt-1.5 pr-1 text-right font-mono text-[10px] text-subtle">{h % 2 === 1 ? fmtTime(h * 60) : ""}</div>
      {children}
    </>
  );
}

function WindowRow({ w, onAudience, onRemove, connections }: { w: AvailabilityWindow; onAudience: (id: string, a: Audience, ids?: string[]) => void; onRemove: () => void; connections: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[13.5px] font-semibold">
            {windowLabel(w)}
            {w.kind === "temporary" && (
              <Badge tone="iris">
                <Timer className="size-3" /> Expires {fmtDate(w.expiresOn ?? w.date!)}
              </Badge>
            )}
          </div>
          <button type="button" onClick={() => setOpen((o) => !o)} className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-muted hover:text-ink">
            <EyeOff className="size-3" /> Visible to: {audienceLabel[w.audience]}
          </button>
        </div>
        <button type="button" onClick={onRemove} aria-label="Remove window" className="grid size-8 shrink-0 place-items-center rounded-full text-subtle hover:bg-danger-soft hover:text-danger">
          <Trash2 className="size-4" />
        </button>
      </div>
      {open && (
        <div className="mt-2.5 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {(["everyone", "connections", "selected"] as Audience[]).map((a) => (
              <Chip key={a} selected={w.audience === a} onClick={() => onAudience(w.id, a)} className="px-2.5 py-1 text-[12px]">
                {audienceLabel[a]}
              </Chip>
            ))}
          </div>
          {w.audience === "selected" && (
            <div className="flex flex-wrap gap-1.5">
              {connections.map((id) => {
                const person = PEOPLE.find((p) => p.id === id);
                const sel = w.selectedIds?.includes(id);
                return (
                  <Chip
                    key={id}
                    selected={sel}
                    onClick={() => onAudience(w.id, "selected", sel ? (w.selectedIds ?? []).filter((x) => x !== id) : [...(w.selectedIds ?? []), id])}
                    className="px-2.5 py-1 text-[12px]"
                  >
                    {person?.name}
                  </Chip>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TemporaryForm({ onAdd }: { onAdd: (w: AvailabilityWindow) => void }) {
  const [date, setDate] = useState(DEMO_WEEK[4]);
  const [start, setStart] = useState(16 * 60);
  const [end, setEnd] = useState(20 * 60);
  const [expires, setExpires] = useState(DEMO_WEEK[4]);
  const [audience, setAudience] = useState<Audience>("connections");
  const [error, setError] = useState("");
  const times = Array.from({ length: 33 }, (_, i) => 7 * 60 + i * 30);
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 font-display text-base font-semibold">
        <CalendarPlus className="size-4 text-iris" /> Add temporary availability
      </div>
      <p className="mt-1 text-[12.5px] text-muted">For a one-off day off or a swapped shift. It disappears after it expires.</p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <Field label="Day">
          <select className={inputCls} value={date} onChange={(e) => { setDate(e.target.value); setExpires(e.target.value); }}>
            {DEMO_WEEK.map((d) => (
              <option key={d} value={d}>
                {fmtDate(d)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Expires on">
          <select className={inputCls} value={expires} onChange={(e) => setExpires(e.target.value)}>
            {DEMO_WEEK.filter((d) => d >= date).map((d) => (
              <option key={d} value={d}>
                {fmtDate(d)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="From">
          <select className={inputCls} value={start} onChange={(e) => setStart(Number(e.target.value))}>
            {times.map((t) => (
              <option key={t} value={t}>
                {fmtTime(t)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Until">
          <select className={inputCls} value={end} onChange={(e) => setEnd(Number(e.target.value))}>
            {times.map((t) => (
              <option key={t} value={t}>
                {fmtTime(t)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(["everyone", "connections"] as Audience[]).map((a) => (
          <Chip key={a} selected={audience === a} onClick={() => setAudience(a)} className="px-2.5 py-1 text-[12px]">
            {audienceLabel[a]}
          </Chip>
        ))}
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-danger">{error}</p>}
      <Button
        variant="secondary"
        size="sm"
        className="mt-3"
        type="button"
        onClick={() => {
          if (end <= start) return setError("The end time needs to be after the start time.");
          setError("");
          onAdd({ id: uid("w"), kind: "temporary", date, day: weekdayIndex(date), start, end, expiresOn: expires, audience });
        }}
      >
        Add window
      </Button>
    </Card>
  );
}

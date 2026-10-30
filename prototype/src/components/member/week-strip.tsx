"use client";

import { weekWindows } from "@/lib/availability";
import type { Availability } from "@/lib/types";
import { cn, DAYS, DEMO_WEEK, nowParts } from "@/lib/utils";

const FROM = 7 * 60;
const TO = 23 * 60;

/** Compact week view of shared free time, with today's position marked. */
export function WeekStrip({ availability, now, className }: { availability: Availability; now: string; className?: string }) {
  const all = weekWindows(availability);
  const { date: today, minutes } = nowParts(now);
  return (
    <div className={cn("grid grid-cols-7 gap-1.5", className)}>
      {DEMO_WEEK.map((date, i) => {
        const wins = all.filter((x) => x.date === date);
        const blocked = availability.blocked.some((b) => b.date === date);
        const isToday = date === today;
        return (
          <div key={date} className="min-w-0">
            <div className={cn("mb-1 text-center text-[11px] font-bold", isToday ? "text-sunrise-deep" : "text-muted")}>{DAYS[i]}</div>
            <div className={cn("relative h-16 overflow-hidden rounded-lg bg-canvas ring-1 ring-line", blocked && "bg-[repeating-linear-gradient(135deg,rgb(20_26_51/.07)_0_4px,transparent_4px_8px)]")}>
              {wins.map(({ window: w }) => (
                <div
                  key={w.id}
                  className={cn("absolute inset-x-1 rounded", w.kind === "temporary" ? "border-2 border-dashed border-iris bg-iris-soft" : "free-band")}
                  style={{ top: `${((w.start - FROM) / (TO - FROM)) * 100}%`, height: `${((w.end - w.start) / (TO - FROM)) * 100}%` }}
                />
              ))}
              {isToday && <div className="absolute inset-x-0 h-0.5 bg-ink" style={{ top: `${((minutes - FROM) / (TO - FROM)) * 100}%` }} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

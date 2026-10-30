import type { Availability, AvailabilityWindow } from "./types";
import { DAYS, DEMO_WEEK, fmtRange, fmtTime, nowParts, weekdayIndex } from "./utils";

/** Concrete windows for the demo week, after blocked dates and expiry. */
export function weekWindows(av: Availability) {
  const out: { date: string; window: AvailabilityWindow }[] = [];
  for (const date of DEMO_WEEK) {
    if (av.blocked.some((b) => b.date === date)) continue;
    const day = weekdayIndex(date);
    for (const w of av.windows) {
      if (w.kind === "recurring" && w.day === day) out.push({ date, window: w });
      if (w.kind === "temporary" && w.date === date && (!w.expiresOn || w.expiresOn >= date)) out.push({ date, window: w });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.window.start - b.window.start);
}

export function availabilityStatus(av: Availability, now: string) {
  const { date, minutes } = nowParts(now);
  const all = weekWindows(av);
  const current = all.find((x) => x.date === date && x.window.start <= minutes && x.window.end > minutes);
  if (current) return { free: true, text: `Free now until ${fmtTime(current.window.end)}`, window: current };
  const next = all.find((x) => x.date > date || (x.date === date && x.window.start > minutes));
  if (next) {
    const label = next.date === date ? "Today" : DAYS[weekdayIndex(next.date)];
    return { free: false, text: `Next free: ${label} ${fmtRange(next.window.start, next.window.end)}`, window: next };
  }
  return { free: false, text: "No free time shared this week", window: undefined };
}

export const audienceLabel = { everyone: "Everyone in the hub", connections: "Connections only", selected: "Selected people" } as const;

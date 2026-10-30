import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAYS_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The demo runs inside one fixed week so the story is reproducible. */
export const DEMO_WEEK = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08"];

export function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** 0 = Monday … 6 = Sunday */
export function weekdayIndex(iso: string) {
  return (parseDate(iso).getDay() + 6) % 7;
}

export function fmtDate(iso: string, long = false) {
  const d = parseDate(iso);
  const day = long ? DAYS_LONG[weekdayIndex(iso)] : DAYS[weekdayIndex(iso)];
  return `${day}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function fmtTime(min: number) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function fmtRange(start: number, end: number) {
  return `${fmtTime(start)} – ${fmtTime(end)}`;
}

export function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} hr${h > 1 ? "s" : ""}`;
}

export function inr(n: number) {
  if (n === 0) return "Free";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function inrPlain(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/** demo clock: "2026-11-04T13:40" */
export function nowParts(now: string) {
  const [date, time] = now.split("T");
  const [h, m] = time.split(":").map(Number);
  return { date, minutes: h * 60 + m };
}

export function isPast(date: string, start: number, now: string) {
  const n = nowParts(now);
  if (date < n.date) return true;
  if (date > n.date) return false;
  return start <= n.minutes;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function greeting(now: string) {
  const { minutes } = nowParts(now);
  if (minutes < 12 * 60) return "Good morning";
  if (minutes < 17 * 60) return "Good afternoon";
  return "Good evening";
}

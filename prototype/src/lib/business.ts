import { KETTLE_HISTORY } from "@/data/seed";
import { COMMISSION_RATE, historySettlements, settlementFor } from "./economics";
import { activeParticipants } from "./matching";
import type { Plan } from "./types";
import { isPast } from "./utils";

/** All business KPIs are derived from plans + illustrative history, so they move as the demo is used. */
export function businessMetrics(plans: Plan[], orgId: string, now: string) {
  const mine = plans.filter((p) => p.organiserId === orgId && p.status !== "rejected");
  const upcoming = mine.filter((p) => p.status === "live" && !isPast(p.date, p.start, now));
  const completed = mine.filter((p) => p.status === "completed");
  const history = historySettlements();
  const liveSettlements = completed.map(settlementFor);
  const settlements = [...history, ...liveSettlements];

  const liveBookings = mine.reduce((n, p) => n + activeParticipants(p).filter((x) => x.status === "confirmed").length, 0);
  const bookings = KETTLE_HISTORY.reduce((n, h) => n + h.bookings, 0) + liveBookings;
  const gmv = settlements.reduce((n, s) => n + s.gmv, 0);
  const commission = settlements.reduce((n, s) => n + s.commission, 0);
  const net = gmv - commission;

  const upcomingCap = upcoming.reduce((n, p) => n + p.capacity, 0);
  const upcomingTaken = upcoming.reduce((n, p) => n + activeParticipants(p).length, 0);
  const histCap = KETTLE_HISTORY.reduce((n, h) => n + h.capacity, 0);
  const histTaken = KETTLE_HISTORY.reduce((n, h) => n + h.bookings, 0);
  const attended = KETTLE_HISTORY.reduce((n, h) => n + h.attended, 0);
  const repeat = KETTLE_HISTORY.reduce((n, h) => n + h.repeat, 0);

  const sessions = [
    ...KETTLE_HISTORY.map((h) => ({ label: h.date.slice(5).replace("-", "/"), bookings: h.bookings, attended: h.attended, repeat: h.repeat })),
    ...completed.map((p) => {
      const a = activeParticipants(p);
      return { label: p.date.slice(5).replace("-", "/"), bookings: a.length, attended: a.filter((x) => x.checkedIn).length, repeat: 0 };
    }),
  ];

  return {
    mine,
    upcoming,
    completed,
    settlements,
    sessions,
    totalExperiences: mine.length + KETTLE_HISTORY.length,
    bookings,
    gmv,
    commission,
    net,
    commissionRate: COMMISSION_RATE,
    upcomingUtilisation: upcomingCap ? upcomingTaken / upcomingCap : 0,
    historicUtilisation: histCap ? histTaken / histCap : 0,
    repeatRate: attended ? repeat / attended : 0,
  };
}

// Marketplace economics from Slide 11: businesses pay an agreed booking commission; members pay no platform fee.

import { KETTLE_HISTORY } from "@/data/seed";
import type { Plan, Settlement } from "./types";
import { activeParticipants } from "./matching";

export const COMMISSION_RATE = 0.12;

export function settlementFor(plan: Plan): Settlement {
  const active = activeParticipants(plan).filter((p) => p.status === "confirmed");
  const attended = active.filter((p) => p.checkedIn).length;
  const gmv = active.length * plan.price;
  const commission = Math.round(gmv * COMMISSION_RATE);
  return {
    planId: plan.id,
    title: plan.title,
    date: plan.date,
    bookings: active.length,
    attended,
    gmv,
    commission,
    net: gmv - commission,
    status: plan.status === "completed" ? "scheduled" : "scheduled",
  };
}

export function historySettlements(price = 299): Settlement[] {
  return KETTLE_HISTORY.map((h) => {
    const gmv = h.bookings * price;
    const commission = Math.round(gmv * COMMISSION_RATE);
    return { planId: h.planId, title: h.title, date: h.date, bookings: h.bookings, attended: h.attended, gmv, commission, net: gmv - commission, status: "paid" as const };
  });
}

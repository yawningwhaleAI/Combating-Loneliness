import type { Role } from "@/lib/types";
import type { useDemo } from "@/store/demo-store";

type S = ReturnType<typeof useDemo.getState>;

export interface Step {
  id: string;
  act: string;
  title: string;
  say: string;
  href: string;
  role: Role;
  annotation?: string;
  done: (s: S) => boolean;
}

const booking = (s: S, planId: string) => s.bookings.find((b) => b.planId === planId && b.status !== "cancelled");

export const STEPS: Step[] = [
  { id: "landing", act: "1 · The problem", title: "Open the landing page", say: "“I'm free, but my friends aren't.” After Hours starts from your free time, not from a feed.", href: "/", role: "member", done: (s) => !!s.flags.visitedLanding },
  { id: "profile", act: "1 · The problem", title: "Create Riya's profile", say: "Interests, activities, budget, group size and the kind of places she's comfortable in.", href: "/onboarding", role: "member", done: (s) => s.onboarded },
  { id: "availability", act: "1 · The problem", title: "Share free windows, not a roster", say: "Riya shares Wed 2–6 PM, Thu 11–4, Sat 10–2. Her work schedule is never shown to anyone.", href: "/app/availability", role: "member", annotation: "Private by design", done: (s) => s.onboarded },
  { id: "home", act: "2 · Discover & book", title: "Home dashboard", say: "Greeting, availability status, plans that fit, people free at the same time, invitations.", href: "/app", role: "member", done: (s) => !!s.flags.visitedHome },
  { id: "free", act: "2 · Discover & book", title: "Free With Me", say: "Every listing is checked against time, budget, distance, capacity and eligibility. Toggle on 'show plans that don't fit' to see why.", href: "/app/free", role: "member", annotation: "Availability-based discovery", done: (s) => !!s.flags.visitedFree },
  { id: "book", act: "2 · Discover & book", title: "Book Coffee & Conversations", say: "Review → details → simulated payment → confirm. Confirmed, provisional and application states look different.", href: "/app/plans/p_coffee", role: "member", done: (s) => !!booking(s, "p_coffee") },
  { id: "group", act: "2 · Discover & book", title: "Meet her small group", say: "Group 04, six people. Matching is rules-based and explained: shared interests, familiar faces, table size.", href: "/app/bookings/p_coffee", role: "member", annotation: "Rules-based matching", done: (s) => !!s.flags.viewedGroup },
  { id: "attend", act: "3 · Relationships", title: "Check in and attend", say: "Simulated check-in at the venue. The event lead is named and reachable.", href: "/app/bookings/p_coffee", role: "member", done: (s) => booking(s, "p_coffee")?.status === "attended" },
  { id: "meet", act: "3 · Relationships", title: "Meet again: Kabir", say: "Choices are private. Riya and Kabir both chose each other, so they connect. One-sided choices are never revealed.", href: "/app/bookings/p_coffee", role: "member", annotation: "Mutual connection", done: (s) => s.connections.some((c) => c.personId === "kabir") },
  { id: "roster", act: "3 · Relationships", title: "Riya's roster changes", say: "Thursday becomes a work day; she adds a temporary Friday window that expires on its own.", href: "/app/availability", role: "member", done: (s) => s.rosterUpdated },
  { id: "invite", act: "3 · Relationships", title: "Kabir's pickleball invite", say: "In My People, Kabir posts “Pickleball at 4?”. Join me checks Riya's updated availability, and it doesn't fit.", href: "/app/people", role: "member", done: (s) => !!s.flags.checkedKabirInvite },
  { id: "familiar", act: "3 · Relationships", title: "Film & Chai with Kabir", say: "The app suggests Film & Chai on Friday, where Kabir is going. She joins someone she already knows: our North Star.", href: "/app/plans/p_film", role: "member", annotation: "North Star +1", done: (s) => !!booking(s, "p_film") },
  { id: "biz", act: "4 · Business", title: "Café owner dashboard", say: "Meher's café is empty 2–6 PM. After Hours shows the demand and fills those quiet hours.", href: "/business", role: "business", done: (s) => !!s.flags.visitedBusiness },
  { id: "publish", act: "4 · Business", title: "Publish an experience", say: "Coffee & Conversations, Friday edition: capacity, price, inclusions, cancellation terms. It goes to review.", href: "/business/create", role: "business", done: (s) => s.plans.some((p) => p.createdByDemo) },
  { id: "manage", act: "4 · Business", title: "Manage bookings", say: "Approve applications, check people in, complete the event.", href: "/business/bookings", role: "business", done: (s) => !!s.flags.visitedBizBookings },
  { id: "analytics", act: "4 · Business", title: "Money: GMV → commission → settlement", say: "Members don't pay platform fees. The business pays a 12% booking commission; illustrative numbers.", href: "/business/analytics", role: "business", annotation: "Business monetisation", done: (s) => !!s.flags.visitedAnalytics },
  { id: "approve", act: "5 · Operations", title: "Admin approves the listing", say: "Every listing is reviewed before it goes live. Verification explains what we checked; it's not a guarantee.", href: "/admin?tab=experiences", role: "admin", done: (s) => s.plans.some((p) => p.createdByDemo && p.status === "live") },
  { id: "safety", act: "5 · Operations", title: "Safety & hub health", say: "Reports, blocks, refunds and the weekly North Star for the Gurugram hub.", href: "/admin?tab=reports", role: "admin", annotation: "Trust operations", done: (s) => !!s.flags.visitedAdminReports },
];

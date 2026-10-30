# After Hours — Prototype PRD

Source of truth: the After Hours business proposal (12 slides, "A social marketplace built around your free time").

## 1. Problem
> "I am free, but my friends are not. What can I do, and who can I do it with?"

Three barriers (Slide 2): **Timing** (activities happen when I can't attend), **Company** (I don't want to join alone), **Continuity** (a good first meeting doesn't lead to another).

## 2. Personas
| Persona | Need | Prototype role |
|---|---|---|
| Riya, 26, rotational-shift employee, Gurugram | Plans and company during weekday afternoons | Member demo account |
| Kabir, 28, freelancer | Regular in-person interaction | Riya's tablemate → connection |
| Meher Kapoor, owner of Kettle & Kin Café | Fill underused 2–6 PM capacity profitably | Business demo account |
| After Hours hub operator | Approvals, trust & safety, hub health | Admin demo account |

## 3. Scope (MVP, from Slide 7 MoSCoW)
**Must:** availability windows, listings, booking / application, confirmation states, attendance, host review, cancellation & refund handling, reporting, essential privacy.
**Should:** small groups, mutual "Meet again", persistent circles, simple stories & replies.
**Could (shown lightly):** rich stories, host analytics.
**Later (not built):** private-home parties, video, ML matching, multiple hubs.

## 4. Key journeys
1. **Onboard:** landing → profile → interests → preferences → availability (private free windows).
2. **Discover:** Free With Me filters every plan against availability, budget, distance, capacity and eligibility, and explains why each plan does or doesn't fit.
3. **Book:** review → participant info → simulated payment → confirm → Confirmed / Provisional / Application pending.
4. **Small group:** rules-based table assignment with an explanation.
5. **Attend → Meet again:** check-in, then private, mutual-only reconnection.
6. **Return:** Kabir's pickleball invite conflicts with Riya's updated roster, so she joins Film & Chai, where Kabir is also going. The North Star metric goes up by one.
7. **Business:** quiet-hour insight → publish experience → admin approval → manage bookings / check-in / complete → GMV, 12% commission, settlement.
8. **Admin:** members, business verification, experience approvals, reports, refunds, hub metrics.

## 5. North Star (Slide 9)
Weekly unique members attending a gathering with someone they met through After Hours at an earlier gathering.

## 6. Architecture
- Next.js App Router + TypeScript + Tailwind v4, lucide icons, framer-motion, Recharts, sonner toasts.
- `src/lib/types.ts` (data model), `src/data/*` (seed data), `src/lib/matching.ts` (feasibility, ranking, group assignment), `src/lib/economics.ts` (commission and settlement), `src/store/demo-store.ts` (zustand + localStorage persistence, every action).
- Routes: `/` landing, `/demo` presentation mode, `/onboarding`, `/app/*` member, `/business/*` organiser, `/admin` operations.
- Upgrade path: replace the store actions with Supabase queries; types map 1:1 to tables.

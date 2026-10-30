# After Hours: interactive prototype

A social marketplace built around your free time. Members discover experiences that fit their real availability, join small groups of 4–6, and keep meeting the people they click with. Businesses fill quiet hours and pay a booking commission.

Academic prototype for the PM101 final project, "Combating Loneliness in an Increasingly Digital World". All people, venues, prices and figures are fictional demo data.

## Run it locally

```bash
cd prototype
npm install
npm run dev        # http://localhost:3000
# or a production build
npm run build && npm start
```

Node 18.18+ (tested on Node 22). No environment variables are needed. See `.env.example`.

## Deploy to Vercel

1. In Vercel, choose **Add New → Project** and import the GitHub repo `yawningwhaleai/combating-loneliness`.
2. Set **Root Directory** to `prototype`. Vercel detects Next.js; keep the default build settings.
3. Click **Deploy**. No environment variables are required.

With the CLI instead: `cd prototype && npx vercel --prod`.

## Presenting (5–7 minutes)

Open `/demo` (Presentation mode):

- **Start demo** resets the data and opens the demo guide.
- **Enter as Riya** goes to the member app.
- **Enter as Café owner** goes to the business portal.
- **Enter as Admin** goes to hub operations.
- **Reset demo data** restores the starting state before each run.

The **Demo guide** button (bottom right, on every page) lists the 18 steps across five acts, ticks them off automatically as you go, and has a **Go there** button for each. Its toggle shows or hides the small feature annotations in the product: Availability-based discovery, Rules-based matching, Mutual connection, North Star +1, Business monetisation and Trust operations.

### The story the demo tells

1. Riya (rotational shifts) shares free windows: Wed 2–6 PM, Thu 11–4, Sat 10–2.
2. Free With Me checks each plan against her windows, duration, budget, distance, capacity and eligibility, and explains each result.
3. She books **Coffee & Conversations** and is placed in **Group 04 (6 members)**, with a rules-based explanation of why.
4. She checks in and finishes the experience, then privately picks Kabir and Ananya in **Meet again**. Kabir picked her too, so they connect. Ananya's choice is never revealed.
5. Her roster changes: Thursday becomes a work day and she gets a temporary Friday 4–9 PM window.
6. Kabir posts "Pickleball at 4?". **Join me** checks her updated availability: it doesn't fit.
7. The app suggests **Film & Chai** on Friday, where Kabir is going. She books it and sits at his table, and the North Star metric goes up by one in the admin hub view.
8. The café owner sees demand for quiet hours, publishes a Friday edition, approves applications, checks people in, completes events and sees GMV → 12% commission → net settlement.
9. The admin approves the new listing, verifies businesses, triages reports and processes refunds.

## What's built

**Member app (`/app`)**
- Home: greeting, availability status, week strip, recommendations, upcoming bookings, people free at the same time, invitations, feed and circles.
- Free With Me: real filtering by time window, category, budget and distance, with an optional "doesn't fit" view that gives reasons.
- Activity detail: cover image, host, venue, price breakdown, participants, group composition, rules, cancellation policy, a trust-and-safety section, Invite a friend and Report.
- Booking flow: review → your details → simulated payment → confirm → success. It distinguishes **Confirmed**, **Provisional** and **Application pending**.
- Small group: explanation, member profiles with shared interests highlighted, introduce yourself, group chat, event details, report and block.
- Attendance: simulated check-in, then finishing the experience moves the demo clock forward.
- Mutual Meet again, and starting a circle from a table.
- My People: stories with like, reply, Interested and Join me; connections; circles; Meet again history.
- Around Me: hub map, category and area filters, new experiences, community gatherings, popular venues.
- Availability editor: drag to paint recurring windows, temporary windows with expiry, per-window audience (everyone, connections, selected people), and a roster-change action.
- Bookings list with cancellation and refund status, plus a profile page with interests, budget, safety centre and reset.

**Business portal (`/business`)**: KPIs, quiet-hour occupancy chart, local demand signal, create experience (validated form, image upload or gallery, live preview, earnings estimate), manage bookings (approve or decline applications, check-in, complete or cancel with confirmation), analytics (bookings, GMV, commission, net settlement, utilisation, repeat participation, settlement table).

**Admin (`/admin`)**: hub overview with the weekly North Star metric, experience approval queue with review checks, business verification, members (suspend or reactivate), reports (triage, resolve, suspend), bookings and refunds.

## Simulated vs. real

| Area | Status |
|---|---|
| Navigation, filters, matching, booking states, capacity, groups, connections, stories, approvals, dashboards | **Working** in the browser; state persists in `localStorage` |
| Availability-based filtering and small-group matching | **Working**, deterministic rules (`src/lib/matching.ts`) |
| Commission and settlement maths | **Working** (`src/lib/economics.ts`, `src/lib/business.ts`), on illustrative data |
| Authentication / sign up / log in | Simulated: everyone enters as the demo user |
| Payments (UPI, card, pay at venue) and refunds | Simulated, no money moves |
| Venue check-in (QR) | Simulated with a button |
| Other members' Meet-again choices | Seeded demo intents |
| Maps | Stylised illustration, no map provider |
| Notifications, SMS, email | Shown as in-app toasts only |
| Photos | Unsplash and randomuser.me URLs at runtime, with designed fallbacks if a photo can't load |
| Business / hub analytics history | Illustrative seed data, clearly labelled |

## Architecture

```
src/
  app/                 routes (App Router)
    page.tsx           landing          demo/        presentation mode
    onboarding/        6-step profile   app/         member app
    business/          organiser portal admin/       hub operations
  components/
    ui.tsx             design-system primitives (Button, Card, Modal, StatusChip …)
    member/ business/ demo/ shared/
  data/                catalog.ts (interests, images, areas), seed.ts (people, plans, stories …)
  lib/
    types.ts           data model (maps 1:1 to future tables)
    matching.ts        feasibility checks, ranking, group assignment, explanations
    availability.ts    week windows and status
    economics.ts       commission and settlement
    business.ts        derived business KPIs
  store/demo-store.ts  zustand store + localStorage persistence; every user action
```

**Upgrade path:** each store action maps to one API call. Move `types.ts` to Supabase tables (users, availability_windows, hubs, organisers, plans, bookings, groups, attendance, connections, stories, reports, settlements), replace the actions with queries and mutations, and plug in Supabase Auth and a payment provider.

**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Recharts, Lucide icons, Sonner toasts, Zustand.

# 07 · Feature Requirements and Prototype Specification

> **Status: built.** See `smartsell-app/README.md` for how to run, test and deploy, and the 5-minute demo script.

**Objective:** a judge can pick up a phone or laptop, play a field rep for 3 minutes and a manager for 1 minute, change the numbers, and watch the logic respond. It must be **reliable offline-ish, resettable, and honest** ("SYNTHETIC DATA" banner always visible; no L'Oréal logos or systems implied).

---

## 1. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Native Vercel deploy; one codebase for mobile rep view and desktop manager view |
| UI | **Tailwind CSS + shadcn/ui** (Radix primitives) | Fast, accessible, polished components |
| State | **Zustand** with `persist` → `localStorage` | Instant interactions, no backend failure modes during a live demo |
| Validation | **Zod** schemas for every form | Consistent validation and error messages |
| Charts | **Recharts** | Simple KPI trends and bars |
| Risk engine | Pure TS module `lib/risk/*` (port of `model/risk_engine_reference.py`) | Same logic as the methodology slide; unit-tested |
| Tests | **Vitest** (engine: worked examples must match `08`) + **Playwright** smoke test of the demo path | Demo can't break silently |
| Data | Seeded JSON in `/data` (synthetic), loaded into the store on first run; **"Reset demo"** button restores the seed | Deterministic demo every time |
| Deploy | **Vercel** (static where possible) | Zero-ops, shareable URL, preview deploys |
| *Optional P2* | Shared demo state via **Vercel KV / Upstash Redis** (or Supabase) behind a "Live sync" toggle | Lets a manager on a second device see the rep's actions in real time. Off by default for reliability. |

**Explicitly not used:** auth provider (role picker instead), real barcode SDK in MVP (simulated scan), LLM calls (no dependence on network or API keys during judging).

---

## 2. Information architecture and navigation

```
/                     Landing + role picker ("Sales Rep", "Sales Manager", "Distributor")
/rep                  Today's beat (territory overview for rep)
/rep/outlet/[id]      Outlet brief → Visit mode (Smart Count) → Recommendations → Order → Summary
/rep/sku/[outletId]/[skuId]   SKU detail: "Why flagged", batches, what-if sliders
/rep/actions          My actions (open / awaiting approval / done)
/manager              Territory overview (KPIs, risk table, heat by outlet)
/manager/approvals    Approval queue
/manager/team         Rep scorecards
/manager/outcomes     Before/after + rescued ₹ + sustainability counters
/distributor          Godown ageing, transfer tasks, suggested primary order
/method               "How the scoring works" (formula explainer, the same as slide 8)
Global: role switcher (top bar), Simulation date + "+14 days" time-advance, Reset demo, SYNTHETIC DATA badge
```

---

## 3. Data model (TypeScript, abbreviated)

```ts
type BrandTier = 'MASS' | 'PRO' | 'DERMA' | 'LUXE';
type NodeType = 'retailer' | 'distributor';
type DataSource = 'scan' | 'dms' | 'manual_count' | 'retailer_verbal' | 'estimate';
type RiskState = 'NEAR_EXPIRY' | 'AGEING_RISK' | 'STOCKOUT_RISK' | 'DORMANT' | 'OVERSTOCK' | 'HEALTHY';

interface Sku { id; ean; name; brand; division: 'CPD'|'PPD'|'DBD'|'LUXE'; tier: BrandTier; category; packSize: number /*case pack*/; ptr: number; distPrice: number; shelfLifeMonths: number; }
interface Territory { id; name; repId; distributorIds: string[] }
interface Distributor { id; name; area; territoryId; params?: Partial<NodeParams> }
interface Outlet { id; name; type: 'cosmetic_store'|'chemist'|'kirana'|'salon'|'dept_store'; area; distributorId; territoryId; beatDay; lat; lng }
interface Batch { code: string; expiry: string /*YYYY-MM-DD*/; qty: number }
interface StockPosition { nodeId; nodeType: NodeType; skuId; batches: Batch[]; monthlySales: number; salesHistory: number[] /*last 3 months*/; source: DataSource; countedAt: string; signals: SignalCode[]; inTransit: number }
interface Recommendation { id; nodeId; skuId; level: 'L0'|'L1'|...|'L8'; title; rationale; expectedUnits; expectedRs; costRs; needsApproval: boolean; owner: 'rep'|'distributor'|'asm'; transfer?: { toNodeId; qty } }
interface Action { id; recId; status: 'proposed'|'accepted'|'modified'|'rejected'|'awaiting_approval'|'approved'|'in_progress'|'done'|'verified'; qty?; reasonCode?; note?; assignee; createdAt; dueAt; outcome?: { unitsMoved; rsRescued; verifiedAt } }
interface Visit { id; outletId; repId; startedAt; endedAt?; counts: Record<skuId, {...}>; orderLines: OrderLine[]; summary? }
interface OrderLine { skuId; requestedQty; suggestedQty; finalQty; overrideReason? }
```

Derived values (state, U, ₹ at risk, window, DOC, confidence, priority) are **computed by selectors, never stored**, so every edit updates everything.

---

## 4. Synthetic dataset (internally consistent)

**Simulation date:** 2 Nov 2026 (fixed; "+14 days" advances it).
**Region:** Mumbai (fictional network, real neighbourhood names for realism).

| Territory | Rep (fictional) | Distributor (fictional) | Outlets (6 each) |
|---|---|---|---|
| T1 Andheri–Bandra | Kunal | D1 Western Suburbs Beauty Distributors | Shree Beauty & Cosmetics (Andheri W) · Glow Chemist (Lokhandwala) · Style Corner (Bandra W) · New Bharat General Store (Andheri E) · Hair Studio 9 (salon, Bandra) · Linking Rd Beauty Hub |
| T2 Malad–Borivali | Ananya | D2 Northline Distributors | Sai Kirana (Malad W) · CarePoint Chemist (Kandivali) · Borivali Beauty Mart · Orchid Salon · Gokul Stores · Evershine Cosmetics |
| T3 Powai–Ghatkopar | Farhan | D3 Lakeview Trade Links | Powai Wellness Chemist · Hiranandani Beauty · Ghatkopar Fancy Stores · Glamour Salon · Galleria Counter (dept store, Luxe) · Vikhroli Kirana |

Manager: **Meera (ASM Mumbai)**. Pronouns aren't used in UI copy.

**SKU catalogue (24 SKUs, fictional brands mapped to L'Oréal-like divisions):**

| Brand (fictional) | Tier | SKUs (PTR ₹) |
|---|---|---|
| **Lumea** (hair, mass) | MASS | Anti-Hairfall Shampoo 340 ml (210) · Anti-Hairfall Conditioner 175 ml (160) · Repair Serum 100 ml (290) · Hair Colour Natural Black 3.0 (150) · Hair Colour Burgundy 3.16 (150) · Hair Colour Mocha 5.35 (150) |
| **Verdé** (skin, mass) | MASS | Hydrating Gel Face Wash 100 ml (180) · Vitamin C Serum 30 ml (520) · Bright Day Cream SPF30 50 g (260) · Micellar Water 400 ml (340) · Sunscreen SPF50 50 ml (330) · Sheet Mask (80) |
| **Chroma** (makeup, mass) | MASS | Matte Lipstick Ruby 301 (350) · Matte Lipstick Nude 105 (350) · Kajal (190) · Foundation 128 (550) · Foundation 330 (550) · Mascara (450) |
| **DermaPure** (dermo) | DERMA | Hydrating Cleanser 236 ml (1,100) · Moisturising Cream 177 ml (1,250) · SA Smoothing Cleanser (1,150) |
| **Salon Pro** (professional) | PRO | Bond Repair Mask 200 ml (780) · Colour-Protect Shampoo 300 ml (640) |
| **Maison Éclat** (luxe) | LUXE | Eau de Parfum 50 ml (6,800) |

Each outlet carries 10–16 SKUs appropriate to its type (salons: Salon Pro plus a few mass; dept-store: Luxe plus Derma; kirana: mass only). About **70% of positions are HEALTHY**, so flags stand out. Batch codes look like `B2611` (year and month of manufacture).

**Seeded scenarios (numbers verified with the reference engine):**

| ID | Scenario | Node · SKU | Seed | Engine output |
|---|---|---|---|---|
| **S1** | **Near-expiry excess** (loaded via a festive scheme) | Shree Beauty · Lumea Shampoo | 120 units, batch expiry in 105 days, 20/month, signals: unopened cartons | `NEAR_EXPIRY` · 70 units unsold · **₹14,700** · window 75 days · order guardrail 0 |
| **S3a** | **Stock-out risk, same SKU, same beat** | Glow Chemist · Lumea Shampoo | 20 units, 75/month, fresh batch | `STOCKOUT_RISK` · 8 days cover · ~15 units lost next cycle |
| — | **Hero rebalance** | S1 → S3a transfer | Engine suggests **66 units** (11 case packs of 6; recipient capacity 180) | After: S1 ₹840 left (4 units → bundle), S3a HEALTHY (34 days cover) |
| **S2** | **Slow-moving, healthy shelf life** (assortment mismatch) | Sai Kirana · Verdé Vitamin C Serum | 24 units, 3/month, 16 months left | `OVERSTOCK` · 240 days cover · no unsold units → diagnose, visibility, cap, transfer to CarePoint chemist. **No discount offered.** |
| **S3b** | **High-demand stock-out, no surplus nearby** | Powai Wellness Chemist · Verdé Face Wash | 12 units, 60/month | `STOCKOUT_RISK` · 6 days cover · suggested order 62 (→ 60, case pack 12) from D3 |
| **S4** | **Distributor hidden near-expiry** | D1 · Lumea Hair Colour Burgundy | 900 units (200 days) + 1,200 (520 days), 300/month | `NEAR_EXPIRY` on old batch · 100 units · ₹13,500 (at distributor price ₹135) · window 80 days. D2 needs it (stock-out risk), so a cross-distributor transfer is suggested. Totals show "210 days of cover". |
| **S5** | **Poor visibility / weak demand** | Style Corner · Chroma Lipstick Ruby 301 | 30 units, 4/month, signals: behind counter, no tester; peer outlets sell 15/month | `OVERSTOCK` + visibility chips → P5 playbook (tester, placement) |
| **S6** | **Low-confidence data** | New Bharat General Store · Lumea Conditioner | Retailer verbal, count 40 days old | Confidence Low → "Verify first"; L3+ locked |
| **S7** | **Luxe guardrail** | Galleria Counter · Maison Éclat EDP | Slow, 9 months left | Ladder excludes L6; manager rejects a discount request in the demo |

---

## 5. Screen-by-screen specification

### SCR-01 Landing / role picker
- **Content:** product name and tagline ("Catch slow stock early. Fix it cheaply. Grow sell-through."), 3 role cards, "How scoring works" link, SYNTHETIC DATA badge.
- **Actions:** select role → route. "Reset demo" (confirm dialog).
- **States:** first load seeds the store (spinner < 300 ms). If localStorage is unavailable, fall back to in-memory state with a toast: "Changes won't be saved on this browser."

### SCR-02 Rep · Today's beat (territory overview)
- **Header KPIs:** outlets today (8) · ₹ at risk in beat · near-expiry SKUs · stock-out risks · actions open.
- **Outlet list:** name, type icon, area, top state badge, ₹ at stake, # flags, visit status (Not started / In progress / Done). Sorted by Priority ₹ (toggle: beat order).
- **Filters:** state chips; distributor.
- **Empty state:** "No outlets planned today. Pick from all outlets →".
- **Success:** visited outlets show ✓ and ₹ rescued.

### SCR-03 Rep · Outlet brief (pre-visit)
- **Content:** outlet card (type, last visit, distributor), **top 5 flagged SKUs** with one-line reason ("~70 units unlikely to sell before mid-Jan buffer"), expected stock from last count + deliveries.
- **Actions:** **Start visit**, view all SKUs, call/WhatsApp (disabled stub, "demo").
- **Empty:** "No risks predicted here. Do a quick shelf walk and take the order." (still allows Start visit)

### SCR-04 Rep · Visit: Smart Count (core interaction)
- **Per flagged SKU row:** expected qty (grey) · **counted qty** (stepper + numeric input) · batch rows (code, expiry month/year, qty; "+ batch") · **Scan** button (simulated) · signals checklist (12 codes, multi-select chips) · data source (auto: scan > manual).
- **Simulated scan:** opens a sheet with a fake viewfinder. The rep can tap "Simulate scan" (picks the expected EAN, 800 ms animation), type an EAN, or pick from the list. An unknown EAN gives the error "Not in catalogue for this outlet – add SKU?".
- **Live risk chip** on each row recalculates on every change (state colour, ₹, window).
- **"Add unflagged SKU"** search.
- **Validation (Zod):**
  - count: integer 0–9,999; required to finish the row
  - batch qty sum must equal count (inline error "Batches add up to 48, count is 50"; quick-fix button "put difference in oldest batch")
  - expiry: valid month/year; past expiry is allowed but turns the row "Expired: return/destroy flow"; expiry > 60 months ahead gives a warning ("unusually long, check")
  - monthly sales (editable in advanced section): 0–9,999
  - count drastically different from expected (±50%) gives a soft warning: "Big difference from expected (40). Recount?" with an anomaly flag
- **Finish visit count** → Recommendations. Rows left uncounted stay at "expected" with Low confidence.

### SCR-05 Rep · SKU detail ("Why flagged")
- **Plain-language explanation:** "At ~20 units a month, about 50 of these 120 will sell before 17 Jan 2027, when stock becomes hard to sell (30 days before expiry). **~70 units (₹14,700) are at risk.** You have **75 days** to act."
- **Numbers panel:** stock, velocity, days of cover, batches timeline (FEFO bar chart: sold vs unsold per batch), confidence and why.
- **What-if sliders** (judge playground): quantity, monthly sales, expiry date, unit value, MSB (advanced). Instant recalculation. "Reset to counted".
- **Peer benchmark:** "Similar chemists sell 75/month."
- **Link:** "How is this calculated?" → `/method#fefo`.

### SCR-06 Rep · Recommendations
- **Cards ranked** (max 3 shown, "more" expander): level tag (L1…L8), title ("Transfer 66 units to Glow Chemist, Lokhandwala"), why (1 line with numbers), expected impact (units, ₹), cost, approval badge, owner.
- **Actions per card:** **Accept** · **Modify** (qty stepper, recipient dropdown, due date) · **Reject** (reason required: "retailer refused", "already done", "wrong data", "not suitable for brand", "other + note").
- **Rules:** if confidence is Low, only L0 is actionable and others show a 🔒 tooltip "Verify count first". Luxe/Derma never shows L6. Transfer qty can't exceed recipient capacity (validation error with the max).
- **Success:** toast "Transfer request sent to Western Suburbs Beauty Distributors (awaiting ASM approval: > ₹10,000)".
- **Error:** recipient no longer has capacity (state changed) → "Capacity changed to 40; update quantity?".

### SCR-07 Rep · Order guardrail
- **Table:** SKU · stock · cover · requested (input) · **suggested** · reason (e.g. "At-risk batch, don't add", "Will run out in 6 days") · final qty.
- **Validation:** final qty integer ≥ 0, multiple of case pack (auto-round prompt). Final > suggested × 1.5 on an at-risk SKU requires an **override reason**.
- **Totals:** order value; "₹ of new risk avoided" vs requested.
- **Success:** "Order sent to distributor (simulated)".

### SCR-08 Rep · Visit summary
- ₹ at risk before → after (projected), actions created (with owners), order value, time in visit, signals logged. Buttons: "Next outlet", "Share summary with retailer (preview)".

### SCR-09 Rep · My actions
- **Tabs:** Open · Awaiting approval · Done · Verified. Each item shows status timeline, due date, owner.
- **Actions:** mark in progress / done; add photo (stub) and note.
- **Time-advance "+14 days"** (global) simulates sales at each node using velocity and executes distributor-confirmed transfers. Re-visiting shows the **outcome** (units sold, ₹ rescued, state change).
- **Empty:** "No actions yet. Start a visit to get recommendations."

### SCR-10 Manager · Territory overview
- **KPI tiles:** ₹ at risk (total, Δ vs last week) · near-expiry % of stock value · stock-out risk count · action completion % · ₹ rescued (verified) · secondary sales index vs control (synthetic).
- **Risk table:** outlet × SKU rows with filters (territory, rep, distributor, state, tier). Sortable by Priority ₹.
- **"Repeat offenders":** SKUs flagged in ≥ 3 outlets → "possible range/pack issue → notify brand team" button.
- **Charts:** ₹ at risk by territory (bar); state mix (stacked bar); trend (line, synthetic 8 weeks + live current).
- **Empty:** "No risks in this filter. 🎉"

### SCR-11 Manager · Approval queue
- **Item:** request (type, SKU, qty, ₹), rep, reason, engine rationale, guardrail check (e.g. "Luxe: discounts not allowed").
- **Actions:** Approve · Reject (reason required) · Approve with change (qty).
- **Success:** status flows instantly to the rep's "My actions".

### SCR-12 Manager · Team scorecard
- **Per rep:** Healthy Sales Scorecard components (secondary vs target, sell-through health, OOS, execution) and a composite; visits done; actions completed; ₹ rescued. Synthetic baseline for the other reps; Kunal updates live.

### SCR-13 Manager · Outcomes
- Before/after (seed vs now): ₹ at risk, near-expiry %, OOS count, units rescued; **sustainability counters** (units saved from destruction; packaging kg avoided; reverse trips avoided) with an "illustrative factors" tooltip.

### SCR-14 Distributor view (optional, P1)
- **Godown ageing:** stock value by remaining-life bucket (> 12 m, 6–12, 3–6, < 3); SKU drill-down with batches (reveals S4).
- **Transfer tasks:** accept → picked → delivered (each updates both outlets' stock).
- **Suggested primary order:** requested vs suggested by SKU, with reasons.

### SCR-15 Method page
- The formulas from `08` with interactive mini-calculators, plus limitations. This is the "trust" page for judges.

---

## 6. Global rules
- **Currency:** ₹ with Indian grouping (₹14,700; ₹1.2 L; ₹3.4 Cr).
- **Dates:** "17 Jan 2027"; expiry captured as month/year (treated as the month's last day for "expiry", per the 2025 rule clarification [F] S25).
- **Accessibility:** contrast AA; tap targets ≥ 44 px; state is never shown by colour alone (icon + label).
- **Performance:** all calculations < 16 ms (in memory); first load < 2 s on 4G.
- **Responsiveness:** rep view designed at 390 px (phone frame on desktop); manager view ≥ 1024 px, usable on tablet.
- **Error boundary:** any crash shows "Something went wrong – Reset demo" (no blank screens during judging).
- **Analytics (optional):** Vercel Analytics page views only; no personal data.

## 7. Demo script (judge path, ~4 minutes)
1. Landing → **Sales Rep**. Today's beat: Shree Beauty at the top (🔴 ₹14.7k).
2. Outlet brief → Start visit → Smart Count: confirm 120, simulate scan of batch, tick "unopened cartons".
3. SKU detail: read "Why flagged". **Judge drags the expiry slider later by 5 months** → state turns 🟠, ₹ drops (the "catch it early" moment). Reset.
4. Recommendations: **Transfer 66 units to Glow Chemist** (which is about to run out). Accept → awaiting ASM approval.
5. Order guardrail: retailer requested 24 more shampoo → suggested 0 → final 0; add conditioner per suggestion.
6. Switch to **Manager**: approval queue → approve transfer; reject a discount on the Luxe EDP ("use sampling").
7. Back to Rep → "+14 days" → outcome: Shree ₹840 left; Glow Chemist healthy; ₹ rescued tile increments. Manager dashboard reflects it.
8. Optional: Distributor view reveals the S4 hidden batch.

## 8. Prioritised feature list

| Priority | Feature |
|---|---|
| **P0 (must for demo)** | Role picker · Today's beat · Outlet brief · Smart Count with validation · simulated scan · SKU detail with what-if sliders · rules engine + states · recommendations with accept/modify/reject · transfer matching · order guardrail · actions with statuses · manager overview + approval queue · "+14 days" outcome simulation · Reset · Method page · synthetic data banner · S1–S7 seeds |
| **P1** | Distributor view · team scorecard · outcomes/sustainability page · repeat-offender detection · visit summary share preview · Playwright smoke test |
| **P2** | Live sync across devices (KV) · real camera barcode via `BarcodeDetector` where supported · offline PWA install · Hindi/Marathi UI strings · CSV export for judges |
| **Out of scope** | Real integrations, auth, ML forecasting, image recognition, payments, retailer app |

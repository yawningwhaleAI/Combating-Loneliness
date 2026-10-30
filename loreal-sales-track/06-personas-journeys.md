# 06 · User Personas and Detailed User Journeys

> These personas are **hypothetical composites** built from industry-typical roles. They aren't interviews with L'Oréal staff. Validate them with 5–8 short interviews (field reps, ASMs, distributors, retailers) before finalising the deck. An interview guide is at the end of this file.

---

## Persona 1: Field Sales Representative (primary user)
**"Kunal", Territory Sales Officer, Consumer Products, Mumbai Western Suburbs** *(fictional)*
- Covers 2 distributors and ~180 GT, chemist and cosmetic outlets on a weekly or fortnightly beat; ~18–22 visits a day [A].
- Uses the company SFA on an Android phone. Patchy network inside shops. One hand often holding stock.
- **Goals:** hit the monthly secondary target; keep good relationships with retailers; avoid end-of-month firefighting.
- **Frustrations:** "When stock comes back as expiry, it's blamed on me months later." "I have no budget to fix slow stock except asking for a scheme." "I can't count every SKU in every shop."
- **What they need from SMARTSELL:** a list of the 5 things that matter in this shop, in under 30 seconds; actions they're *allowed* to take without calling the ASM; credit for rescued stock.
- **Design implications:** one-thumb use, large tap targets, offline-first, minimum typing (steppers, presets), ≤ 4 min of extra time.

## Persona 2: Area Sales Manager (secondary user)
**"Meera", ASM, Mumbai West (6 reps, 8 distributors)** *(fictional)*
- Reviews performance weekly, approves schemes and transfers, visits key outlets with reps.
- **Goals:** grow the area without return spikes; know which rep is building healthy business.
- **Frustrations:** returns arrive aggregated and late; can't tell loading from genuine growth; approval requests come by WhatsApp with no data.
- **Needs:** territory heat-map of ₹ at risk; an approval queue with the facts attached; rep execution scorecard; repeat-problem SKUs.

## Persona 3: Distributor (optional view, genuine value)
**"Haresh", owner of a mid-sized L'Oréal distributorship** *(fictional)*
- Holds ~3–5 weeks of stock [A]. Runs a DMS. Has 4 delivery vans. Cash flow is tight.
- **Goals:** ROI on inventory; fast claim settlement; not being loaded at quarter-end.
- **Needs:** a godown ageing view by remaining-shelf-life bucket, a list of transfer requests to execute, and suggested primary orders with reasons.
- **Why include this view:** distributors physically execute transfers and FEFO. A shared view creates accountability on both sides. **We keep it read-and-confirm only, so it doesn't depend on distributor data entry.**

## Persona 4: Retailer (not a user; a beneficiary)
**"Shree Beauty & Cosmetics", a cosmetics store in Andheri West** *(fictional)*
- Owner-operated; buys from 6–10 companies' distributors; no POS.
- **Needs:** cash not stuck in dead stock; fresh products; fewer return arguments.
- **We don't give the retailer an app.** The rep can show a one-screen visit summary ("₹4,200 of stock moved; 2 SKUs reordered").

---

## Journey A: Rep, a day on the beat (the demo's main path)

| Step | Screen | What the rep does | What the system does | Emotional goal |
|---|---|---|---|---|
| A1 | **Login / role select** | Picks "Sales Rep: Kunal" (demo) | Loads territory with synthetic data; shows a "SYNTHETIC DATA" banner | "This is quick" |
| A2 | **Today's beat** | Sees 8 planned outlets, each with a badge: 🔴 near-expiry, 🟠 slow/overstock, 🔵 stock-out risk, 🟢 healthy, plus the ₹ at stake per outlet | Ranks outlets by risk-weighted ₹ | "I know where to spend time" |
| A3 | **Outlet pre-visit brief** | Opens Shree Beauty: sees the top 5 flagged SKUs with reasons ("~36 units unlikely to sell before Jan 2027 buffer") | Expected stock = last count + deliveries − estimated sales | "I walk in prepared" |
| A4 | **Visit: Smart Count** | For each flagged SKU: enters count (stepper), selects batch / scans (simulated), confirms expiry month; ticks signals (dust, cartons…) | Live recalculation of state, ₹ at risk and days to act; confidence updates (scan > count > verbal) | "It reacts to what I see" |
| A5 | **SKU detail ("Why flagged")** | Taps a SKU: sees the plain-language explanation, the numbers, and an FEFO batch timeline | Shows the formula breakdown; "what if" sliders (qty, monthly sales, expiry) | "I can explain this to the retailer" |
| A6 | **Recommendations** | Sees 1–3 ranked actions with rationale, cost, approval need; **Accept / Modify / Reject (reason)** | Ladder filtered by state × window × brand tier × confidence; transfer matched to recipient outlet with capacity | "I'm allowed to fix this" |
| A7 | **Order guardrail** | Retailer asks for 24 of Shampoo X; app suggests 0 (stop) and +30 Face Wash Z (stock-out risk); rep adjusts | Suggested order = cover-based; reason shown; overrides logged with a reason | "I'm selling smart, not less" |
| A8 | **Assign & execute** | Assigns the transfer to the distributor; marks "rotate shelf" done; requests tester from the ASM | Creates action records with owners and due dates; above-threshold actions → ASM approval queue | "Clear who does what" |
| A9 | **Visit summary** | Sees ₹ at risk before/after, actions created, order placed | Updates territory totals | "Progress is visible" |
| A10 | **Follow-up visit (simulated "+14 days")** | Recounts; sees outcome: "Transfer completed, 30 units sold at recipient; risk ↓ ₹6.3k" | Stock-flow sell-out recalculated; action outcome = verified / partially / failed | "It worked, and I got credit" |

## Journey B: Manager, monitor and approve

| Step | Screen | Action | Outcome |
|---|---|---|---|
| B1 | **Territory overview** | Sees KPI tiles: ₹ at risk, near-expiry % of stock, OOS risk count, actions open / completed, ₹ rescued | Spots that Andheri cluster has 40% of risk |
| B2 | **Risk map / table** | Filters by distributor, rep, brand tier, state | Identifies a repeat SKU (hair colour shade) flagged in 6 outlets → "range issue" |
| B3 | **Approval queue** | Approves a transfer > ₹10k, rejects a discount request on a Luxe SKU ("use sampling") | Rep's action status updates instantly (same device or shared store) |
| B4 | **Rep scorecard** | Compares reps on the Healthy Sales Scorecard | Coaching conversation is data-based |
| B5 | **Outcomes** | Sees before/after for the pilot period vs control (synthetic) | Story for leadership: "₹ rescued, sales protected" |

## Journey C: Distributor (optional)
C1 Godown ageing (stock by remaining-life bucket) → C2 transfer tasks (accept, mark picked and delivered) → C3 suggested primary order vs requested, with reasons → C4 claims status (read-only, illustrative).

---

## Interview guide for validation (15 min each)
**Reps:** Walk me through your last visit. How do you decide order quantities? When did you last find expired stock, and what happened? What would you do if you saw 40 units of a slow SKU? What stops you? What's an acceptable extra time per visit?
**ASMs:** How do you find out about returns today? How are reps incentivised? What approvals do you give for schemes and transfers, and how?
**Distributors:** How much stock do you carry by SKU class? Do you track batches in your DMS? How long do expiry claims take to settle? Would you do outlet-to-outlet transfers? At what cost?
**Retailers:** Which products sit longest? How do you handle expiring stock? Would you let a rep check your back room if it freed up cash?

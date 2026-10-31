# 05 · Final Product Concept and Value Proposition

## 1. Concept in one line
**SMARTSELL: a field sales intelligence and inventory intervention system for L'Oréal's on-ground salesforce.** On every visit, the L'Oréal rep catches slow and ageing stock early, fixes it with the cheapest action that works, rebalances stock across the beat, and sizes orders to what will actually sell. Managers see the rupees rescued and the growth protected.

## 1b. Why SMARTSELL is the right answer (the pitch's five pillars)
1. **It directly addresses the case.** The brief asks for early detection and on-ground intervention. SMARTSELL does both on every visit, rather than offering a generic inventory dashboard.
2. **It empowers the existing salesforce.** L'Oréal already has people visiting distributors and retailers. No new team, no new distribution network: the reps already there become more effective.
3. **It balances growth and sustainability.** It recommends replenishment where demand is high and intervention where stock is ageing. This is exactly the tension in the case.
4. **It is measurable.** It shows reductions in inventory at risk of expiry, expired and damaged inventory, product returns and unnecessary replenishment, and improvements in retailer sell-through, product availability, salesperson productivity and revenue from recovered inventory.
5. **It is demonstrable.** A judge can use the prototype: select a retailer, inspect inventory, see a risk alert, execute an intervention, and watch the manager view and the outcomes update.

## 2. Value proposition by stakeholder

| For | Promise | Proof point in demo |
|---|---|---|
| **L'Oréal (management)** | Cut avoidable returns and expiry **without cutting growth**, and measure it | Manager view: ₹ at risk ↓, stock-outs ↓, secondary sales vs control |
| **Field rep** | "Know which 5 SKUs matter in this shop, what to do, and get credit for it" | Visit screen: prioritised list, one-tap actions, ₹ rescued counter |
| **Distributor** | Less cash stuck in slow stock, fewer disputed claims, smarter orders | Distributor view: ageing buckets, transfer requests, cover vs norm |
| **Retailer** | Shelf and cash working for them; fresh stock; fewer returns hassles | Retailer summary card left after the visit (optional) |
| **Planet** | Fewer finished products, packs and truck trips wasted | Units and packaging saved counter (illustrative factors) |

---

## 3. The operating model: the Sell-Through Visit

This answers case deliverable (a): **at which points during a visit can slow or ageing stock be spotted?**

| Visit stage | What the rep checks | Time | Detection point |
|---|---|---|---|
| **0. Pre-visit** (phone, before entering) | SMARTSELL shows the outlet's **flagged SKUs** from distributor invoices and the last count: "expected ~40 units of Shampoo X here; last delivery 4 months ago; batch B2405" | 30 s | Predicted risks from data |
| **1. Shelf walk** | Visual **signals** (below) on flagged SKUs plus anything obviously wrong | 60–90 s | Dust, faded packs, old price stickers, same facings as last visit |
| **2. Back room / godown** | Unopened outer cartons, **batch codes** of the oldest stock, damaged packs | 60 s | Hidden excess: the biggest blind spot |
| **3. Retailer conversation** | Three questions: "Which L'Oréal items are customers *not* asking for?", "Anything you'd like to return?", "What do customers ask for that you don't have?" | 60 s | Demand signals and early return intent |
| **4. Order moment** | **Order guardrail**: suggested quantity per SKU based on cover and expiry, vs what the retailer asks for | 30 s | Stops new excess being created |
| **5. Actions** | Do or agree the 1–2 recommended actions (rotate, re-place, transfer, sample, bundle) | 1–2 min | |
| **6. Day end** | Sync. Escalations go out automatically to the ASM and distributor. | auto | |

**Design target [A]:** ≤ 4 minutes added per visit, and only at outlets with flags. Outlets with no flags take no extra time.

**At the distributor (monthly, 30–45 min):** godown **ageing review** by remaining-shelf-life bucket (>12 months, 6–12, 3–6, <3), a FEFO compliance check, a primary-order guardrail, and a list of transfer candidates.

---

## 4. Simple signals and to whom they go

This answers case deliverable (a): **what simple signals should be flagged, and to whom?**

| # | Signal (observable, no tech needed) | What it usually means | Weight in risk |
|---|---|---|---|
| S1 | **Dust** on packs / faded packaging | Not moved in weeks | Raises the *slow* flag; lowers confidence in recorded velocity |
| S2 | **Unopened outer cartons** in the back room | Over-ordered (scheme or loading) | Raises the *excess* flag |
| S3 | **Same facings / same count as last visit** | Zero sell-out | Velocity ≈ 0 → *dormant* |
| S4 | **Old batch at front, newer at back** (or vice versa) | FEFO not followed | Action: rotate |
| S5 | **Old MRP sticker / old pack design** | Old stock, possible MT rejection | Raises the *ageing* flag |
| S6 | **Product not on shelf** (in godown, behind counter, bottom shelf) | Visibility issue | *Poor visibility* playbook |
| S7 | **No tester / damaged tester** (makeup, fragrance) | Weak conversion | *Demand* playbook |
| S8 | **Retailer says "customers don't ask for it"** | Assortment mismatch | *Range correction* |
| S9 | **Retailer asks to return** | Imminent return | Escalate before the claim happens |
| S10 | **Dented, leaking or heat-damaged packs** | Handling or storage issue | Damage log plus education |
| S11 | **Competitor running heavy scheme in this category** | Demand diverted | Context for the ASM |
| S12 | **Shopper asks for an out-of-stock item** | Lost sale | *Stock-out* playbook |

**Escalation matrix: who receives which flag**

| Situation | Rep handles alone | Distributor | ASM (approve) | Brand / trade marketing | Supply chain / demand planning |
|---|---|---|---|---|---|
| Rotation, re-facing, moving to eye level | ✅ | | | | |
| Stop/reduce replenishment of a SKU at outlet | ✅ | informed | | | |
| Transfer between outlets within distributor | proposes | ✅ executes | ✅ if > ₹10k [A] | | |
| Transfer across distributors | proposes | ✅ | ✅ | | informed |
| Sampling / tester deployment | requests | | ✅ (budget) | ✅ (stock of samples) | |
| Approved bundle / scheme | proposes | | ✅ | ✅ owns catalogue | |
| Controlled liquidation / donation | — | | ✅ + RSM | ✅ | ✅ |
| Same SKU flagged in > 20% of outlets in a territory | auto | | ✅ | ✅ (range/pack issue) | ✅ (feed Demand Sensing) |
| Repeated damage at a distributor | logs | ✅ | ✅ | | ✅ (logistics) |
| Data anomaly (count vs invoices) | logs | ✅ explains | ✅ | | |

---

## 5. The four modules, as capabilities of the routine

| Module | User-facing job | Key functions |
|---|---|---|
| **A. Stock Intelligence ("See")** | Know what's in the shop and how old it is | Pre-visit expected stock from DMS; **Smart Count** (only flagged SKUs); batch/expiry capture (manual entry or simulated scan); signals checklist; **stock-flow sell-out estimate**; data confidence |
| **B. Risk Engine ("Prioritise")** | Know which 5 things matter, and why | Transparent rules: days of cover, FEFO projected waste, action window, stock-out risk, ageing, trend. Output: **state + ₹ at stake + days to act + reason in plain words** (see `08`) |
| **C. Action Engine ("Act")** | Know what to do, and do it | **Intervention ladder** filtered by state × action window × brand tier × confidence; **transfer matching** across outlets; **order guardrail**; accept / modify / reject with reason; assign to rep/distributor/ASM; status tracking |
| **D. Manager Intelligence ("Learn")** | Know where the risk is and who's executing | Territory ₹ at risk, near-expiry %, OOS %, completion rate, **₹ rescued**, approvals queue, repeat-offender SKUs and outlets, rep **Healthy Sales Scorecard** |

---

## 6. The intervention ladder (cheapest and least brand-risky first)

| Level | Action | Typical cost | Brand risk | Who approves |
|---|---|---|---|---|
| L0 | **Verify** (recount, read batch, photo) | Rep time | None | Rep |
| L1 | **Rotate & re-place** (FEFO, front-face, eye level, near billing counter) | ~₹0 | None | Rep |
| L2 | **Order guardrail** (pause or cap replenishment of *this* SKU at *this* node; keep range) | ₹0 (protects cash) | Low (watch OOS) | Rep |
| L3 | **Rebalance** (transfer to a higher-velocity authorised outlet via distributor) | Logistics ₹ (assume ~2–4% of value [A]) | None | Distributor; ASM above threshold |
| L4 | **Activate demand** (tester, sampling sachets, beauty-advisor day, retailer staff briefing, counter display) | Sampling/visibility budget | Positive | ASM |
| L5 | **Approved bundle** (e.g. shampoo + conditioner pack from brand catalogue) | Bundle cost/scheme | Low–medium | ASM + brand catalogue |
| L6 | **Targeted, time-boxed promotion** (approved scheme, mass brands only) | Trade spend | **Medium–high** | ASM, RSM above threshold |
| L7 | **Controlled end-of-life** (pre-expiry: employee/outlet sale, approved off-price partner, **donation** with compliance) | Margin loss | Medium (controlled) | RSM + brand |
| L8 | **Return / recycle** (documented, root-cause coded) | Full loss + ~handling | — | Per return policy |

**Brand-tier guardrails [R]:**
- **Luxe & Dermatological Beauty:** L0–L5 only. No price promotions (L6). L7 only via L'Oréal-controlled routes.
- **Professional (salon):** L0–L5. Salon-to-salon rebalancing via distributor. Education-led activation (stylist training).
- **Consumer Products (mass):** full ladder, but L6 only from the approved scheme catalogue, time-boxed, with ASM approval.
- **Never:** liquidation to unauthorised resellers or grey channels; deep discounts that undercut q-comm/MT price parity (channel-conflict risk, S21).

**Action window → which levels are available** (logic in `08`):

| Days left to act* | Available levels | Logic |
|---|---|---|
| > 120 days | L0–L5 (L6 discouraged) | Time to diagnose and fix demand. Discounting is wasteful. |
| 60–120 days | L0–L6 | Rebalancing is the hero action. Bundle if needed. |
| 30–60 days | L1, L3 (to the fastest outlets only), L5, L6, L7 | Speed over elegance |
| < 30 days | L7, L8 | Recover value, document root cause |

*Days left to act = days until the at-risk batch reaches its minimum sellable shelf life (see `08`).

---

## 7. The five playbooks

### P1. Near-expiry inventory (state `NEAR_EXPIRY`: projected unsold units, action window ≤ 90 days)
- **Goal:** recover value *fast*. Prevent destruction.
- **Sequence:** L0 verify batch → L1 move to front → **L2 stop replenishment of this SKU here** → **L3 transfer projected-unsold units to highest-velocity outlets** (recipients ranked by spare sell-through capacity within the window) → L5 approved bundle for the remainder → L7 controlled end-of-life if window < 30 days.
- **When it's appropriate:** the stock is genuinely sellable but at the wrong outlet, or there's too much of it.
- **Costs:** transfer logistics; bundle or scheme cost; L7 margin.
- **Risks:** pushing near-expiry stock onto recipient retailers who then return it (**only transfer what the recipient can sell before the buffer**); consumer complaints about short-dated stock; channel conflict if dumped online.
- **Benefit:** units sold at full or near-full price instead of returned (avoids credit note plus ~handling cost).

### P2. Slow-moving with healthy shelf life (state `OVERSTOCK` or `AGEING_RISK` with window > 120 days)
- **Goal:** **diagnose, then fix demand or range.** Don't discount.
- **Diagnosis prompts** (rep picks the reason code): wrong outlet profile (premium SKU in value outlet) · poor placement · no tester or awareness · price gap vs competitor · shade/variant mismatch · seasonality · new launch not yet adopted.
- **Sequence:** L1 visibility fix → L4 tester/sampling/staff briefing → **L2 cap replenishment** → range correction (replace with a better-fit SKU in future orders) → L3 rebalance if no improvement by next visit.
- **Costs:** mostly time; sampling budget.
- **Risks:** acting on a wrong diagnosis. Mitigation: re-measure velocity at the next 2 visits (closed loop).
- **Benefit:** restores velocity without margin loss; better assortment-to-outlet fit.

### P3. Overstocked distributor or retailer (cover > 2× norm across many SKUs)
- **Goal:** bring cover back to norm **without a revenue cliff** (the Dabur lesson, S19).
- **Sequence:** SKU-level cover review → **order guardrail on over-covered SKUs only**, keep ordering fast SKUs → shift primary mix toward SKUs with gaps elsewhere → rebalance to outlets with low cover → reset distributor norms by SKU class (fast 14–21 days; slow/long-tail 30–45 days [A]).
- **Risks:** a temporary dip in primary sales on over-covered SKUs. **Make this visible to management as "healthy correction", not under-performance.**
- **Benefit:** distributor ROI and goodwill; fewer future returns.

### P4. Stock-out risk on high-demand SKU (state `STOCKOUT_RISK`)
- **Goal:** protect sales.
- **Sequence:** **source from surplus first** (transfer from an overstocked outlet on the beat or the distributor) → suggested replenishment = velocity × (target cover + lead time) − stock on hand → raise the beat frequency or order cadence for this outlet-SKU → flag to demand planning if repeated.
- **Risks:** over-correcting into excess. Mitigation: cap at target cover.
- **Benefit:** incremental sell-out; consumer loyalty.

### P5. Poor visibility or weak consumer demand (signals S6, S7, S8; low velocity in an outlet where peers sell well)
- **Goal:** fix the shelf before blaming the product.
- **Sequence:** benchmark against peer outlets ("Shampoo X sells 3× more in similar chemists") → L1 placement and facings → L4 tester, display or beauty-advisor day → retailer education (benefit story, regimen cross-sell) → if still weak after 2 visits: range correction.
- **Benefit:** velocity uplift; better data on true demand vs execution failure.

### Near-expiry vs slow-moving: what's different (the case question, directly)

| Dimension | Slow-moving (healthy shelf life) | Near-expiry |
|---|---|---|
| Core question | *Why isn't it selling?* | *Where can it sell before it's too late?* |
| Time horizon | Weeks to months; fix the cause | Days to weeks; recover value |
| First action | Diagnose → visibility / sampling / range fix | Verify batch → stop feeding → transfer to fastest outlets |
| Discounting | Avoid (masks cause, trains consumers) | Allowed late, approved, mass brands only |
| Transfer rule | Optional, if diagnosis says wrong outlet | Primary lever, capped at the recipient's sell-through capacity |
| Success metric | Velocity uplift at the same outlet | Units recovered before buffer date; ₹ not returned |
| Escalation | ASM at the next review | ASM same day if > threshold |

---

## 8. The Healthy Sales Scorecard (incentive design)

This answers "why would reps behave differently?" **Without it, the tool fails** (adoption risk #3).

| Component | Weight [A] | Why |
|---|---|---|
| Secondary sales vs target | 50% | Growth stays the primary goal |
| **Sell-through health**: territory ₹ at risk trend + near-expiry % | 20% | Rewards preventing waste |
| **Availability**: OOS rate on must-stock SKUs | 15% | Prevents the "cut orders" response |
| **Execution**: recommended actions completed / verified | 15% | Rewards using the playbook |
| **Return attribution** (management policy) | Modifier | Returns charged back to the territory and month that created the load |

Pilot this as a **shadow scorecard** first (visible, not paid), then make it paid in the rollout.

---

## 8b. Quick commerce: our approach (built into the prototype)

Quick commerce isn't on a rep's beat, since dark stores are managed centrally by key-account teams. But it is a major cause of general-trade waste: when demand moves online, general-trade distributors keep receiving old volumes (NielsenIQ: e-com ≈18% of FMCG in the top-8 metros, over three-quarters of it quick commerce; Dabur's 2024 correction). SMARTSELL handles it in four steps:

| Step | What happens | In the prototype |
|---|---|---|
| **Detect** | Outlet sell-out fell 20%+ over 3 months while the brand's online sales in the city grew 20%+, or the rep ticks "Shoppers say they buy it on quick commerce" | "⇄ Shifting to quick commerce" badge; chip with the outlet trend vs online growth |
| **Resize** | The order guardrail uses a 21-day cover norm instead of 30, so general trade stops being stocked at old volumes | Suggested order drops (e.g. the retailer asks for 12, guardrail suggests 0) |
| **Hand off** | The rep sends a channel-shift flag to the quick-commerce KAM and demand planning: move allocation online | "Hand off to the quick-commerce key-account team" recommendation (owner: Q-comm KAM) |
| **Route** | Fresh stock follows demand online; ageing stock is rebalanced within general trade and **never dumped on quick commerce at a discount** (platforms apply shelf-life acceptance norms, and the distributors' federation AICPDF has objected publicly) | Guardrail text on scheme and end-of-life actions; manager "Quick commerce: channel shift" card with ₹ of general-trade loading avoided |

City online-growth figures in the prototype are synthetic; a pilot would take them from L'Oréal's quick-commerce account data.

## 9. What we deliberately don't build (avoiding unnecessary AI)
- No black-box "AI risk score". Every number is traceable to inputs.
- No computer vision in the MVP (phase 3 option for reading batch codes).
- No auto-ordering. The rep stays accountable.
- No retailer-facing app as a dependency (the Shikhar dormancy lesson).
- No price-optimisation engine.

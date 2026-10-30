# 00 · Executive Summary and Recommendation

**L'Oréal Sustainability Challenge 2026, Sales Track: "Selling Smarter"**
Prepared 30 Oct 2026. Status: **research and design complete, awaiting approval before prototype build.**

---

## 1. The problem in simple terms

L'Oréal sells products to distributors and shops (**sell-in**), but only earns its money when a consumer buys them (**sell-out**). When the two drift apart, stock sits on shelves and in back rooms, ages, gets damaged or expires, and comes back. In the case's numbers that costs **~1.5% of revenue in lost stock plus ~1% to handle and destroy it** [F] S1. Illustratively, that's about **₹148 cr a year** at L'Oréal India's scale (FY25 net sales ~₹5,925 cr [F] S3), assuming the case percentages apply.

Management wants to **keep growing** and cut this waste, **without simply ordering less**. Ordering less empties shelves: shoppers switch brands, and the revenue is lost. Dabur's 2024 distributor-stock correction is a public example of what the blunt fix costs [F] S19.

**Root insight:** *waste is decided when the order is taken and discovered when the return arrives.* Between those two moments the rep visits the shop many times. Today nothing in the visit asks them to look, tells them what they may do, or rewards them for doing it.

## 2. Verdict: **MODIFY**, then GO

| Question | Answer |
|---|---|
| Is SMARTSELL solving a real problem? | **Yes.** It addresses a material, measurable cost pool directly. |
| Is the original framing right? | **No.** An "AI-powered platform" pitch misses the brief. The case asks for an *on-ground sales strategy* with *simple signals* and *specific actions* [F] S1. |
| Is AI necessary? | **No, not for the core.** Transparent rules do the job. ML is a later-phase add-on. |
| Recommended approach | **Hybrid** (weighted score 4.70 vs 3.05 tech-led and 3.15 process-led; see `04`): a field operating model plus a light companion tool |

**Refined concept: SMARTSELL, "Sell-Through Selling."** It's a visit routine plus a pocket companion. With it, every L'Oréal rep:
1. **Sees** the 5–10 SKUs that matter in this shop before walking in. Distributor invoices and the last count supply these.
2. **Checks** them in under 4 minutes (Smart Count, batch date, 12 simple signals).
3. **Gets** a clear "₹ at risk + days left to act + why" for each, with no black-box score.
4. **Acts** with the cheapest sanctioned step from an 8-level ladder: rotate, re-place, stop feeding, **transfer to an outlet that will sell it**, sample, bundle; discount only as a guarded last resort.
5. **Orders smart**: a guardrail suggests the quantity from cover and expiry, not "same as last time".
6. **Is rewarded** through a Healthy Sales Scorecard: growth still 50%, plus sell-through health, availability and execution.

Managers see rupees at risk, rupees rescued and stock-outs avoided by territory and rep, plus an approval queue.

## 3. What we answer for each case deliverable

| Case asks | Our answer | Where |
|---|---|---|
| Where during a visit can slow stock be spotted? | **6 visit moments**: pre-visit brief, shelf walk, back room, retailer conversation, order moment, day-end sync; plus a monthly distributor ageing review | `05` §3 |
| Which simple signals, flagged to whom? | **12 signals** (dust, unopened cartons, unchanged count, old MRP…) + an **escalation matrix** (rep / distributor / ASM / brand / supply chain) | `05` §4 |
| Specific on-ground actions to move slow SKUs | **8-step ladder** + **5 playbooks**, with brand-tier guardrails | `05` §6–7 |
| Near-expiry vs slow-moving: what's different? | **Near-expiry needs speed** (stop feeding, transfer to the fastest outlets, bundle, controlled end-of-life). **Slow-moving needs diagnosis** (visibility, sampling, range fix; no discount). | `05` §7 table |

## 4. Business case (illustrative, see `09`)

| | Conservative | **Base** | Optimistic |
|---|---|---|---|
| Addressable share of waste pool | 25% | **36%** | 46% |
| Net benefit / year (steady state) | ₹7.3 cr | **₹18.2 cr** | ₹32.8 cr |
| 3-year ROI | ~1% | **~204%** | ~584% |
| Units saved from waste / year (illustrative) | ~1.3 L | **~3.2 L** | ~5.6 L |

The conservative case only breaks even. That's why we propose a **16-week test-vs-control pilot** (2 cities, ~12 reps, ~600 outlets, 40 SKUs, ~₹50 lakh) with explicit scale and kill criteria (`10`).

## 5. The five biggest risks and how we address them

| # | Risk | Mitigation |
|---|---|---|
| 1 | **Misreading the brief:** judges see a tech demo, not a sales strategy | Lead with the operating model; answer the 4 case questions on dedicated slides (6, 7, 8); position the tool as enabler; "AI" never in a title |
| 2 | **Credibility of numbers:** inflated or invented impact | Use only the case's % as sourced inputs; a fact/assumption legend on every slide; 3 scenarios with an honest conservative case; a pilot with kill criteria; verify all sources before the deck (WebFetch was blocked in this research session; see `sources.md`) |
| 3 | **Rep adoption:** extra time, "another app", incentive conflict | Smart Count only on flagged SKUs (≤ 4 min, kill criterion); embed in the existing SFA; Healthy Sales Scorecard; credit for ₹ rescued |
| 4 | **Data quality:** no POS in GT, missing batches, stale counts | Stock-flow sell-out; confidence levels; "verify first" locks costly actions; DMS as the base layer; random audits |
| 5 | **Unintended consequences:** discount addiction, brand dilution, channel conflict, OOS from under-ordering | Ladder with discount as level 6/8; no discounts for Luxe or Derma; transfers only within the authorised network; transfer capped at recipient capacity; SKU-level (not blanket) guardrails; a growth-guardrail KPI vs control |
| (+) | **Live-demo failure** | Client-side app, no network dependency, seeded data, a "Reset demo" button, a recorded backup video |

## 6. Exactly what to build for the judge demo (P0)
1. Role picker (Rep / Manager / Distributor) + SYNTHETIC DATA banner + Reset
2. Rep **Today's beat**, ranked by ₹ at risk
3. **Outlet brief** with the top flagged SKUs and reasons
4. **Smart Count**: count stepper, batches, simulated scan, 12 signals, validation
5. **SKU "Why flagged"** with **what-if sliders** (quantity, monthly sales, expiry, value) recalculating live
6. **Rules engine**: states, ₹ at risk, action window, confidence, priority (unit-tested against `08`)
7. **Recommendations** with Accept / Modify / Reject (reason) and brand-tier guardrails
8. **Transfer matching**: the hero S1 → S3a rebalance
9. **Order guardrail**: requested vs suggested, override reason
10. **Actions** with statuses and assignment; **"+14 days"** outcome simulation
11. **Manager** overview KPIs, risk table, **approval queue** (incl. the Luxe discount rejection)
12. **Method page** explaining the formulas

P1: distributor view, team scorecard, outcomes/sustainability page. P2: multi-device live sync, real camera scan, PWA offline.

## 7. Implementation roadmap (after approval)

| Step | Scope | Est. effort |
|---|---|---|
| 1 | Scaffold Next.js + Tailwind + shadcn; seed synthetic data (`07` §4) | 0.5 day |
| 2 | Port the risk engine to TS + Vitest tests matching `08` §6 | 0.5 day |
| 3 | Rep flow: beat → brief → Smart Count → SKU detail with sliders | 1.5 days |
| 4 | Recommendations, transfer matching, order guardrail, actions | 1.5 days |
| 5 | Manager overview + approvals; "+14 days" simulation | 1 day |
| 6 | Method page, polish, empty/error states, responsive QA, Playwright smoke | 1 day |
| 7 | P1 extras (distributor view, scorecard, outcomes) | 1 day |
| 8 | Vercel deploy, demo rehearsal, backup video | 0.5 day |

## 8. Presentation narrative (12 slides + live demo; see `11`)
Problem → why the blunt fix fails → root insight → Sell-Through Selling → *where* to detect → *which signals, to whom* → *near-expiry vs slow* → transparent ₹-at-risk method → **live demo** → one transfer fixes two problems → honest business case → pilot that proves or kills it.

## 9. Before the deck: verification to-do
- Re-open every source marked "Verify before deck" in `sources.md` (search-summary based in this session).
- Verify the OOS research figures (S29) or drop them.
- Run 5–8 validation interviews (guide in `06`). Even 3 retailer and 2 rep conversations strengthen the pitch.
- Check the competition rules on using real L'Oréal brand names in the prototype (default: fictional brands).

---

### ✅ Decision needed from you
1. Approve the **MODIFY** direction (operating model first, tool as enabler)?
2. Approve the **P0 feature list** and stack (Next.js + TS + Tailwind + shadcn + Zustand, client-side, Vercel)?
3. Fictional brands (default) or real L'Oréal brand names in the prototype?
4. Any confirmed presentation time limit or format (affects slide count)?

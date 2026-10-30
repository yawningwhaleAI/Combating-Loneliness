# 08 · SKU-Level Risk Scoring Methodology (transparent, rules-based)

**Design principle:** no black-box score. Every flag answers three questions in plain words:
1. **How many units will probably not sell in time?** (projected unsold units)
2. **What is that worth?** (₹ at stake)
3. **How long do we have to act?** (action window, in days)

A reference implementation is in `model/risk_engine_reference.py`. All worked examples below come from it. The prototype will run the same logic in TypeScript.

---

## 1. Inputs (per SKU × node, where a node is a retailer or distributor)

| Input | Symbol | Source | Default if missing |
|---|---|---|---|
| Stock on hand by batch | Qᵢ | Smart Count / DMS | Expected stock (last count + deliveries − est. sales), low confidence |
| Days to expiry by batch | Eᵢ | Batch code on pack (mandatory label [F] S25) | **Unknown**. Flag "capture batch"; never assumed safe. |
| Monthly sales (sell-out velocity) | M → v = M/30 per day | Stock-flow between visits (retailer) or secondary invoices (distributor) | Outlet-cluster average, low confidence |
| Trend | T = v_recent(4 wk) / v_prior(8 wk) | History | 1.0 |
| Unit value | P | PTR (retailer) / distributor landing price | SKU list price × trade margin |
| Data source and age | — | Scan, DMS, manual count, verbal, estimate; days since count | — |
| Node parameters | MSB, target cover, lead, safety | Configuration (assumptions below) | — |

**Stock-flow sell-out (how we get retailer sales without POS):**
`Sales between visits = Opening count + Deliveries (from DMS invoices) − Closing count`
`v = Sales ÷ days between counts`. A negative result is flagged as a **data anomaly** (unrecorded purchase, transfer or count error).

## 2. Configurable parameters (all ASSUMPTIONS to calibrate with L'Oréal in the pilot)

| Parameter | Retailer | Distributor | Rationale |
|---|---|---|---|
| **MSB: minimum sellable buffer** (days before expiry when stock effectively can't be sold or accepted) | 30 | 120 | Retailers and consumers avoid packs about to expire. A distributor's stock still has to travel to a retailer and sell there. Analogy: FSSAI's ≥30% or 45-day rule for food on q-comm [F] S24 (food only). |
| Target days of cover | 30 | 21 | Distributor norm in line with Dabur's corrected ~19–21 days [F] S19. Beauty long-tail may justify 30–45 (configurable by SKU class). |
| Lead time (days) | 7 (weekly beat) | 7 | Replenishment cycle |
| Safety days | 7 | 5 | Demand variability buffer |
| Overstock multiple | 2× target | 2× target | Cover above 60 days (retailer) or 42 days (distributor) |
| Near-expiry window | ≤ 90 days to act | ≤ 90 days | Matches the point where "diagnose and fix demand" options stop being realistic |

## 3. Calculations

**3.1 Days of cover:** `DOC = ΣQᵢ ÷ v`

**3.2 FEFO projected unsold units (the core):** batches are sold oldest first. Each batch can sell only until `Wᵢ = Eᵢ − MSB` (its *sellable window*).

```
t = 0                                  # days of selling already used by earlier batches
for batch i in order of expiry:
    sellable_i = max(0, v × (Wᵢ − t))
    sold_i     = min(Qᵢ, sellable_i)
    unsold_i   = Qᵢ − sold_i
    if unsold_i > 0:  t = max(t, Wᵢ)   # time runs out on this batch
    else:             t = t + sold_i / v
Projected unsold units U = Σ unsold_i
Value at risk = U × P
Action window = Wᵢ of the first batch with unsold_i > 0
```

**3.3 Stock-out risk:** `Reorder point ROP = lead + safety` (in days of cover). Flag if `DOC ≤ ROP` and v > 0.
Lost units next cycle: `L = v × max(0, ROP − DOC)`. ₹ at stake = L × P.

**3.4 Suggested order (order guardrail):**
- If U > 0, suggest **0** for this SKU at this node (don't feed an at-risk SKU).
- Else: `Order = ceil( v × (target cover + lead) − ΣQ − in-transit )`, rounded to case pack, floor 0.

**3.5 Data confidence:** `C = source weight × recency factor`
- Source weight: scan or DMS 1.0 · manual count 0.85 · retailer verbal 0.5 · estimate 0.4
- Recency: count ≤ 7 days old 1.0 · ≤ 30 days 0.8 · > 30 days 0.5
- Bands: **High ≥ 0.8**, **Medium 0.5–0.8**, **Low < 0.5**. On Low, the first recommended action is always **L0 Verify**, and costly actions (L3+) are locked until verified.

**3.6 Primary state (first match wins):**

| Order | State | Rule | Colour |
|---|---|---|---|
| 1 | `NEAR_EXPIRY` | U > 0 and action window ≤ 90 days | 🔴 |
| 2 | `AGEING_RISK` | U > 0 and action window > 90 days | 🟠 |
| 3 | `STOCKOUT_RISK` | v > 0 and DOC ≤ ROP | 🔵 |
| 4 | `DORMANT` | v = 0 and stock > 0 | ⚫ |
| 5 | `OVERSTOCK` | DOC > overstock multiple × target cover | 🟡 |
| 6 | `HEALTHY` | otherwise | 🟢 |

Secondary flags shown as chips: falling trend (T < 0.7), rising trend (T > 1.3), signals ticked (dust, cartons…), data anomaly, low confidence.

**3.7 Priority (for ranking SKUs within a visit and outlets within a beat):**
`Priority ₹ = ₹ at stake × Urgency × (0.5 + 0.5 × C)`
- Urgency (expiry states) by action window: ≤ 30 days → 1.0 · ≤ 60 → 0.8 · ≤ 90 → 0.6 · ≤ 180 → 0.4 · > 180 → 0.2
- Urgency (stock-out) = 1.0. Overstock, dormant and healthy = 0.2 × a working-capital proxy (shown but ranked low).
- Why multiply by confidence: uncertain risks are ranked slightly lower but **never hidden**. At C = 0 the weight is still 0.5.

**3.8 Signals adjust, they don't override.** Ticking "dust" or "same as last visit" lowers the velocity estimate (v × 0.7 [A]) and confidence in recorded sales. "Unopened cartons" raises the overstock flag. A signal alone can't create `NEAR_EXPIRY`; only batch data can.

## 4. Transfer matching (rebalancing)

For an at-risk batch at a donor outlet, candidate recipients are **authorised outlets of the same distributor** (cross-distributor needs ASM approval) carrying the same SKU.

```
recipient window  Wr = Eᵢ − MSB_retailer − transit_days (default 3)
recipient capacity Kr = max(0, v_r × Wr − Q_r(same or older batches))
transfer qty     = min(U_donor, Kr), rounded down to case pack
rank recipients: STOCKOUT_RISK first → highest capacity → same beat → shortest distance
```
**The rule that prevents pushing waste downstream:** we never transfer more than the recipient can sell before *its* buffer date.

## 5. Recommendation rules (state × window × tier × confidence → ranked actions)

| State | Window | Brand tier | Ranked actions (ladder levels, see `05`) |
|---|---|---|---|
| Any | Any | Any | If C is Low → **L0 Verify** first; L3+ locked |
| NEAR_EXPIRY | ≤ 30 | Mass | L7 controlled end-of-life · L5 bundle · L8 return (documented) |
| NEAR_EXPIRY | ≤ 30 | Luxe/Derma/Pro | L7 via L'Oréal route · L8 |
| NEAR_EXPIRY | 31–90 | Any | L2 stop feeding · **L3 transfer (matched qty)** · L1 front-face · L5 bundle (mass/pro) · L6 promo (mass only, ASM) |
| AGEING_RISK | > 90 | Any | L2 cap · L1 visibility · L4 sampling/tester · L3 transfer surplus · range review |
| OVERSTOCK | — | Any | Diagnose (reason code) · L1 · L4 · L2 cap · L3 if no change in 2 visits |
| DORMANT | — | Any | L0 verify · diagnose · L1/L4 · range correction |
| STOCKOUT_RISK | — | Any | **Source from surplus outlet first (L3 inbound)** · suggested replenishment · raise frequency |

Each recommendation shows: *why* (one sentence with numbers), *expected effect* (units and ₹), *cost*, *approval needed*, and *owner*.

## 6. Worked examples (output of `model/risk_engine_reference.py`)

| # | Situation | Inputs | Result |
|---|---|---|---|
| A | **Near-expiry excess** at an Andheri retailer | 180 units · 25/month · expiry 45 days · ₹210/unit | Window 15 days → sells ~12.5 → **167.5 units unsold, ₹35,175 at risk**, `NEAR_EXPIRY` (critical). Order guardrail: 0. |
| A-early | **Same stock caught 150 days earlier** | 180 units · 25/month · expiry 195 days | Window 165 days → sells ~137.5 → **42.5 units unsold, ₹8,925 at risk**, `AGEING_RISK`. All options open: transferring ~45 units to a faster outlet removes the risk at ~₹0 margin cost. |
| B | **Slow-moving, healthy shelf life** at a Bandra retailer | 80 units · 15/month · expiry 240 days | Will sell through before the buffer (no unsold units), but **160 days of cover** → `OVERSTOCK`. Action: diagnose, visibility, cap replenishment. **No discount.** |
| C | **High-demand stock-out risk** at a Powai chemist | 20 units · 60/month · expiry 300 days | **10 days of cover < 14-day reorder point** → `STOCKOUT_RISK`. ~8 units of lost sales next cycle. **Suggested order 54.** Source from case B/A surplus first if the SKU matches. |
| D | **Distributor, two batches** | 900 units expiring in 200 days + 1,200 in 520 days · 300/month | Older batch window 80 days → sells 800 → **100 units unsold, ₹26,000**, `NEAR_EXPIRY` while the newer batch is healthy. **Totals alone would hide this** (210 days of cover looks like "just overstock"). |
| E | **Low-confidence data** at a kirana | 24 units (retailer's verbal estimate; count 40 days old) · 3/month | Confidence 0.25 (Low) → first action **"Verify count & batch"**. Transfers locked until verified. |

**The demo moment:** example A vs A-early. *"Same shelf, same product. Spotted 5 months earlier, the problem is a quarter of the size and costs nothing to fix. That's what early detection buys you."*

## 7. Assumptions and limitations (say these out loud; judges will respect it)
1. **Velocity is assumed constant over the window.** Seasonality and launches break this. Mitigation: trend factor; in phase 3, ML forecasts for sparse SKUs.
2. **Stock-flow sell-out is noisy** (shrinkage, unrecorded inflows). Mitigation: anomaly flags, confidence, rolling averages over 2–3 visits.
3. **MSB values are assumptions.** The real number depends on L'Oréal's return terms, MT acceptance norms and consumer behaviour. Calibrate in the pilot.
4. **Partial counting** (flagged SKUs only) can miss unflagged problems. Mitigation: a monthly full shelf walk at top outlets; distributor-side ageing review.
5. **₹ at stake uses trade price**, not full P&L impact (handling cost of ~1% of revenue is in addition). See `09`.
6. **Thresholds are uniform in the MVP.** Production should vary them by SKU class (fast/slow, mass/luxe, seasonal).
7. **The engine recommends; humans decide.** Reason codes on reject or modify become learning data.

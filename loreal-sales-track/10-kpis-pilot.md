# 10 · KPI Framework and Pilot Plan

## 1. KPI tree

```
NORTH STAR:  ₹ of channel stock at risk of waste (↓)  while  secondary sales growth ≥ control (guardrail)
   ├── Waste outcomes (lagging):   expiry & return rate · ₹ returned · units destroyed
   ├── Waste leading indicators:   ₹ at risk · near-expiry % of stock · days of cover vs norm · ageing buckets
   ├── Growth & availability:      stock-out rate on must-stock SKUs · sell-through rate · incremental revenue & GM
   └── Execution (behaviour):      Smart Count completion · intervention completion · ₹ rescued (verified) · override rate
```

## 2. KPI definitions

| KPI | Formula | Level | Frequency | Pilot target (vs control) [A] |
|---|---|---|---|---|
| **At-risk inventory value** | Σ projected unsold units × unit value (see `08`) | Outlet → territory | Weekly | **−25%** |
| **Near-expiry % of inventory** | Value of stock in `NEAR_EXPIRY` ÷ total stock value | Distributor, outlet | Weekly | **−20%** |
| **Sell-through rate** | Units sold in period ÷ (opening stock + receipts) | Outlet × SKU | Per visit cycle | **+10%** on flagged SKUs |
| **Days of inventory / stock cover** | Stock ÷ daily velocity | Distributor, outlet | Weekly | Distributor within norm ±20% on 80% of SKUs |
| **Expiry & return rate** | ₹ returned (expired + damaged) ÷ ₹ secondary sales | Distributor | Monthly (lagging; follow-up at +6 months) | **−15%** at 6-month follow-up |
| **Stock-out rate** | Must-stock SKU-outlet combinations with zero stock at visit ÷ all checked | Outlet | Per visit | **−20%** |
| **Inventory transferred / recovered** | Units and ₹ moved via L3 transfers and sold before the buffer date | Territory | Weekly | Track (no target; learning) |
| **Intervention completion rate** | Actions done ÷ actions accepted (within due date) | Rep | Weekly | **≥ 70%** |
| **Recommendation acceptance rate** | Accepted or modified ÷ shown | Rep | Weekly | 50–80% (too high = rubber-stamping; too low = bad rules) |
| **₹ rescued (verified)** | ₹ at risk removed by completed actions, confirmed by recount | Rep → territory | Weekly | Track |
| **Incremental revenue & gross margin** | (Pilot secondary growth − control growth) × base; × margin | Territory | Monthly | **≥ 0** (guardrail), ideally positive |
| **Salesperson productivity** | ₹ rescued + ₹ new risk avoided + incremental secondary sales, per rep-hour in the field | Rep | Weekly | Track vs control |
| **Revenue from recovered inventory** | Value of at-risk stock sold through transfers, bundles or activation instead of being returned | Territory | Weekly | Track |
| **Unnecessary replenishment avoided** | ₹ of order quantity requested on at-risk/overstocked SKUs that the guardrail removed | Rep → territory | Weekly | Track |
| **Visit time added** | Visit duration with SMARTSELL − baseline | Rep | Weekly | **≤ 4 min** on flagged outlets |
| **Data confidence** | % of flagged positions with High confidence | Territory | Weekly | ≥ 70% by week 6 |

## 3. Pilot design

| Element | Proposal [A] (to agree with L'Oréal) |
|---|---|
| **Geography** | **Mumbai** (metro, with q-comm channel shift) + **one tier-2 city, e.g. Nagpur or Indore** (GT-heavy) |
| **Design** | Matched **test vs control** territories (similar revenue, outlet mix, growth history) |
| **Distributors** | 4 test (2 per city) + 4 control |
| **Outlets** | ~600 test outlets (GT cosmetic stores, chemists, kiranas with beauty, salons) |
| **Reps** | ~12 test reps + their ASMs |
| **SKUs** | **40 focus SKUs**: top 20 by historical return or expiry value + top 20 by velocity (for OOS). Across Consumer Products, Professional Products and Dermatological Beauty. |
| **Duration** | **16 weeks**: 2 weeks baseline (counts, batch capture) → 12 weeks live → 2 weeks evaluation. Plus **returns follow-up at +6 months**, since expiry outcomes lag. |
| **Tooling** | Pilot-grade SMARTSELL PWA (from the prototype) fed by a weekly DMS extract, or configured within the existing SFA if the vendor allows |
| **Incentive** | Shadow Healthy Sales Scorecard (visible, not paid) + recognition for ₹ rescued |
| **Budget** | ~₹50 lakh (see `09` §7) |

### Weekly cadence
- **Mon:** risk list refreshed from the DMS extract and last counts.
- **Daily:** visits with Smart Count and actions.
- **Fri:** ASM review: approvals, repeat offenders, coaching.
- **Monthly:** distributor ageing review; brand/demand-planning readout on repeat SKUs.

### Success and kill criteria

| Decision | Criteria |
|---|---|
| **Scale** (national phased rollout) | At-risk ₹ **≥ −20%** vs control AND OOS **≥ −15%** AND secondary growth **≥ control** AND completion **≥ 70%** AND added visit time **≤ 4 min** |
| **Iterate** (second pilot) | Waste improves but adoption < 60% or time > 6 min. Fix UX, incentives and rules. |
| **Stop** | At-risk ₹ improves < 10%, OR secondary growth falls more than 2 pts below control |

### Questions we need L'Oréal to answer during pilot set-up (the honest data gaps)
1. What does "capped at ~1.5%" mean: a return allowance, or observed level?
2. Return reason codes by channel and division (to calibrate **s**).
3. Does the DMS hold batch/expiry by distributor? Which SFA is used, and can it host custom logic?
4. Current rep incentive structure (primary vs secondary weighting).
5. Shelf-life acceptance norms of MT and q-comm accounts (to calibrate MSB).
6. Approved bundle and scheme catalogue by brand; transfer policy between distributors.
7. Existing unsold-goods routes in India (donation partners, staff sales, recycling).

## 4. Scale-up roadmap (after the pilot)
1. **Months 0–4:** pilot (above).
2. **Months 5–9:** phase 1 rollout to top 10 metros' GT and chemist channel; integrate into the existing SFA; paid scorecard.
3. **Months 10–18:** all territories; Professional (salon) variant; distributor ageing review standardised.
4. **Month 18+:** ML velocity for sparse SKUs; intervention-uplift learning; optional batch-code OCR; feed outlet sell-out signals to Demand Sensing.

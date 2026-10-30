# 09 · Illustrative Business Case and Financial Model

> **Read this disclaimer on the slide too:** every number below is **illustrative**. The only sourced inputs are the case's ~1.5% and ~1% [F] S1 and L'Oréal India's reported FY25 net sales used as a scale reference [F] S3. The case doesn't say its percentages describe L'Oréal India specifically. Everything else is a labelled assumption that the pilot is designed to test.
>
> Reproduce it with `python3 -I model/financial_model.py` (writes `model/scenarios.csv`).

---

## 1. Starting point: the cost pools (not the savings)

| Pool | Basis | Annual value at ₹5,900 cr revenue |
|---|---|---|
| Returned / expired / damaged stock | ~1.5% of revenue [F] S1 | **₹88.5 cr** |
| Handling, reverse logistics, destruction | ~1% of revenue [F] S1 | **₹59.0 cr** |
| **Total** | ~2.5% | **₹147.5 cr** |

Per ₹1,000 cr of revenue the pools are ₹15 cr + ₹10 cr. Use this normalisation if judges question the revenue base.

## 2. What is addressable by field sales (and what isn't)

`Addressable = Pool × f × s`

| Factor | Meaning | Conservative | Base | Optimistic | Basis |
|---|---|---|---|---|---|
| **f**: field-covered share | Share of the pool arising in channels reps visit (GT, chemist, salon, regional MT) rather than e-com, q-comm or national MT key accounts | 50% | 60% | 70% | [A]. GT still dominates beauty outside metros; e-com is ~18% of FMCG even in the top-8 metros [F] S18 |
| **s**: sales-influenceable share | Share of returns caused by slow movement, over-ordering, poor rotation or outlet handling (vs transit damage, quality, recalls, regulatory pack changes) | 50% | 60% | 65% | [A]. Validate with return reason-code data in the pilot |
| **Addressable share of the pool** | f × s | **25%** | **36%** | **46%** | |
| Addressable loss | | ₹22.1 cr | ₹31.9 cr | ₹40.3 cr | |
| Addressable handling | | ₹14.8 cr | ₹21.2 cr | ₹26.8 cr | |

**Explicitly NOT addressable by our solution:** transit/warehouse damage upstream of the distributor, quality defects, recalls, regulatory relabelling, e-com/q-comm returns. Saying so up front protects our credibility.

## 3. Benefits (steady state, per year)

| Line | Formula | Cons. | **Base** | Opt. |
|---|---|---|---|---|
| Reduction in addressable waste (r) [A] | | 15% | **25%** | 35% |
| ① Loss avoided | Addressable loss × r | ₹3.3 cr | **₹8.0 cr** | ₹14.1 cr |
| ② Handling avoided | Addressable handling × r | ₹2.2 cr | **₹5.3 cr** | ₹9.4 cr |
| ③ Cost to recover the stock (transfers, bundles, sampling) | ① × ctr (35% / 25% / 20%) [A] | −₹1.2 cr | **−₹2.0 cr** | −₹2.8 cr |
| ④ Incremental sell-in from fewer stock-outs | Revenue × f × OOS 8% × brand-loss 35% × OOS reduction (10/20/30%) | ₹8.3 cr | **₹19.8 cr** | ₹34.7 cr |
| ⑤ Contribution on ④ | ④ × 35% contribution margin [A] | ₹2.9 cr | **₹6.9 cr** | ₹12.1 cr |
| **Net benefit / year** | ① + ② − ③ + ⑤ | **₹7.3 cr** | **₹18.2 cr** | **₹32.8 cr** |
| As % of revenue | | 0.12% | **0.31%** | 0.56% |

**OOS inputs:** the 8% out-of-stock rate and the 35% brand-loss share are anchored on a **2002 global study** (Gruen, Corsten & Bharadwaj) [S29, **must verify**]. India GT figures may differ. Label this on the slide.

### How we avoid double-counting
1. **Units recovered through transfers are counted once**, in ① (avoided credit note). The recipient's extra sales from that stock are **not** added again to ④.
2. ④ counts only availability gains from **replenishment** (better order sizing), not from transferred stock.
3. ① is valued at trade price (the credit note avoided), **not** at consumer price.
4. ② scales with returned volume avoided, and is a separate cost line from the stock value.
5. ③ is netted off ①, because rescuing stock isn't free.
6. Distributor working-capital release is a **distributor** benefit. It's shown qualitatively and **not** added to L'Oréal's ROI.
7. ⑤ uses a contribution margin, not revenue.

## 4. Costs and ROI

| Cost [A] | Cons. | Base | Opt. | Notes |
|---|---|---|---|---|
| One-time: build into existing SFA/DMS, data integration, configuration, training, change management | ₹9.0 cr | ₹7.5 cr | ₹6.0 cr | Lower if SMARTSELL logic is configured inside the current SFA vendor's platform |
| Run cost per year: support, cloud, a 4–6 person analytics and enablement cell, sampling/tester stock refresh | ₹3.0 cr | ₹2.5 cr | ₹2.0 cr | |

| Result | Conservative | **Base** | Optimistic |
|---|---|---|---|
| Year-1 benefit (50% ramp) | ₹3.6 cr | **₹9.1 cr** | ₹16.4 cr |
| Year-1 cost | ₹12.0 cr | **₹10.0 cr** | ₹8.0 cr |
| **Year-1 ROI** | **−70%** | **−9%** | **+105%** |
| Year-2 net (after run cost) | ₹4.3 cr | **₹15.7 cr** | ₹30.8 cr |
| 3-year benefit / cost | ₹18.2 / ₹18.0 cr | **₹45.6 / ₹15.0 cr** | ₹82.0 / ₹12.0 cr |
| **3-year ROI** | **~1% (break-even)** | **~204%** | **~584%** |

**Honest reading (say this to judges):**
- In the **base case** it pays back during year 2 and returns about 3× its cost over 3 years.
- In the **conservative case** it only breaks even. That's why we propose a **pilot with kill criteria** before any national spend.
- **Waste reduction alone** (excluding the OOS benefit) is ~₹11.3 cr/year in the base case. The sustainability case stands even if the growth benefit is challenged.

## 5. Sensitivity (base case net benefit ₹18.2 cr/yr)

| Driver | Low → High | Net benefit range |
|---|---|---|
| Waste reduction rate r | 15% → 35% | ₹13.7 → ₹22.7 cr |
| OOS reduction q | 10% → 30% | ₹14.8 → ₹21.7 cr |
| Baseline OOS rate | 5% → 12% | ₹15.6 → ₹21.7 cr |
| Field-covered share f | 50% → 70% | ₹15.2 → ₹21.3 cr |
| Contribution margin | 25% → 45% | ₹16.2 → ₹20.2 cr |
| Influenceable share s | 50% → 65% | ₹16.3 → ₹19.2 cr |
| Cost to recover | 35% → 15% | ₹17.4 → ₹19.0 cr |

**What to measure first in the pilot:** r (the waste reduction rate) and q (the OOS reduction), because they swing the case most.

## 6. Sustainability impact (illustrative conversion)

| Metric | Formula [A] | Cons. | Base | Opt. |
|---|---|---|---|---|
| Units saved from return/destruction per year | Loss avoided ÷ avg trade value ₹250/unit [A] | ~1.3 lakh | **~3.2 lakh** | ~5.6 lakh |
| Packaging not wasted | units × ~40 g average primary + secondary pack [A] | ~5 t | **~13 t** | ~23 t |
| Reverse-logistics movements avoided | proportional to ② | qualitative | qualitative | qualitative |

> Never present these as L'Oréal's measured footprint. In the pilot, replace the ₹250 and 40 g factors with L'Oréal's real average unit value and pack-weight data.

## 7. Pilot economics (separate from rollout)

| Item [A] | Estimate |
|---|---|
| Pilot scope revenue (2 territories, annualised) | ~₹60 cr (~1% of India revenue) |
| Pilot cost (16 weeks): pilot-grade build ₹20 L · data extraction ₹10 L · training & field time ₹5 L · intervention budget (sampling, transfers) ₹10 L · measurement/analyst ₹5 L | **~₹50 lakh** |
| Expected pilot benefit at base run-rate (0.31% × ₹60 cr × 16/52) | ~₹5.7 lakh |
| **What the pilot buys** | Not payback: **evidence** for the four assumptions (r, q, s, adoption) that decide a ₹7–9 cr rollout |

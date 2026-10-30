# 02 · Problem Diagnosis and Root-Cause Analysis

Labels: **[F]** fact · **[A]** assumption · **[H]** hypothesis · **[R]** recommendation

---

## 0. The problem in plain English

L'Oréal sells products *into* distributors and shops (**sell-in**). The money is only real when a consumer buys the product off the shelf (**sell-out**). When the two drift apart, products sit in godowns and on shelves, get dusty, get damaged, expire, and come back as returns. In the case's numbers, that costs **~1.5% of revenue in lost stock plus ~1% to handle and destroy it** [F] S1.

The obvious fix ("just order less") backfires: shelves go empty, consumers buy a competitor, and growth stalls. So the real job is:

> **Put the right stock in the right outlet, notice early when it's not moving, and act while acting is still cheap.**

The salesperson is the only person who stands in the shop *and* takes the order, so they are the right person to do this, if they're given the signals, the playbook and the incentive.

---

## 1. Supply chain map (generic India beauty model; L'Oréal specifics to be validated)

```
 ┌──────────┐   primary    ┌──────────────┐  secondary   ┌────────────────────┐  sell-out  ┌──────────┐
 │ L'Oréal  │ ───────────▶ │ CFA / Depot  │ ───────────▶ │ Distributor (GT,    │ ─────────▶ │ Retailer │ ──▶ Consumer
 │ plants   │  (sell-in)   │ (company     │              │ chemist, salon)     │            │ / Salon  │
 │ Chakan,  │              │  warehouse)  │              │ godown: weeks of    │            │ shelf +  │
 │ Baddi    │              └──────────────┘              │ cover, multi-batch  │            │ backroom │
 └──────────┘                     │                      └────────────────────┘            └──────────┘
                                  │ direct                                     ▲ returns (expired/damaged)
                                  ▼                                            │ credit note / replacement
                       MT key accounts · e-com · q-comm dark stores ───────────┘ reverse logistics → destruction/recycling
```

**Where visibility exists today** (typical industry; **[H]** for L'Oréal):

| Node | Stock visibility | Batch/expiry visibility | Sell-out visibility |
|---|---|---|---|
| CFA/depot | High (ERP) | High | n/a |
| Distributor | Medium–high (DMS stock by SKU) | **Low–medium** (often not tracked by batch in DMS) | Secondary sales = proxy |
| GT retailer | **Low** (only what the rep observes) | **Very low** | **None** (no POS). Must be inferred. |
| Chemist | Low–medium (some billing software) | Medium (pharma habits) | Partial |
| MT / e-com / q-comm | High, but owned by the account | High | High (data shared via account teams) |

**The information gap is concentrated exactly where field sales operates: GT, chemist and salon outlets.** That's why the case says field teams "have direct visibility". They're the only sensor there.

---

## 2. Sell-in vs sell-out: why they diverge

| Driver of divergence | How it happens |
|---|---|
| **Target design** | Targets and incentives on primary or secondary *invoicing*, not on consumer offtake, reward loading [H, pattern supported by S31, S32] |
| **Period-end push** | Last-week-of-month or quarter "closing" schemes pull demand forward [H] |
| **Scheme economics** | Retailers buy for the scheme, not the shelf [F, C-grade] S32 |
| **Channel shift** | Consumers move to q-comm and MT while GT replenishment norms stay the same [F] S18, S19 |
| **Lagging signals** | Returns show up months after the sale, in a different cost line, often without an owner [H] |
| **Data latency** | Retailer stock isn't measured, so "the distributor asked for 200" stands in for demand [H] |

**Key insight [H, our core thesis]:** *waste is decided at the moment of the order and discovered at the moment of the return.* Between those two moments are many store visits where a rep could have seen it coming. Today nothing in the rep's workflow asks them to look.

---

## 3. How inventory turns bad: the lifecycle

```
 Healthy ──▶ Slow-moving ──▶ Excess/ageing ──▶ Near-expiry ──▶ Expired ──▶ Returned ──▶ Destroyed / recycled
  (cover      (velocity       (cover > 2× norm,   (shelf life left    (unsellable)   (credit note,  (cost ~1% rev)
  within      falling;        stock aging in      < sellable buffer;               reverse
  norm)       dust, no        back room)          retailers refuse)                logistics)
              re-order)
     ◀──── cheap, many options ────────────────────▶◀──── expensive, few options ──────────────────────▶
```

Damage is a separate branch at any stage (heat, crushing, leaks, tester abuse) → returned.

**The economic shape of the problem [R]:** the cost of fixing a unit *rises* and the number of options *shrinks* as it moves right. A slow SKU caught at 9 months of shelf life can be fixed by moving it to a better shelf (₹0). The same SKU caught at 45 days can only be sold at a discount, liquidated or returned. **Early detection is worth more than clever intervention.**

---

## 4. Definitions that must not be confused

| State | Definition (operational) | What it needs | Wrong response |
|---|---|---|---|
| **Slow-moving** | Velocity below the outlet/SKU norm, falling trend, but enough shelf life to sell through | **Diagnosis** (why isn't it selling?), then demand fix or range fix | Immediate discount |
| **Excess/overstock** | Days of cover > ~2× target norm; may or may not be slow | **Stop feeding it**, rebalance to where it sells | Cutting the whole order (risks OOS on other SKUs) |
| **Near-expiry** | Projected unsold units when the batch hits its *sellable buffer* (retailers and consumers refuse it); action window ≤ 90 days | **Speed** (move to highest-velocity outlets now; approved bundle; controlled liquidation/donation before expiry) | "Wait and see", or diagnosis projects |
| **Stock-out risk** | Days of cover < lead time + safety days on a selling SKU | **Replenish**, ideally from surplus elsewhere first | Treating the order as "more inventory risk" |
| **Damaged** | Physically unsellable regardless of date | Root-cause handling (storage, heat, transport); claims hygiene | Absorbing it silently |

Exact formulas are in `08-risk-methodology.md`.

---

## 5. Pain points by stakeholder

| Stakeholder | Pain | Evidence/label |
|---|---|---|
| **L'Oréal** | ~1.5% revenue lost plus ~1% handling [F] S1; brand-equity damage when expired or dusty packs sit on shelf; distributor relationship friction; double carbon footprint (forward + reverse); A&P already spent on units that never sell | [F] S1, S2; rest [H] |
| **Distributor** | Working capital stuck in slow stock; claims and credit-note delays (AICPDF complaints about the industry) [F] S22, S23; pressured into period-end loading; squeezed by q-comm | [F]/[H] |
| **Retailer** | Shelf space and cash tied up in non-moving SKUs; customer complaints about old stock; return hassles; missing fast-movers when cash is stuck | [H] |
| **Field salesperson** | Measured on orders, so incentives conflict with "don't load"; no time to audit every SKU; no authority or tools to fix slow stock beyond pushing discounts; blamed later for returns | [H] (validate in user interviews) |
| **Sales manager (ASM)** | Sees returns months later, aggregated, can't trace them to the decision; can't tell which rep is building healthy vs loaded business | [H] |

---

## 6. Where current processes fail (information and decision gaps)

| # | Gap | Consequence |
|---|---|---|
| G1 | **No batch-age view at outlet level.** Totals hide that 60 units belong to a batch expiring in 3 months. | Expiry discovered too late |
| G2 | **Order quantity driven by "what did you buy last time" or "what the distributor asks"**, not stock cover | Overstock compounding |
| G3 | **No trigger in the visit workflow** to look for slow stock: no checklist, no "signals" | Detection depends on individual diligence |
| G4 | **No pre-agreed menu of actions** with approval levels; reps default to discounts or do nothing | Margin leakage or inaction |
| G5 | **No cross-outlet matching.** Surplus in one store and a stock-out in the next store on the same beat. | Waste and lost sales at the same time |
| G6 | **Returns not attributed back** to the order or rep that created them | No learning, no accountability |
| G7 | **Incentives reward sell-in volume only** | Structural loading [H] |

---

## 7. Why "just cut orders" fails

1. **Stock-outs lose sales permanently.** Global research suggests about a third of shoppers facing an OOS switch brand or don't buy at all (~26% switch brand + ~9% don't buy) [F, global, 2002: S29, verify]. In beauty, a lost shopper can mean a lost regimen.
2. **Blunt corrections hurt revenue.** Dabur's public distributor-inventory correction (30→21 days, primary sales largely stopped for 7–8 days) came with guidance for a revenue decline that quarter [F] S19.
3. **Cutting is not targeted.** Total stock may be "high" while *specific* fast SKUs are short. Average cover hides SKU-level imbalance.
4. **It damages distributor economics,** so the distributor de-prioritises the brand.
5. **It doesn't fix the stock that's already in the channel.** The ₹ at risk today needs action, not just a smaller next order.

**So the answer is to reallocate stock and activate demand, with order guardrails at SKU level, not volume cuts.**

---

## 8. Root causes the on-ground team can actually influence

| Root cause | Rep influence | Manager/company influence | In our scope? |
|---|---|---|---|
| Over-ordering at SKU level (loading, schemes) | **High** (suggested order, refuse to load) | High (targets, schemes) | ✅ Core |
| Wrong assortment for outlet | **High** (range recommendation per outlet type) | Medium | ✅ Core |
| Poor rotation (FEFO) | **High** (arrange shelf, check godown) | Medium (distributor SOP) | ✅ Core |
| Poor visibility/placement | **High** | Medium (visibility budgets) | ✅ Core |
| Weak demand activation | Medium (sampling, retailer advocacy) | High (BA deployment, sampling budgets) | ✅ Core |
| Imbalance across outlets | **High** (with distributor) | Medium (transfer approvals) | ✅ Core, our hero feature |
| Handling damage at outlet | Medium (education) | Medium | ✅ Light |
| Incentive design | Low | **High** | ✅ Recommendation to management |
| Return-policy design | Low | **High** | ⚠️ Recommendation only |
| Forecasting/production planning | Low | High (Demand Sensing) | ❌ Out of scope; we feed signals into it |
| Q-comm channel shift | Low | High | ❌ Context; rebalancing helps |

---

## 9. What the case explicitly asks vs what we infer

| Explicit in the case (S1) | Our inference |
|---|---|
| "Protect revenue growth while proactively reducing… returns, expiry, dead inventory **without simply cutting orders**" | Success = less waste **and** no loss of sell-out. Both need KPIs. |
| "Design an **on-ground sales strategy**" | **This is a strategy and operating-model question first.** Tech is allowed, not required. |
| Deliverable a: "At **which points during a retailer/distributor visit** can slow or ageing stock be spotted?" | Map the visit stage by stage (see `05-product-concept.md`). |
| Deliverable a: "What **simple signals** (shelf dust, unsold cartons, retailer feedback) should be flagged, **and to whom**?" | Judges want low-tech, observable signals plus an escalation matrix. A pure-AI answer misses this. |
| Deliverable b: "What **specific on-ground actions** would you use to move slow SKUs?" | Concrete playbooks with costs and guardrails |
| Deliverable b: "What can we do **differently for a near-expiry SKU vs a slow-moving one**?" | An explicit comparison table is mandatory |
| "~1.5% … **capped**" | Ambiguous. Possibly a returns allowance (company accepts returns up to ~1.5% of revenue, so excess waste falls on distributors), or simply the observed level. **If it's a cap, true channel waste may exceed 1.5%** and distributors bear the rest. Ask L'Oréal. |
| "Field sales teams have direct visibility" | They *can* see; we infer they aren't *systematically* capturing or acting on it. |
| Not stated: channel mix, field size, systems, return terms | Don't invent. Ask during pilot design. |

---

## 10. Problem tree

```
                                         IMPACT
   Financial: ~1.5% revenue lost + ~1% handling (case)   │   Sustainability: product, packaging, transport & destruction wasted;
   + lost sales from OOS + distributor ROI erosion       │   reverse-logistics emissions; brand trust erosion
                                            ▲
                                        SYMPTOMS
   Expired stock returns · damaged returns · dusty/aged packs on shelf · distributor complaints & claim disputes ·
   end-of-month loading · simultaneous overstock AND stock-outs on the same beat · discount-led liquidation
                                            ▲
                                  ROOT CAUSES (influence)
 ┌───────────────────────────┬────────────────────────────┬──────────────────────────────┬─────────────────────────┐
 │ ORDER DECISION (Rep: High)│ OUTLET EXECUTION (Rep: High)│ INFORMATION (Rep: Med)       │ SYSTEM/POLICY (Mgmt)    │
 │ • Orders sized by ask/    │ • No FEFO rotation          │ • No batch/expiry view at    │ • Sell-in-only targets  │
 │   habit, not stock cover  │ • Poor placement/visibility │   outlet & distributor       │ • Volume schemes        │
 │ • Scheme/period-end load  │ • No sampling/tester        │ • Sell-out not measured in GT│ • Returns not attributed│
 │ • Same range for every    │ • Handling damage           │ • Signals not captured       │ • No action menu/approval│
 │   outlet type             │ • No cross-outlet rebalance │ • Returns data lags months   │ • Channel shift to q-comm│
 └───────────────────────────┴────────────────────────────┴──────────────────────────────┴─────────────────────────┘
```

**The three highest-leverage root causes** (high rep influence × high value):
1. **Order sizing without stock-cover/expiry logic** → fix with an *order guardrail*.
2. **No early, structured detection in the visit** → fix with *signals + smart count + risk view*.
3. **No sanctioned, cheap actions or rebalancing** → fix with an *intervention ladder + territory matching*.

And one enabling root cause management must fix: **incentives that pay only for sell-in.**

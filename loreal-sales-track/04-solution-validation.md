# 04 · Challenging SMARTSELL: Solution Validation and Comparison

## Verdict up front: **MODIFY** (direction is right; framing, scope and centre of gravity must change)

SMARTSELL as originally framed ("AI-powered field sales intelligence platform") **solves a real problem but answers the wrong question for these judges.** The case asks for an *on-ground sales strategy* with *simple signals* and *specific actions* [F] S1. A tech-first pitch risks looking like we skipped the brief. The winning version is:

> **"Sell-Through Selling": a field sales operating model (visit routine + signals + playbooks + incentives), made executable and measurable by a lightweight SMARTSELL companion. The rules come first, the AI comes later and only where it earns its place.**

---

## 1. The nine hard questions

### Q1. Is it solving a meaningful business problem?
**Yes.** ~2.5% of revenue (1.5% stock + 1% handling) is a material pool [F] S1. At L'Oréal India's scale (~₹5,900 cr FY25 net sales [F] S3) that's an illustrative **~₹148 cr a year**, assuming the case percentages apply to L'Oréal India, which the case doesn't state. Lost sales from stock-outs come on top. But **only part of the pool is addressable by field sales** (we estimate 25–45% of the loss pool; see `09-financial-model.md`). We must say so explicitly, because claiming the full 2.5% would cost credibility.

### Q2. Is an AI platform necessary, or would a simpler intervention be better?
**AI is not necessary for the core value.** The risk logic is arithmetic: days of cover, remaining shelf life, velocity, FEFO projection. It is transparent rules, not ML. What *is* necessary is (a) a structured visit routine, (b) a fast way to capture batch and expiry for flagged SKUs, (c) a pre-approved action menu, (d) tracking. A paper checklist can deliver (a) and some of (c); it can't deliver cross-outlet matching, order guardrails at scale, or outcome tracking.
**Where ML could earn its place later:** forecasting velocity for new or sparse SKUs, learning which intervention works for which outlet type (uplift modelling), and anomaly detection on returns. **Position these as phase 3, not the demo.**

### Q3. Does L'Oréal already have something similar?
**Probably partly.** L'Oréal India very likely uses an SFA/DMS (industry norm; vendor ecosystem in S27), and the group runs Demand Sensing [F] S11. **We found no public evidence** of outlet-level batch-expiry risk detection tied to field actions. **Mitigation:** design SMARTSELL as a *module/logic layer* that can be configured inside the existing SFA. Say "we don't know your current stack; here's the logic and workflow any SFA can host."

### Q4. What would prevent adoption by reps and distributors?
| Barrier | Mitigation |
|---|---|
| Extra time per visit (reps cover many outlets a day) [A] | **Smart Count**: only the 5–10 SKUs pre-flagged from distributor data are counted, with a target of **≤ 4 minutes extra per visit**. Nothing else changes. |
| "Another app" fatigue | Embed into the existing SFA; offline-first; one screen per decision |
| Incentive conflict (target = sell-in) | Add a **Healthy Sales Scorecard** (section 05). Without this, no tool works. |
| Fear of blame for flagged stock | Frame flags as "rupees rescued", not "your mistakes"; credit the rep for rescued value |
| Distributor reluctance to share batch data or do transfers | Distributor benefits: cash released, fewer disputed claims, a faster return process for genuine cases |
| Retailer reluctance to let the rep into the back room | Value exchange: "I'll help you free up ₹X of stuck stock and avoid returns hassle" |

### Q5. What data is needed, and how realistically can it be captured?
| Data | Source | Realism |
|---|---|---|
| Distributor stock by SKU | DMS | **High** (exists in most DMS) |
| Distributor stock by batch/expiry | DMS (if batch-enabled) or monthly godown audit | **Medium** |
| Secondary sales by outlet × SKU | DMS invoices | **High** |
| Retailer stock on hand | Rep counts flagged SKUs only | **Medium** (manual, partial) |
| Retailer batch/expiry | Printed on every pack by law [F] S25; rep reads or scans it for flagged SKUs | **Medium** |
| Retailer sell-out | **Inferred:** opening stock + deliveries − closing stock between two visits (stock-flow method) | **Medium**, improves with each visit |
| Qualitative signals (dust, cartons, feedback) | Rep taps checkboxes | **High** |

### Q6. Limits of retailer-level sales and expiry data
- Stock-flow sell-out is noisy: shrinkage, transfers to other shops, and purchases from other distributors or the wholesale market all distort it.
- Reps will count only flagged SKUs, so unflagged problems can be missed. **Mitigation:** a monthly "full shelf walk" at the top 20% of outlets, plus a random audit.
- Batch codes can be hard to read; month-only dates are ambiguous (addressed by the 2025 amendments) [F] S25.
- Retailers may hide stock (to claim returns or get scheme benefits).
- **Design response:** every number carries a **confidence level**, and low-confidence flags trigger *verification* first, not costly action (see `08`).

### Q7. Unintended consequences
| Risk | Guardrail |
|---|---|
| **Brand dilution from discounting** | Discount is level 6 of 8 in the ladder. **Never for Luxe/Derma.** Only approved schemes from the brand catalogue, time-boxed, ASM approval. |
| **Channel conflict** (dumping into q-comm/MT, grey market) [F] S21 | Transfers only between **authorised outlets** in the same distributor network. No liquidation to unauthorised resellers. Liquidation goes via L'Oréal-approved routes only. |
| **Under-ordering causing OOS** | Guardrails are *SKU-level*, and every reduction must be offset by stock-out checks; **growth guardrail KPI** (secondary sales vs control) |
| **Gaming** (reps under-report stock to avoid flags, or over-flag for credit) | Random audits, photo evidence for high-value actions, a distributor cross-check |
| **Distributor cost burden from transfers** | Transfer logistics cost budgeted, and capped per transfer |
| **Retailer annoyance** | Max 2 recommended actions per visit |

### Q8. What happens when data is incomplete or inaccurate?
- **Missing batch** → assume the oldest plausible batch? No. Show "expiry unknown: capture batch" and treat the risk as *unknown*, not *safe*.
- **Missing velocity** → fall back to the outlet-cluster average for that SKU, with low confidence.
- **Stale count** (more than 30 days) → confidence decays; "recount" becomes the first recommended action.
- **Conflicting data** (DMS shows deliveries, but the count implies negative sales) → flag a data anomaly for the ASM.
- The engine **never auto-executes**. A human accepts, modifies or rejects with a reason code, and the reason codes are themselves data.

### Q9. Strongest differentiation we can demonstrate
1. **"Rupees at risk", not an AI score.** Every flag shows *units likely to go unsold × value* and *days left to act*, in a form a rep can explain to a retailer.
2. **Catch-window ("time machine") demo**: the same SKU detected 150 days earlier costs ~₹8.9k of risk with every option open, versus ~₹35k with only liquidation left (worked example, `08`).
3. **Territory rebalancing**: the surplus at outlet A fills the stock-out risk at outlet B on the same beat. **Waste and lost sales are solved by the same move.**
4. **Closed loop**: detect → act → recount → outcome, visible to the manager.
5. **Explicit near-expiry vs slow-moving playbooks**, answering the case's question directly.

---

## 2. Solution approaches compared

| Approach | Description |
|---|---|
| **A. Tech-led** | AI platform: ML demand forecasting, image recognition, automated replenishment, auto-generated actions, rich dashboards |
| **B. Process-led** | Pure operating-model change: visit checklist on paper or SFA form, signal → escalation matrix, playbooks, FEFO training, distributor stock norms, incentive redesign. No new tool. |
| **C. Hybrid (recommended)** | B's operating model + a lightweight SMARTSELL companion (transparent rules engine, smart count, action ladder, transfer matching, closed-loop tracking, manager view). Designed to plug into the existing SFA. |
| **D. Policy-led** (benchmark) | Change return policy and distributor terms: tighter return caps, distributor-borne expiry, liquidation partner contracts |

### Scoring (1–5; weights reflect what we believe judges value; scores are our judgement)

| Criterion (weight) | A. Tech-led | B. Process-led | **C. Hybrid** | D. Policy-led |
|---|---|---|---|---|
| Business impact (25%) | 4 | 3 | **5** | 2 (shifts cost to distributors, doesn't remove waste) |
| Feasibility in 6–12 months (20%) | 2 | **5** | 4 | 4 |
| Answers the case brief (20%) | 2 | 4 | **5** | 2 |
| Differentiation (15%) | 3 | 2 | **5** | 1 |
| Scalability (10%) | 4 | 2 | **4** | 5 |
| Judge demo appeal (10%) | 4 | 1 | **5** | 1 |
| **Weighted score** | **3.05** | **3.15** | **4.70** | **2.45** |

*Arithmetic: A = 0.25·4 + 0.20·2 + 0.20·2 + 0.15·3 + 0.10·4 + 0.10·4 = 3.05. B = 0.75 + 1.00 + 0.80 + 0.30 + 0.20 + 0.10 = 3.15. C = 1.25 + 0.80 + 1.00 + 0.75 + 0.40 + 0.50 = 4.70. D = 0.50 + 0.80 + 0.40 + 0.15 + 0.50 + 0.10 = 2.45. The weights and scores are our own judgement. Show them as such, and invite judges to re-weight.*

### Why C wins
- **Answers the brief literally** (visit points, simple signals, who to flag, specific actions, near-expiry vs slow) through its operating-model layer.
- **Shows execution and measurement** through the companion app, which turns "good advice" into a testable system with outcomes.
- **Avoids the AI trap:** transparent rules a sales director can audit in 5 minutes.
- **Implementable**: rides on existing DMS/SFA data; the pilot needs no new hardware.

### What we take from the others
- From **B**: incentive redesign, the FEFO SOP, distributor stock norms by SKU class.
- From **A** (phase 3): ML velocity forecasting for sparse SKUs, intervention-uplift learning, optional image capture of batch codes.
- From **D** (as a management recommendation): attribute returns back to the originating territory and month; fast, fair claims for genuine expiry to keep distributor trust.

---

## 3. Re-framing the name and pitch

| Original | Refined |
|---|---|
| "AI-powered Field Sales Intelligence and Inventory Intervention System" | **"SMARTSELL: Sell-Through Selling"**, a field operating model and companion that helps every L'Oréal rep catch slow stock early, fix it cheaply, and grow sell-out |
| AI at the centre | **The rep's visit at the centre**; rules engine as enabler; AI as roadmap |
| Four modules as software | Four modules as **capabilities of a routine**: *See* (Stock Intelligence) → *Prioritise* (Risk Engine) → *Act* (Action Engine) → *Learn* (Manager Intelligence) |
| Discount/bundle/transfer suggestions | An **8-step intervention ladder** with brand-tier guardrails and approval levels |
| Dashboards | **Closed loop with incentives**: the Healthy Sales Scorecard |

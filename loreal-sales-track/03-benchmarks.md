# 03 · Competitor and Benchmark Research

Purpose: learn what has been tried, what worked, and where our solution has genuine white space. Every case is tagged with what it proves **for our pitch**.

---

## 1. Indian FMCG benchmarks

### Dabur: the cost of fixing channel inventory the blunt way (Q2 FY25) [F] S19
- **What happened:** growth moved to MT, e-com and q-comm and GT distributors became overstocked, hurting their ROI. Dabur largely **stopped primary sales for the last 7–8 days** of the quarter to correct inventory. Distributor cover went from **~30 to ~21 days**, with a target of 19. Management guided to a **mid-single-digit revenue decline**, the first in years.
- **What it proves for us:** (1) excess channel inventory is a live, board-level issue in Indian FMCG today; (2) **the blunt fix (cutting orders) costs revenue**, which is exactly the trap the L'Oréal case warns about; (3) the trigger was channel shift to q-comm, the same trend L'Oréal is accelerating [F] S7.
- **Use on slide:** "Why cutting orders isn't the answer."

### HUL Shikhar and Sales Edge: digital adoption at scale, with limits [F] S20
- **What happened:** retailer self-ordering app launched in 2019, now with more than 1.4 m retailers. Reps use a separate app (Sales Edge). Distributors were incentivised to serve app orders first. A WARC case study notes **high dormancy** after initial adoption, with many retailers using it only for monthly stock orders.
- **What it proves:** (1) Indian GT will adopt digital tools *if the economics are clear*; (2) **retailer-side apps struggle with sustained engagement**, so our design should not depend on retailers entering data; (3) HUL made distributors part of the incentive loop, and we should too.
- **Use on slide:** "Why we put the rep, not the retailer, at the centre" and "distributor incentive."

### AICPDF vs FMCG companies: the channel-conflict warning [F] S21, S22, S23
- **What happened:** the distributors' federation publicly accused FMCG firms of using q-comm and e-com as **"dumping grounds" for near-expiry and slow stock behind deep discounts** (Nov 2024). It flagged unsettled credit notes and alleged ~₹300 cr of near-expiry stock in a BPC company's channel (**the company disputed this**), and it asked for contractual take-back clauses.
- **What it proves:** (1) near-expiry stock is a real and *politically sensitive* issue in Indian beauty and personal care; (2) **discount-led liquidation through online channels creates channel conflict and reputational risk**; (3) distributors want fair, fast return settlement.
- **Use on slide:** "Guardrails: why discounting is the last resort, never the default."

### Indian SFA/DMS vendors (Bizom, FieldAssist) [F] S27
- **What exists:** SFA, DMS, claims, retailer apps, real-time distributor stock, auto-replenishment, serving hundreds of CPG brands.
- **What we didn't find publicly:** batch/expiry-led *field recommendations* that are tracked to an outcome.
- **What it proves:** the data plumbing exists in the industry, so our module is **implementable on top of it**. The gap is decision logic and workflow, not data capture technology.

### Image-recognition retail execution (ParallelDots ShelfWatch, Infilect) [F, grade C] S28
- **What exists:** shelf photos turned into on-shelf availability, share of shelf and planogram compliance, integrated into SFA apps.
- **Limitation for our problem:** cameras see facings, not **batch codes in the back room or the age of stock**. Accuracy depends on image capture.
- **What it proves:** a *future* add-on for visibility signals, **not needed for an MVP**. This is a good answer to "why not use computer vision?"

---

## 2. L'Oréal's own relevant initiatives (to complement, not duplicate)

| Initiative | What it does | How SMARTSELL complements it |
|---|---|---|
| **Demand Sensing** (Tech Accelerator, ML forecasting) [F] S11 | Forecasts demand to plan supply | We provide **outlet-level sell-out estimates and stuck-stock signals** that central forecasting can't see in GT. We become a data feed *into* Demand Sensing. |
| **Hyderabad Beauty Tech hub** [F] S10 | AI, data, supply-chain intelligence capacity in India | A natural owner for scaling the risk engine after the pilot |
| **End-of-line outlets / unsold-goods hierarchy** (sell → donate → recycle) [F] S16 | Avoids destruction of unsold goods | Our end-of-life playbook routes stock through the same hierarchy, *before* expiry |
| **L'Oréal for the Future** [F] S12, S13 | 2030 sustainability targets | We add a missing metric: **units of finished product saved from waste** |

---

## 3. Global and adjacent benchmarks (pattern references, not proof of impact)

| Reference | Pattern | Use |
|---|---|---|
| Retail out-of-stock research (Gruen, Corsten & Bharadwaj, 2002) [S29, verify] | Average OOS ~8%. A large share of shoppers switch brand or don't buy. | Quantifies the cost of under-stocking (old and global, so label it) |
| FEFO/redistribution practice in distribution (practitioner guides) [S30, grade C] | Push stock near its expiry threshold through the highest-velocity outlets | Core logic of our transfer engine. **Don't cite vendor % claims.** |
| France's AGEC law (ban on destroying unsold non-food goods) [S16] | Regulation pushing companies toward donation and reuse | Signals the direction of travel. India has no equivalent rule we found. |
| Pharma "near-expiry" practice in India (credit-note return procedure under GST) [S26] | Formalised return-and-credit process for time-expired goods | Shows the return mechanism is mature. The gap is *prevention*. |

---

## 4. Competitive positioning: how other competition teams will likely answer

| Likely answer | Weakness | How we beat it |
|---|---|---|
| "Better forecasting / AI demand planning" | Central, not on-ground; L'Oréal already does it (Demand Sensing) | We answer the actual question: *what does the rep do in the shop?* |
| "Discount slow-moving stock" | Brand dilution, channel conflict (AICPDF), margin loss | We use an intervention **ladder** where discount is step 6 of 8 |
| "Train the salesforce" | Unmeasurable, decays | We embed the training in the workflow and measure execution |
| "Retailer incentives / gamified app" | Retailer apps go dormant (Shikhar lesson) | The rep captures data; the retailer gets value (cash released, fewer returns) |
| "Dashboard for managers" | Detection without action | A closed loop: detect → act → verify outcome |

**Our white space, in one line:** *nobody (publicly) connects batch-level risk at the outlet to a prescribed, budget-guarded field action, and then checks whether it worked.*

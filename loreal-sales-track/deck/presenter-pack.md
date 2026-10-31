# SMARTSELL: Presenter pack

Companion to `SMARTSELL_LOreal_Sales_Track_2026.pptx` (25 slides: 17 main + 8 appendix; speaker notes are embedded in every slide).
**Live prototype:** https://smartsell-loreal.vercel.app

---

## 1. Executive summary (read-aloud version, ~60 seconds)

L'Oréal's case puts returned, expired and damaged stock at about 1.5% of revenue, plus about 1% to handle and destroy it. Cutting orders isn't the answer: it swaps waste for stock-outs and lost growth, as Dabur's 2024 distributor-stock correction showed publicly.

The root cause is that **waste is decided when the order is taken and discovered when the return arrives**. In between, the rep is in that shop many times, but nothing in the visit asks them to look, tells them what they may do, or rewards them for acting. Quick commerce widens the gap: demand moves online while general-trade distributors keep receiving old volumes.

**SMARTSELL** is a field sales intelligence and inventory intervention system for L'Oréal's existing salesforce:
- **Stock Intelligence** (pre-visit brief, Smart Count, batch scan, 12 field signals)
- **Risk Engine** (rupees at risk, days to act, stock-out and channel-shift detection)
- **Action Engine** (8-step ladder, transfer matching, order guardrail, approvals)
- **Manager Intelligence** (territory risk, scorecards, outcomes)

It runs in about four extra minutes per flagged outlet.

The base case is worth **≈₹18 cr a year net, about 3× its cost over three years**. This is illustrative, built only on the case percentages plus labelled assumptions; the conservative case breaks even. In our live simulation, returns fall from about 1.6% to 0.9% of sell-out, with far fewer empty shelves (synthetic data). **Our ask:** a 16-week, two-city pilot against control territories, with scale and stop criteria agreed up front.

---

## 2. Timing plan (~13 minutes + Q&A)

| Block | Slides | Time |
|---|---|---|
| Opening + executive summary | 1–2 | 1:30 |
| Problem and root cause | 3–4 | 2:00 |
| Solution and how it works | 5–6 | 2:00 |
| Detection, action, field examples, quick commerce | 7–11 | 3:30 |
| Product + live demo (optional 3 min) | 12–13 | 2:00 (+3:00) |
| Financials, pilot, KPIs, close | 14–17 | 2:30 |

**If time is short:** skip slide 10 (four outlets; the demo covers it) and slide 16 (KPIs; summarise in one line on slide 15). **If a live demo is allowed:** run it at slide 12 using the in-app judge guide (Shree Beauty → count → why flagged → accept transfer → order → approve as manager → fast-forward a quarter → outcomes).

**Demo safety:** the app runs fully in the browser. Press Reset before presenting, keep a backup screen recording, and open the URL once in a private window to confirm public access.

---

## 3. Five biggest risks and objections

| # | Risk / objection | Our answer |
|---|---|---|
| 1 | **Reps won't adopt it** (extra time, "another app", sell-in incentives) | Count only flagged SKUs at flagged outlets; ≤4 extra minutes is a pilot stop criterion; embed in the existing SFA; Healthy Sales Scorecard (growth stays 50%); credit for ₹ rescued |
| 2 | **Data is poor** (no POS in general trade, missing batches, stale counts) | Stock-flow sell-out; batch dates printed on every pack (Cosmetics Rules 2020); confidence weighting; "verify first" locks costly actions |
| 3 | **Unintended consequences** (discount habit, brand dilution, channel conflict, under-ordering) | Discount is step 6 of 8; never for Luxe/Derma; transfers only within the authorised network and capped at recipient capacity; never dump short-dated stock on quick commerce; growth-guardrail KPI vs control |
| 4 | **"We already have systems"** (SFA/DMS, central demand sensing) | SMARTSELL is a decision and workflow layer the current SFA can host; it feeds outlet sell-out and channel-shift signals into demand planning |
| 5 | **Benefits are overstated** | Only the case percentages are sourced; three scenarios with a break-even conservative case; double-counting rules stated; pilot with stop criteria |

---

## 4. Likely judge questions and recommended answers

Answer in three beats: **direct answer → evidence or number → what the pilot does about it.**

1. **"We already have an SFA and DMS. Why do we need this?"** Those tools capture orders and distributor stock. What's missing is the decision layer: batch-level risk at the outlet, a sanctioned action menu with approvals, and a recount that verifies the outcome. SMARTSELL's rules and workflow can be configured inside your current SFA; the prototype exists to prove the logic.
2. **"Where's the AI?"** Deliberately rules-first, so a sales director can audit every number. ML comes in phase 3, where it earns its place: forecasts for sparse SKUs and learning which intervention works where. L'Oréal already runs central demand sensing; we feed it outlet signals it can't see today.
3. **"Reps visit 20 outlets a day. They won't count stock."** They count only the 5–10 SKUs flagged from distributor invoices, and only at flagged outlets. Batch dates are printed on every pack by law. Four minutes is our target and a stop criterion.
4. **"How do you know retailer sell-out without POS?"** Stock-flow: last count + deliveries − today's count. It's noisy, so every number carries a confidence level and low confidence locks costly actions.
5. **"Won't this push reps to discount everything?"** The opposite. Discount is step 6 of 8, never for Luxe or Derma, only from the approved scheme catalogue and with ASM approval. Most recommended actions cost ₹0.
6. **"Doesn't a transfer just move the problem?"** Only if you send too much. Quantity is capped at what the recipient can sell before its own buffer date. In the demo, Glow Chemist can absorb 180 units; we send 66.
7. **"What about quick commerce? That's where L'Oréal is growing."** We detect when an outlet's sell-out falls while the brand grows online, tighten general-trade orders there, and hand off to the quick-commerce key-account team. Fresh stock follows demand online; ageing stock is rebalanced within general trade and never dumped online at a discount.
8. **"Where does ₹18 cr come from?"** From the case's 1.5% + 1% applied to about ₹5,900 cr (L'Oréal India FY25 net sales, rounded). Only about 36% is in the rep's reach, and we assume a quarter of that is prevented, plus a modest stock-out benefit valued at margin. The conservative case breaks even. That's why we ask for a pilot.
9. **"What does 'capped at 1.5%' mean to you?"** It's ambiguous: a returns allowance, or the observed level. If it's a cap, real channel waste may be higher, with distributors absorbing the excess. It's the first question we'd ask your finance team.
10. **"How will you get reps to care?"** The Healthy Sales Scorecard: secondary sales stays at 50%, and sell-through health, availability and execution are added. It runs as a shadow scorecard in the pilot first.
11. **"Is the prototype data real?"** No. All data is synthetic, the brands are fictional, and the app is not connected to any L'Oréal system. The numbers are internally consistent and built to demonstrate the logic.
12. **"What's the biggest risk?"** Adoption. That's why time-per-visit and completion rate are explicit pilot stop criteria.

---

## 5. Final quality check (per slide)

Each main slide was checked against: addresses the case · business logic correct · readable in 10 seconds · evidence or insight · advances the narrative · clear hierarchy · numbers consistent · commercially relevant.

**Numbers that must stay consistent across slides:**
- **Case figures:** ≈1.5% + ≈1%.
- **Illustrative pool:** ₹148 cr (₹147.5 cr in the model).
- **Shree example:** ₹14,700 at risk, 75 days to act, transfer of 66 units, ₹840 left, ₹13,860 rescued.
- **Simulation:** returned ₹16,416 vs ₹30,276; lost sales ₹1,526 vs ₹37,900; returns 0.86% vs 1.62% of sell-out.
- **Base case:** ₹8.0 + ₹5.3 − ₹2.0 + ₹6.9 = ₹18.2 cr; 3-year ROI ≈204%; conservative ≈1%; optimistic ≈584%.
- **Pilot:** 16 weeks, ~600 outlets, ~12 reps, 40 SKUs, ≈₹50 lakh.

**Sources to re-verify before external use:** see `../sources.md` ("Verify before deck" column). In particular, the 2002 global out-of-stock study and any figure that was checked only from search summaries.

---

## 6. Full speaker script (identical to the slide notes)

### Slide 1: SMARTSELL

Good morning. We're presenting SMARTSELL.

Our one-line idea is on the slide: move from selling more inventory INTO the channel, to moving the right inventory to the right customer, at the right place and time.

On the right is our working product, on a phone, because that's where it lives: in the hands of a L'Oréal sales rep standing in a shop. Everything you'll see today runs live at smartsell-loreal.vercel.app, on synthetic data.

In twelve minutes we'll show you the problem, its root cause, how SMARTSELL works, a live demo, the business case and a pilot that proves it or stops it.

### Slide 2: Less waste and more growth come from the same move: acting on the shelf before the order

The whole story on one page.

The problem: about 1.5% of revenue comes back as returned, expired or damaged stock, and another 1% goes on handling it. Those are the case's numbers. The obvious fix, ordering less, just creates stock-outs.

The root cause: waste is decided at the order and discovered at the return. In between, the rep is in that shop many times, and nothing in the visit asks them to act. Quick commerce is making this worse.

Our solution, SMARTSELL, gives every rep a four-minute routine that catches the problem early and fixes it cheaply.

The impact: around 18 crore a year in our base case, clearly labelled as an estimate. And our ask is small: a 16-week pilot.

### Slide 3: Every expired unit was sold once, and paid for twice

Here's the system. L'Oréal books revenue when stock moves into distributors: that's sell-in. The money is only real when a consumer buys it off the shelf: that's sell-out.

The coloured strip shows what each part of the chain can see. The ERP sees the depot. The distributor's system sees totals, but rarely how old each batch is. And at the retailer, where waste actually happens, nobody sees batch age or real sales, except the rep who walks in every week.

When sell-in and sell-out drift apart, stock ages and comes back. The case puts that at about 1.5% of revenue, plus 1% to handle it. At L'Oréal India's scale, that's roughly 148 crore a year, if those percentages apply. Every one of those units was made, shipped and advertised, then shipped back and destroyed.

### Slide 4: Waste is a visibility and execution problem, not just a forecasting problem

Why does stock go bad? We mapped six root causes and rated how much a rep can influence each.

Forecasting matters, but central forecasting can't see an outlet's shelf. The big levers are ones the rep controls: how orders are sized, which range each outlet carries, whether old batches go to the front, and whether anyone acts on what they see.

And why not simply order less? Dabur tried that publicly last year: it stopped shipping for over a week to cut distributor stock from 30 to 21 days, and took a revenue hit. A global study found about one in three shoppers who hit an empty shelf switch brand or don't buy at all.

So the insight at the bottom is the heart of our pitch. Waste is decided at the order and discovered at the return, and nothing in today's visit closes that gap.

### Slide 5: SMARTSELL turns every visit into early detection and the right action

SMARTSELL is a field sales intelligence and inventory intervention system for L'Oréal's existing on-ground salesforce.

It takes data L'Oréal already has (distributor stock and invoices), adds what only the rep can capture (a quick count, the batch date printed on every pack, and simple signals like dust or unopened cartons), and runs it through four connected modules.

Stock Intelligence captures it. The Risk Engine turns it into rupees at risk and days left to act. The Action Engine recommends the cheapest sanctioned fix. Manager Intelligence closes the loop.

Five reasons this is the right answer, along the bottom: it answers the case directly; it uses the salesforce L'Oréal already pays for; it protects growth and cuts waste with the same move; it's measurable; and you can try it today.

### Slide 6: A closed loop the rep runs in about four extra minutes per flagged outlet

This is how it works in practice: a closed loop of capture, detect, recommend, execute, measure and learn.

The bottom row answers the case's first question directly: where in a visit can you spot slow or ageing stock? We found six moments. Before walking in, the phone already shows the five to ten SKUs predicted to be at risk from distributor invoices. Then a shelf walk, a look in the back room for unopened cartons and old batch codes, three quick questions to the retailer, and finally the order moment, where the guardrail stops new waste being created.

The rep only counts flagged SKUs, at flagged outlets. Our design target is four extra minutes, and if the pilot shows more, that's a stop signal.

### Slide 7: Twelve simple signals, routed to the person who can fix them

The case asks: which simple signals, and flagged to whom? Here's our answer.

On the left are twelve signals a rep can see without any technology: dust, unopened cartons, the same count as last week, an old MRP sticker, a product hidden behind the counter. We added a twelfth that matters more every month: "shoppers say they buy it on quick commerce."

On the right is where each flag goes. The rep fixes shelf-level issues on the spot. The distributor executes transfers. The ASM approves anything with a cost. If the same SKU is slow in three or more outlets, that's a range problem for the brand team, not the rep. And channel shift goes to the quick-commerce key-account team.

One rule matters: a signal can lower our sales estimate, but only real batch data can trigger a near-expiry alert. That keeps false alarms down.

### Slide 8: Rupees at risk and days to act, not a black-box score

We deliberately didn't build a black-box AI score. A sales director should be able to audit every number in five minutes.

For each SKU we compute three things. First, how many units won't sell in time: batches sell oldest-first, and each can only sell until thirty days before expiry. Second, what those units are worth. Third, how many days are left to act.

Take a real example from the prototype: Shree Beauty has 120 bottles of shampoo selling 20 a month, expiring in 105 days. Seventy won't sell in time: ₹14,700 at risk, 75 days to act. Tick "caught 150 days earlier" in the what-if lab and the risk drops to zero. That's the value of early detection.

The states on the bottom left each get a different playbook, including a new one: channel shift, when an outlet is losing demand to quick commerce.

### Slide 9: Cheapest fix first: near-expiry needs speed, slow-moving needs diagnosis

The case's second question: what actions move slow stock, and how is near-expiry different from slow-moving?

On the left is our intervention ladder. The cheapest, least brand-risky steps come first: verify, rotate the shelf, pause re-orders of that one SKU, move stock to a faster outlet, then demand activation like testers and sampling. Discounting is step six of eight, and never for Luxe or dermatology brands. That protects brand equity and avoids the channel conflict distributors have publicly complained about.

The table answers near-expiry versus slow-moving. They're different problems. Near-expiry is about speed: where can this sell before it's too late? Slow-moving is about diagnosis: why isn't it selling here? Discounting a slow mover just hides the cause.

The screenshot shows exactly this in the product: ranked actions, each with a reason, an effect, a cost and an owner.

### Slide 10: Four outlets, four different right answers

Here's what that looks like in four real-looking outlets from our prototype.

At Shree Beauty, shampoo is near expiry: ₹14,700 at risk. The retailer wants 24 more; SMARTSELL says pause that SKU. Two kilometres away, Glow Chemist is eight days from running out of the same shampoo. One approved transfer of 66 units: no discount, no return, no lost sale. Risk drops to ₹840.

At Sai Kirana, a premium serum is slow but has plenty of shelf life. That's a diagnosis problem: it's in the wrong outlet. Move it to the counter, stop re-ordering, and send some to a chemist where it sells. No discount.

At Powai Wellness, the risk is the opposite: a stock-out. We replenish to demand, not to the retailer's habitual ask.

And at the luxury counter, a discount request is blocked by the brand guardrail.

### Slide 11: Quick commerce becomes a planning signal, not a source of waste

Quick commerce is the force that makes this problem urgent now.

NielsenIQ reports that in India's top eight metros, about 18% of FMCG sales are already online, and over three-quarters of that is quick commerce. L'Oréal itself has named quick commerce a priority. But dark stores hold only days of stock, so when demand moves online, the old volumes keep flowing into general-trade distributors and age there. That's exactly what happened at Dabur.

Our approach has four steps. Detect: when an outlet's sales fall while the brand grows online, that's demand moving, not dying. Resize: the order guardrail tightens for that SKU at that outlet. Hand off: the rep flags it to the quick-commerce key-account team. Route: fresh stock follows demand online, while ageing stock stays in general trade. We never dump it online at a discount, which is what distributors have publicly objected to.

### Slide 12: A working product, not a concept: the rep's visit end to end

This is the actual product, running today. Every screen here is a real screenshot.

One: the rep's day, with outlets ranked by rupees at stake. Two: Smart Count, with a simulated barcode and batch scan and the twelve signals. Three: "why it's flagged", in plain English, batch by batch. Four: ranked actions the rep can accept, modify or reject with a reason. Five: the order guardrail, showing what the retailer asked for against what will actually sell. Six: the manager's approval queue, with guardrail checks attached.

You can try it yourself at smartsell-loreal.vercel.app. There's a five-minute judge guide built in, and it works on a phone.

[If presenting live: switch to the demo here. Follow the judge guide: Shree Beauty, count, why flagged, accept the transfer, order, approve as manager, fast-forward a quarter.]

### Slide 13: In simulation, the same stock produces half the returns and far fewer empty shelves

Does it work? We built a side-by-side simulation into the product. Same starting stock, two worlds, fast-forwarded one quarter.

In the business-as-usual world, retailers re-order "same as last time" and nothing is rebalanced. In the SMARTSELL world, orders follow the guardrail and approved actions execute. With just the one hero transfer accepted, returns roughly halve, and lost sales from empty shelves almost disappear.

Interestingly, the business-as-usual world lands at about 1.6% of sell-out returned, close to the case's 1.5% figure, which suggests the model behaves realistically. SMARTSELL brings it to about 0.9%.

To be clear: this is a synthetic simulation, not a forecast. Its job is to show the mechanism. The pilot's job is to measure the real number.

### Slide 14: Base case: ≈₹18 cr a year net, with honest bounds

Now the money, with honest bounds.

We start from the case's pools: 2.5% of revenue, roughly 147 crore at L'Oréal India's scale. But we don't claim it all. Only about a third arises in channels and causes a rep can influence, and we assume a quarter of that can be prevented.

The waterfall shows the base case: 8 crore of expiry loss avoided, 5.3 crore of handling avoided, minus 2 crore to actually move the stock, plus 6.9 crore of contribution from fewer stock-outs, valued at margin, not revenue. Net: about 18 crore a year.

We avoid double counting: stock rescued by a transfer is counted once, never again as extra sales.

The conservative case only breaks even. We're showing you that on purpose. It's why we're asking for a pilot, not a national roll-out.

### Slide 15: A 16-week pilot that proves it, or stops it

How do we get from prototype to proof? A 16-week pilot that either proves it or stops it.

Two cities: Mumbai, where quick commerce is strongest, and one tier-2 city where general trade dominates. Four test distributors against four matched controls, about 600 outlets, a dozen reps, and forty focus SKUs chosen from past returns and top sellers.

Training is light: a one-day workshop and two ride-along days. The technology is our prototype, hardened and fed by a weekly distributor-data extract, or configured inside L'Oréal's existing SFA if the vendor allows.

On the right is the decision rule, agreed up front. If at-risk stock doesn't fall at least 20% versus control without hurting growth, we stop. The budget is about 50 lakh, and what it buys is evidence.

### Slide 16: One scorecard for growth and waste, owned by the sales line

How will management know it's working? Eight KPIs, deliberately balanced between waste and growth.

The waste side: return rate, at-risk inventory value, days of inventory and inventory recovered. The growth side: sell-through, stock-out rate and incremental contribution. And intervention completion, because the playbook only works if it's used.

The cadence is simple: reps daily, ASMs weekly, distributors and brand teams monthly, and sales leadership quarterly.

Most importantly, the incentive. Without changing what reps are paid for, no tool changes behaviour. Our Healthy Sales Scorecard keeps secondary sales at half the weight, so growth stays the priority, and adds sell-through health, availability and execution. In the pilot it runs as a shadow scorecard first.

### Slide 17: From order collection to intelligent demand and inventory management

Let me close with the shift we're proposing.

Today, a rep's job is to collect orders. With SMARTSELL, it becomes intelligent demand and inventory management: moving the right stock to the right shelf, catching waste while the fix is cheap, keeping discounts as a last resort, and treating quick commerce as a planning signal rather than a threat.

And every unit that sells instead of expiring is waste avoided at the very top of the waste hierarchy, before any recycling. That fits L'Oréal for the Future.

We didn't add a new team or a new system. We gave L'Oréal's existing salesforce a reason, a routine and a tool. Our ask is one data extract, two territories and sixteen weeks. Thank you; we'd love your questions.

### Slide 18: Evidence, methodology and Q&A

Appendix slides for Q&A. Jump to the relevant one when a judge asks about sources, the formula, the financial assumptions, playbooks, risks or alternatives.

### Slide 19: What is fact, what is research, what is our estimate

If asked "where does this number come from?", this slide separates case facts, dated research, our estimates and synthetic prototype data. The full register with URLs is in sources.md in our research folder.

### Slide 20: Every flag can be traced to five inputs and four parameters

Use this slide if a judge probes the formula or thresholds. Key message: every parameter is explicit and configurable, and the pilot calibrates them.

### Slide 21: Assumptions behind the ₹18 cr base case, and what moves it most

Walk through only if asked. The two assumptions that matter most are the waste-prevention rate and the stock-out reduction, which is exactly what the pilot is designed to measure.

### Slide 22: Each risk state gets its own sequence, cost and guardrail

Detail behind the action engine. Use if asked "what exactly does the rep do for X?"

### Slide 23: The five biggest risks to SMARTSELL, and how we address them

If a judge asks "what could go wrong?", answer with adoption first: it is the biggest risk, and it is why time-per-visit and completion rate are explicit pilot stop criteria.

### Slide 24: Short answers to the questions we expect

Keep answers to three beats: direct answer, evidence or number, what the pilot does about it.

### Slide 25: Why a hybrid beats a tech-only or process-only answer

Use if asked "why not just a better forecast?" or "why not just training?".

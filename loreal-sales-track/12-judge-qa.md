# 12 · Likely Judge Questions and Evidence-Based Answers

Tip: answer in three beats: **direct answer → evidence or number → what we'd do in the pilot.**

---

**1. "We already have an SFA and DMS. Why do we need this?"**
You almost certainly do, and we're not proposing to replace it. SFA and DMS tools are built to capture orders and distributor stock [S27]. What we found no public evidence of is the *decision layer*: batch-level risk at the outlet, a sanctioned action menu, and outcome tracking. SMARTSELL is a set of rules and a workflow your current SFA vendor can host. The standalone prototype exists only to prove the logic.

**2. "Isn't this just a fancy dashboard?"**
A dashboard tells a manager what went wrong last month. This tells a rep what to do in the next five minutes, records whether they did it, and recounts to check it worked. The closed loop and the incentive are the product. The screens are just how it's delivered.

**3. "Where's the AI?"**
Deliberately mostly absent from the core. The risk logic is arithmetic that a sales director can audit: cover, shelf life, FEFO projection. We'd add ML only where it earns its keep: velocity forecasts for sparse SKUs and learning which intervention works where. L'Oréal already invests in central AI forecasting (Demand Sensing [S11]). We feed it outlet signals it can't see today.

**4. "Reps visit 20 outlets a day. They won't count stock."**
They don't count everything. Smart Count asks for only the 5–10 SKUs pre-flagged from distributor invoices, at outlets that have flags. Our design target is ≤ 4 extra minutes, which is a pilot kill criterion. Batch dates are printed on every pack by law [S25], so reading one takes seconds.

**5. "How do you know retailer sell-out without POS?"**
Stock-flow: last count + deliveries (from DMS invoices) − today's count = sales between visits. It's noisy, so every number carries a confidence level. Low-confidence flags trigger "verify first" and lock costly actions.

**6. "Won't this just push reps to discount everything?"**
The opposite. Discounting is level 6 of an 8-step ladder, is never allowed for Luxe or Derma, comes only from the approved scheme catalogue, and needs ASM approval. Most recommendations cost ₹0: rotation, placement, stopping replenishment of one SKU, or transfer. Distributors have publicly criticised the industry's discount dumping via q-comm [S21]. Our guardrails are designed to avoid exactly that.

**7. "Moving near-expiry stock to another retailer just moves the problem."**
Only if you send more than they can sell. Our transfer rule caps quantity at the recipient's sell-through capacity before *its* buffer date (velocity × days left − existing stock). In the demo, Glow Chemist can absorb 180 units in the window, and we send 66.

**8. "Your ₹18 crore. Where does it come from?"**
From the case's 1.5% + 1% applied to ~₹5,900 cr as a scale reference. We assume only ~36% of that is in the rep's reach, and that a quarter of the reachable part can be prevented. Add a modest stock-out reduction valued at contribution margin, not revenue. Every assumption is labelled, and the conservative case only breaks even. That's why we ask for a pilot, not a rollout.

**9. "What does 'capped at 1.5%' mean to you?"**
It's ambiguous: either a returns allowance or the observed level. If it's a cap, true channel waste may be higher and distributors absorb the excess, which also strains relationships [S22, S23]. It's the first question we'd ask your finance team.

**10. "What's different from what other teams will present?"**
Three things we can show live: rupees at risk instead of a black-box score; the "caught 5 months earlier" comparison (₹35k vs ₹9k); and one transfer that solves near-expiry waste and a stock-out together.

**11. "How does this work for salons or dermatology brands?"**
Same engine, different ladder. Salons: rebalancing via distributor and stylist education, with back-bar and retail stock tracked separately. Derma: no price promotions; chemist-to-chemist rebalancing and sampling. The brand tier is a parameter.

**12. "What about quick commerce? That's where growth is."**
Q-comm dark stores hold only days of cover [S19], so the waste builds up upstream in GT as demand shifts there [S18]. SMARTSELL helps GT adapt to that shift by rebalancing and resizing orders, instead of dumping stock online.

**13. "How will you get reps to care?"**
The Healthy Sales Scorecard: secondary sales stays at 50%, and sell-through health, availability and execution are added. It runs as a shadow (unpaid) scorecard in the pilot. Without changing what's rewarded, no tool will change behaviour.

**14. "What if distributors won't cooperate on transfers?"**
Show them their own benefit: cash released from slow stock, fewer disputed returns, better ROI. HUL's Shikhar got distributor buy-in by incentivising them to serve app orders [S20]. We'd budget transfer logistics in the pilot.

**15. "What's the biggest risk to this working?"**
Adoption. If it adds time or doesn't change the incentive, reps will ignore it. That's why both are explicit pilot kill criteria.

**16. "Is the data real?"**
No. All prototype data is synthetic and labelled as such. We have no access to L'Oréal systems. The SKU names are fictional, the numbers are internally consistent, and the scenarios are built to show the logic.

**17. "How is the sustainability impact measured?"**
Units of finished product saved from return or destruction, verified by recount, then converted to packaging weight and reverse-logistics movements using L'Oréal's own pack-weight data in the pilot. Preventing expiry sits at the top of the waste hierarchy: it avoids the waste rather than recycling it [S12, S16].

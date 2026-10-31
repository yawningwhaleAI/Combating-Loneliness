# SMARTSELL deck redesign: change log and content flags

**Files**
- `SMARTSELL_LOreal_Sales_Track_2026_Redesign.pptx`: redesigned, editable deck (25 slides, same order, speaker notes carried over word for word).
- `SMARTSELL_LOreal_Sales_Track_2026_Redesign_preview.pdf`: PDF preview.
- `SMARTSELL_LOreal_Sales_Track_2026.pptx`: previous version, kept for reference.
- `build/build-redesign.js`: the generator (theme, layouts, native charts and tables).

---

## 1. Design change log

### Design system
| Element | Before | After |
|---|---|---|
| Palette | Burgundy, gold, red, blue, amber accents | Your palette only: burgundy `#65172F`, charcoal `#171717`, ivory `#F7F5F1`, stone `#A9A096`, muted green `#327B60`, white, plus burgundy and stone tints for data |
| Colour meaning | Varied by slide | Fixed everywhere: **burgundy = waste/risk and brand emphasis · green = positive outcome, growth, sustainability · stone = baseline, business-as-usual, neutral · charcoal = structure and text** |
| Headlines | Cambria serif, centred, 30pt | **Aptos Display** bold, left-aligned, 30pt; consistent position on every content slide |
| Body / labels / metrics | Calibri | **Aptos** body (13–16pt), tracked small-caps labels (10.5–11pt), large Aptos Display metrics (32–72pt) |
| Grid | Mixed margins | 0.7" side margins, one title zone, one footnote zone, consistent footer (SMARTSELL + slide number) |
| Logo | None | L'Oréal logo on **every slide**: black on light slides, white on burgundy and charcoal; paired with "Sustainability Challenge 2026 · Sales Track" on the cover and closing slides, so it reads as a competition submission |
| Backgrounds | White with beige cards | White and ivory content slides, burgundy cover and close, charcoal product showcase and appendix divider |
| Cards and icons | Beige cards and burgundy icon circles on most slides | Removed almost everywhere. Structure now comes from whitespace, hairline dividers, diagrams and large type; icons survive only in the supply-chain nodes |

**Font note:** you offered Manrope/Inter or Aptos. I used **Aptos Display / Aptos** because they ship with Microsoft 365, while Manrope and Inter would fall back to other fonts on a laptop without them installed. They are the deck's **theme fonts**, so you can swap them in one place: Design → Variants → Fonts.

**Beautiful.ai:** the connector was available but not used. It generates decks from an outline with its own layouts and images, which conflicts with the brief's rules: preserve content exactly, use only genuine screenshots, use native editable charts in this design system. It would also have sent the full deck to a third-party service. Happy to make a Beautiful.ai version separately if you want one.

### Slide by slide
| # | Redesign |
|---|---|
| 1 | Full-bleed burgundy cover: oversized SMARTSELL wordmark, positioning line, value proposition, live URL; a laptop and phone mockup built from shapes, showing **real app screenshots** |
| 2 | Executive summary as a Problem → Insight → Solution → Impact timeline with one big statement per stage; "The ask" as a burgundy band |
| 3 | The supply chain is the dominant visual. A tinted "where inventory gets stuck" zone covers distributor and retailer, with visibility labels under each node and a dashed return path. Three large metrics sit below without cards |
| 4 | Root causes as a **fishbone (cause-and-effect) diagram**: rep-controllable causes on the lower bones in burgundy, less-controllable ones on the upper bones in stone; "why order less fails" column; key insight as a typographic line |
| 5 | Architecture as four connected modules (burgundy-to-charcoal progression) between an inputs column and a "who acts on it" column; five pillars as one line |
| 6 | Six visit moments as a horizontal time bar with time allocations, plus the loop sequence and three large metrics |
| 7 | **Retailer shelf illustration** built from shapes, with 12 numbered callouts and a matching legend; a clean responsibility matrix (● owns/approves, ○ proposes/informed) |
| 8 | **Risk simulator** as the dominant visual: three large metrics, a FEFO bar (50 sell vs 70 at risk) on a dated timeline, the "caught 150 days earlier" bar, and the real what-if lab screenshot as proof |
| 9 | **Decision tree** separating near-expiry, ageing, slow/overstock and stock-out, then the 8-step ladder as a green → stone → burgundy band |
| 10 | Four **before → after case studies** with large before and after metrics |
| 11 | **Channel-shift diagram** (demand moving to quick commerce while supply stays on old norms), the four-step approach, and an evidence strip with sources |
| 12 | Charcoal **product-launch slide**: large browser-framed screenshot with four numbered annotations, phone mockup, two supporting screenshots, QR code and live URL |
| 13 | Large native comparison chart plus four prominent outcome metrics |
| 14 | **Native waterfall chart** (stacked columns with an invisible base) ending at ₹18.2 cr, a large headline metric, and the scenario table with the base column highlighted |
| 15 | **Gantt timeline** with a green week-16 decision gate (diamond and dashed line), scale/stop criteria, and the pilot design facts |
| 16 | Four-part **KPI scorecard** (Growth, Waste, Availability, Execution), the Healthy Sales Scorecard as a weighted bar, and the governance cadence |
| 17 | Minimal burgundy close: one big statement, four from → to shifts, the ask, the URL and a QR code |
| 18–25 | Clean appendix: charcoal divider with A–G index; readable native tables (10.5–13pt) with zebra striping; risks as a numbered three-column list; Q&A as a two-column grid |

### Small copy edits made only for layout (meaning unchanged)
- Slide 2 headings condense existing sentences ("≈2.5% of revenue" = the case's ≈1.5% + ≈1%; "A 4-minute visit routine").
- Slide 6 adds "0 min extra at healthy outlets" and "5–10 SKUs counted". Both come from the existing concept (`05-product-concept.md`) and the original slide 6 text.
- Slide 8 shows the batch's sell-by and expiry dates (16 Jan 2027 / 15 Feb 2027) taken from the prototype.
- Slide 9's leaf headings carry their rule ("≤90 days to act", ">2× norm", "≤14 days").
- Slide 10's "after" column uses short labels for existing outcomes ("₹0 discount", "Shelf full", "No price cut").
- Slide 16 adds "Visit time added ≤4 min", which is the existing pilot criterion from slide 15.
- The manager-overview screenshot moved from slide 13 to slide 12.
- Appendix G title shortened to fit one line.

### Quality checks run
- Office schema/structure validator: **passed**.
- All 25 slides rendered and inspected; overlaps, clipping and wrapping fixed over three passes.
- No placeholder text; speaker notes on every slide.
- **Rendering caveat:** the preview was rendered with LibreOffice, which substitutes Inter for Aptos. PowerPoint with Aptos should fit equal or tighter, but give the deck one pass in PowerPoint before presenting.

---

## 2. Content inconsistencies identified (NOT changed)

| # | Where | Issue | Suggestion |
|---|---|---|---|
| 1 | Slide 3 vs slide 14 / Appendix C | The pool is **≈₹148 cr** on slide 3 (2.5% × ₹5,925 cr) but **₹147.5 cr** on slide 14 and in the model (2.5% × ₹5,900 cr, rounded). Both are labelled, but the numbers differ | Use one base everywhere (₹5,900 cr → ₹147.5 cr, or ₹5,925 cr → ₹148 cr) |
| 2 | Slides 4, 11, Appendix A | "Dabur **halted** primary sales for 7–8 days". The brokerage source says it **largely stopped** primary sales | Change to "largely stopped" |
| 3 | Appendix B title | "five inputs and **four parameters**", but the table lists **six** parameter rows (channel-shift norm and confidence were added later) | Retitle, e.g. "Every flag can be traced to explicit inputs and parameters" |
| 4 | Slides 2, 6, 16 | "4-minute routine" / "≤4 min", but the six indicative stage times add to **4–4.5 min** (30 + 60–90 + 60 + 60 + 30 s) | Say "about 4–4½ minutes", or trim a stage time |
| 5 | Slide 15 | Phases overlap (Validate months 4–7, Optimise months 5–9) without saying the overlap is deliberate | Add "phases overlap" or adjust the months |
| 6 | Slides 4, 9, Appendix A/C | Out-of-stock figures (≈8% average; ≈1 in 3 shoppers switch or don't buy) come from a **2002 global study** not re-verified in this session | Verify the source or drop the figure |
| 7 | Slide 14 | "≈3.2 lakh units saved" relies on an assumed ₹250 average unit value; the slide footnote only says "all other inputs are assumptions" | Add "(at ₹250/unit, assumed)" if space allows |
| 8 | Several | Some research claims were checked only against search summaries, not full documents (see `../sources.md`) | Re-open the "verify before deck" sources in a session with web access |

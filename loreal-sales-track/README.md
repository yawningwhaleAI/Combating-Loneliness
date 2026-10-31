# SMARTSELL: L'Oréal Sustainability Challenge 2026 (Sales Track)

Research, validation, solution design, prototype specification and deck strategy for **"Selling Smarter: Building a High-Impact Sales Engine with Reduced Waste."**

**Start with `00-executive-summary.md`.**

| # | File | Contents |
|---|---|---|
| 00 | `00-executive-summary.md` | Plain-English problem, **GO (with refinements)** verdict, concept, top 5 risks, demo features, roadmap, decisions needed |
| 01 | `01-company-industry-research.md` | L'Oréal India business, brands, channels, field-sales model, causes of waste, existing systems, sustainability |
| 02 | `02-problem-diagnosis.md` | Supply-chain map, sell-in vs sell-out, inventory lifecycle, definitions, pain points, gaps, why not cut orders, problem tree |
| 03 | `03-benchmarks.md` | Dabur, HUL Shikhar, AICPDF, SFA/DMS vendors, image recognition, L'Oréal initiatives, competitive positioning |
| 04 | `04-solution-validation.md` | Nine hard questions, 4-approach scoring matrix, why hybrid wins |
| 05 | `05-product-concept.md` | Value proposition, visit routine, 12 signals + escalation, modules, 8-step ladder, 5 playbooks, incentives |
| 06 | `06-personas-journeys.md` | Personas, rep / manager / distributor journeys, interview guide |
| 07 | `07-prototype-spec.md` | Stack, IA, data model, synthetic dataset + seeded scenarios, every screen with validation and states, demo script, P0–P2 |
| 08 | `08-risk-methodology.md` | Transparent FEFO risk engine: formulas, parameters, thresholds, transfer matching, worked examples, limitations |
| 09 | `09-financial-model.md` | Cost pools, addressable share, 3 scenarios, double-count rules, ROI, sensitivity, sustainability, pilot economics |
| 10 | `10-kpis-pilot.md` | KPI tree and definitions, pilot design, success and kill criteria, data questions for L'Oréal, scale roadmap |
| 11 | `11-deck-blueprint.md` | 12-slide blueprint: action titles, evidence, visuals, speaker notes, appendix |
| 12 | `12-judge-qa.md` | 17 likely judge questions with evidence-based answers |
| — | `sources.md` | Source register with dates, URLs, reliability grades and verification flags |
| — | `model/risk_engine_reference.py` | Reference risk engine (reproduces every worked example) |
| — | `model/financial_model.py`, `model/scenarios.csv` | Reproducible business case |
| — | **`smartsell-app/`** | **Working prototype** (Next.js). Live at https://smartsell-loreal.vercel.app. See its README. |

**Labels used throughout:** **[F]** sourced fact (with source ID) · **[A]** assumption · **[H]** hypothesis to test · **[R]** recommendation.
**Data:** no L'Oréal internal data was used. All prototype data is synthetic.

```bash
cd loreal-sales-track/model && python3 -I risk_engine_reference.py && python3 -I financial_model.py
```

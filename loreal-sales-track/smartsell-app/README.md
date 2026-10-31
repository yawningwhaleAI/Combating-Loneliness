# SMARTSELL prototype

Field sales intelligence and inventory intervention for L'Oréal's on-ground salesforce. Built for the L'Oréal Sustainability Challenge 2026, Sales Track.

> **Synthetic data only.** Brands (Lumea, Verdé, Chroma, DermaPure, Salon Pro, Maison Éclat), outlets, people and numbers are fictional. The app is not connected to any L'Oréal system. The case figures (~1.5% returns, ~1% handling) come from the brief.

## What judges can do

| Role | Screens | Try this |
|---|---|---|
| **Sales Rep** (Kunal, Ananya, Farhan) | Today's beat · Outlet visit (Brief → Smart Count → Actions → Order → Summary) · SKU "Why flagged" + What-if lab · My actions | Count stock with the simulated barcode scan, tick field signals, drag the expiry and sales sliders, try **"Caught 150 days earlier"**, accept / modify / reject recommendations, override the order guardrail |
| **Sales Manager** (Meera) | Overview (KPIs, trend, risk register, repeat offenders) · Approvals (with guardrail checks) · Team (Healthy Sales Scorecard) · Outcomes (SMARTSELL vs business-as-usual) | Approve the transfer, reject the luxe discount, escalate a repeat-offender SKU, fast-forward a quarter |
| **Distributor** | Godown ageing by batch · Transfer tasks · Suggested primary order | Find the hidden near-expiry batch, mark a transfer delivered |
| Everyone | How it works (formulas + calculator) · Judge guide (9 steps, ticks automatically) · Fast-forward (+14 d / +4 wk / +1 quarter) · Reset | |

### 5-minute demo path
1. Landing → **Start the 5-minute guided demo** (or pick Kunal).
2. **Shree Beauty & Cosmetics** (#1 by ₹ at risk) → Start visit → Smart Count the shampoo (scan, tick "unopened cartons", save).
3. **Why flagged**: ~70 of 120 units won't sell before the buffer, so ₹14,700 is at risk with 75 days to act. Tick *Caught 150 days earlier* to see the risk drop to ₹0.
4. **Actions**: accept *Transfer 66 units to Glow Chemist* (which is about to run out). This goes to ASM approval because it's over ₹10,000.
5. **Order**: the retailer asks for 24 more and the guardrail suggests 0. Place the order.
6. Switch to **Manager** → Approvals: approve the transfer, then reject the Maison Éclat discount (it's blocked by the luxe guardrail anyway).
7. **Fast-forward +1 quarter** → Outcomes: returned stock, lost sales and units saved, against business-as-usual.

## How it works
- `lib/engine.ts`: the transparent risk rules (FEFO projected unsold, ₹ at risk, days to act, stock-out risk, confidence, priority). Matches `../08-risk-methodology.md` and `../model/risk_engine_reference.py`.
- `lib/recommend.ts`: the 8-step intervention ladder with brand-tier guardrails, transfer matching capped at recipient capacity, and the order guardrail.
- `lib/simulate.ts`: 7-day ticks, run in two worlds side by side. **SMARTSELL** uses guardrail orders, executes approved actions and applies intervention uplifts. **Business-as-usual** applies the retailer's current ask and habitual re-orders. Orders follow a fortnightly beat. Stock that crosses its sell-by buffer is returned (counted as waste).
- `data/seed.ts`: deterministic synthetic Mumbai network (3 territories, 3 distributors, 18 outlets, 24 SKUs) with seeded scenarios S1–S7.
- `store/useStore.ts`: Zustand store, saved to `localStorage`, with an in-memory fallback. **Reset** restores Day 0.

Everything runs in the browser: no backend, no API keys, nothing that can fail mid-demo.

## Run locally
```bash
npm install
```
```bash
npm run dev
```
Open http://localhost:3000.

## Test
```bash
npm test
```
```bash
npm run typecheck
```
The unit tests check the methodology's worked examples, the seeded scenarios, the luxe guardrail, and that SMARTSELL beats business-as-usual in the simulation.

## Deploy to Vercel
1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `loreal-sales-track/smartsell-app`. The framework is detected as Next.js; no environment variables are needed.
3. Deploy. Every judge gets their own independent demo state, stored in their own browser.

Or with the CLI, from this folder:
```bash
npx vercel --prod
```

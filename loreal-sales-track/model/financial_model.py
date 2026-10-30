"""Illustrative SMARTSELL business case. Every input is an ASSUMPTION unless tagged SOURCED.
Run: python3 -I financial_model.py   (prints markdown tables, writes scenarios.csv)
"""
import csv

REVENUE_CR = 5900          # SOURCED (scale reference): L'Oreal India FY25 net sales ~Rs 5,925 cr (PTI, Oct 2025), rounded
LOSS_PCT = 0.015           # SOURCED from case: return/expired/damaged ~1.5% of revenue
HANDLING_PCT = 0.010       # SOURCED from case: handling/reverse logistics/destruction ~1% of revenue
OOS_RATE = 0.08            # ASSUMPTION anchored on global avg ~8.3% OOS (Gruen, Corsten & Bharadwaj 2002) - not India data
BRAND_LOSS_SHARE = 0.35    # ASSUMPTION anchored on Gruen et al. 2002: ~26% switch brand + ~9% do not buy
CONTRIB_MARGIN = 0.35      # ASSUMPTION: contribution margin on incremental sell-in after variable trade/distribution costs

SCENARIOS = {
    #                field-covered share, sales-influenceable share, reduction, cost-to-recover, OOS reduction, Y1 cost cr, run cost cr
    "Conservative": dict(f=0.50, s=0.50, r=0.15, ctr=0.35, q=0.10, impl=9.0, run=3.0),
    "Base":         dict(f=0.60, s=0.60, r=0.25, ctr=0.25, q=0.20, impl=7.5, run=2.5),
    "Optimistic":   dict(f=0.70, s=0.65, r=0.35, ctr=0.20, q=0.30, impl=6.0, run=2.0),
}
Y1_REALISATION = 0.5       # ASSUMPTION: pilot + phased rollout means half of steady-state benefit in year 1

rows = []
for name, a in SCENARIOS.items():
    loss_pool = REVENUE_CR * LOSS_PCT
    handling_pool = REVENUE_CR * HANDLING_PCT
    addressable_loss = loss_pool * a["f"] * a["s"]
    addressable_handling = handling_pool * a["f"] * a["s"]
    loss_avoided = addressable_loss * a["r"]
    handling_avoided = addressable_handling * a["r"]
    recovery_cost = loss_avoided * a["ctr"]             # transfers, approved bundles, sampling to move the stock
    oos_incr_rev = REVENUE_CR * a["f"] * OOS_RATE * BRAND_LOSS_SHARE * a["q"]
    oos_contrib = oos_incr_rev * CONTRIB_MARGIN
    steady_net = loss_avoided + handling_avoided - recovery_cost + oos_contrib
    y1_benefit = steady_net * Y1_REALISATION
    y1_cost = a["impl"] + a["run"]
    y2_net = steady_net - a["run"]
    rows.append({
        "Scenario": name,
        "Loss pool (cr)": loss_pool, "Handling pool (cr)": handling_pool,
        "Addressable loss (cr)": addressable_loss, "Addressable handling (cr)": addressable_handling,
        "Loss avoided (cr)": loss_avoided, "Handling avoided (cr)": handling_avoided,
        "Recovery cost (cr)": recovery_cost,
        "Incremental sell-in from fewer OOS (cr)": oos_incr_rev, "Contribution on it (cr)": oos_contrib,
        "Steady-state net benefit/yr (cr)": steady_net,
        "Y1 benefit (cr)": y1_benefit, "Y1 cost (cr)": y1_cost, "Y1 ROI %": (y1_benefit - y1_cost) / y1_cost,
        "Y2 net after run cost (cr)": y2_net,
        "3-yr benefit (cr)": y1_benefit + 2 * steady_net, "3-yr cost (cr)": a["impl"] + 3 * a["run"],
        "3-yr ROI %": (y1_benefit + 2 * steady_net - a["impl"] - 3 * a["run"]) / (a["impl"] + 3 * a["run"]),
        "Loss+handling avoided as % revenue": (loss_avoided + handling_avoided) / REVENUE_CR,
    })

keys = list(rows[0].keys())
with open("scenarios.csv", "w", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=keys); w.writeheader()
    for r in rows:
        w.writerow({k: (round(v, 4) if isinstance(v, float) else v) for k, v in r.items()})

def fmt(k, v):
    if isinstance(v, str): return v
    if "%" in k: return f"{v*100:.0f}%" if "ROI" in k else f"{v*100:.2f}%"
    return f"{v:.1f}"

print("| Metric | " + " | ".join(r["Scenario"] for r in rows) + " |")
print("|---|" + "---|" * len(rows))
for k in keys[1:]:
    print(f"| {k} | " + " | ".join(fmt(k, r[k]) for r in rows) + " |")

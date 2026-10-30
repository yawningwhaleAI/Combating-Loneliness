"""Reference implementation of the SMARTSELL SKU risk logic.

The prototype will port this to TypeScript. Keeping a tiny, dependency-free
version here lets anyone reproduce the worked examples in 08-risk-methodology.md.
Run:  python3 -I risk_engine_reference.py
"""
from dataclasses import dataclass, field
from math import ceil

# ---- Configurable parameters (ASSUMPTIONS - to be calibrated with L'Oreal) ----
PARAMS = {
    "retailer": {"msb_days": 30, "target_cover": 30, "lead_days": 7, "safety_days": 7, "overstock_mult": 2.0},
    "distributor": {"msb_days": 120, "target_cover": 21, "lead_days": 7, "safety_days": 5, "overstock_mult": 2.0},
}
SOURCE_WEIGHT = {"scan": 1.0, "dms": 1.0, "manual_count": 0.85, "retailer_verbal": 0.5, "estimate": 0.4}


@dataclass
class Batch:
    qty: float
    days_to_expiry: float


@dataclass
class SkuPosition:
    name: str
    node: str                 # "retailer" | "distributor"
    monthly_sales: float      # units / 30 days
    unit_value: float         # Rs per unit at this node (PTR or distributor price)
    batches: list = field(default_factory=list)
    source: str = "manual_count"
    count_age_days: int = 0


def recency(age):
    return 1.0 if age <= 7 else 0.8 if age <= 30 else 0.5


def urgency(days):
    if days is None:
        return 0.0
    return 1.0 if days <= 30 else 0.8 if days <= 60 else 0.6 if days <= 90 else 0.4 if days <= 180 else 0.2


def evaluate(p: SkuPosition):
    cfg = PARAMS[p.node]
    v = p.monthly_sales / 30.0
    qty = sum(b.qty for b in p.batches)
    doc = qty / v if v > 0 else float("inf")

    # FEFO projection: each batch can only sell until (expiry - minimum sellable buffer)
    t, waste_units, first_waste_window = 0.0, 0.0, None
    for b in sorted(p.batches, key=lambda b: b.days_to_expiry):
        window = b.days_to_expiry - cfg["msb_days"]
        sellable = max(0.0, v * (window - t)) if v > 0 else 0.0
        sold = min(b.qty, sellable)
        w = b.qty - sold
        if w > 1e-9:
            waste_units += w
            first_waste_window = max(0.0, window) if first_waste_window is None else first_waste_window
            t = max(t, window)
        else:
            t += sold / v
    value_at_risk = waste_units * p.unit_value

    reorder_point = cfg["lead_days"] + cfg["safety_days"]
    lost_units = max(0.0, v * (cfg["lead_days"] + cfg["safety_days"] - doc)) if v > 0 else 0.0
    suggested_order = 0 if waste_units > 0 else max(0, ceil(v * (cfg["target_cover"] + cfg["lead_days"]) - qty))

    confidence = SOURCE_WEIGHT[p.source] * recency(p.count_age_days)

    if waste_units > 0 and first_waste_window <= 90:
        state = "NEAR_EXPIRY"
    elif waste_units > 0:
        state = "AGEING_RISK"
    elif v > 0 and doc <= reorder_point:
        state = "STOCKOUT_RISK"
    elif v == 0 and qty > 0:
        state = "DORMANT"
    elif doc > cfg["target_cover"] * cfg["overstock_mult"]:
        state = "OVERSTOCK"
    else:
        state = "HEALTHY"

    at_stake = value_at_risk if waste_units > 0 else lost_units * p.unit_value
    u = urgency(first_waste_window) if waste_units > 0 else (1.0 if state == "STOCKOUT_RISK" else 0.2)
    return {
        "sku": p.name, "state": state, "qty": qty, "velocity_per_day": round(v, 2),
        "days_of_cover": round(doc, 1) if doc != float("inf") else "inf",
        "projected_waste_units": round(waste_units, 1), "value_at_risk_rs": round(value_at_risk),
        "action_window_days": None if first_waste_window is None else round(first_waste_window),
        "stockout_lost_units_next_cycle": round(lost_units, 1), "suggested_order": suggested_order,
        "confidence": round(confidence, 2), "rs_at_stake": round(at_stake),
        "priority_rs": round(at_stake * u * (0.5 + 0.5 * confidence)),
    }


if __name__ == "__main__":
    examples = [
        SkuPosition("A: Shampoo X @ Andheri retailer", "retailer", 25, 210, [Batch(180, 45)], "manual_count", 0),
        SkuPosition("B: Conditioner Y @ Bandra retailer", "retailer", 15, 240, [Batch(80, 240)], "manual_count", 0),
        SkuPosition("C: Face Wash Z @ Powai retailer", "retailer", 60, 180, [Batch(20, 300)], "scan", 0),
        # Same as A, but caught 150 days earlier (expiry 195 days away)
        SkuPosition("A-early: Shampoo X caught 150 days earlier", "retailer", 25, 210, [Batch(180, 195)], "manual_count", 0),
        # Distributor with two batches: older batch at risk, newer one fine
        SkuPosition("D: Hair colour shade @ distributor", "distributor", 300, 260, [Batch(900, 200), Batch(1200, 520)], "dms", 2),
        # Low-confidence data: retailer told the rep verbally, count is 40 days old
        SkuPosition("E: Serum @ kirana (verbal, stale)", "retailer", 3, 520, [Batch(24, 480)], "retailer_verbal", 40),
    ]
    for e in examples:
        print(evaluate(e))

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, BarChart3, Boxes, ClipboardCheck, Factory, Gauge, Leaf, PackageSearch, ShieldCheck, Sparkles, Store, Truck, User, Users, Zap,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui';
import { REPS, DISTRIBUTORS } from '@/data/seed';
import type { Role } from '@/lib/types';

const REASONS = [
  { icon: ClipboardCheck, title: 'Directly addresses the case', text: 'The brief asks for early detection and on-ground intervention. SMARTSELL does both on every visit, rather than offering a generic inventory dashboard.' },
  { icon: Users, title: 'Empowers the existing salesforce', text: "L'Oréal already has people visiting distributors and retailers. No new team, no new network. We make the reps already there more effective." },
  { icon: Gauge, title: 'Balances growth and sustainability', text: 'Replenish where demand is high, intervene where stock is ageing. The same system protects sales and prevents waste.' },
  { icon: BarChart3, title: 'Measurable', text: 'Every flag carries rupees at risk, every action is tracked to an outcome, and every result is compared with business-as-usual.' },
  { icon: Sparkles, title: 'Demonstrable', text: 'Pick a retailer, inspect stock, see why a SKU is flagged, act on it, and watch the manager view update. Try it below.' },
];

const MODULES = [
  { icon: PackageSearch, name: 'Stock Intelligence', text: 'Pre-visit brief from distributor data, Smart Count, batch and expiry capture, simulated barcode scan, 12 field signals, stock-flow sell-out.' },
  { icon: Zap, name: 'Risk Engine', text: 'Transparent rules: days of cover, FEFO projected waste, days left to act, stock-out risk, data confidence. Rupees, not a black box.' },
  { icon: ShieldCheck, name: 'Action Engine', text: 'An 8-step intervention ladder with brand guardrails, transfer matching across outlets, an order guardrail, approvals and execution tracking.' },
  { icon: BarChart3, name: 'Manager Intelligence', text: 'Territory risk, approvals queue, repeat-offender SKUs, rep scorecards, and outcomes against business-as-usual.' },
];

export default function Landing() {
  const setRole = useStore((s) => s.setRole);
  const setRep = useStore((s) => s.setRep);
  const setDistributor = useStore((s) => s.setDistributor);
  const setGuideOpen = useStore((s) => s.setGuideOpen);
  const router = useRouter();

  const go = (role: Role, href: string) => { setRole(role); router.push(href); };

  return (
    <div className="space-y-12">
      {/* 1. Problem statement first */}
      <section className="overflow-hidden rounded-3xl bg-ink px-6 py-10 text-white sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">The problem · Sales Track case</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
          Every expired unit was sold once, and paid for twice.
        </h1>
        <p className="mt-3 max-w-2xl text-white/75">
          L&apos;Oréal&apos;s field teams must keep growing sales while stopping stock from ageing, expiring or coming back as returns,
          <b className="text-white"> without simply cutting orders</b> and causing stock-outs.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { k: '~1.5%', v: 'of revenue lost to returned, expired or damaged stock', s: 'Case data' },
            { k: '~1%', v: 'more spent on handling, reverse logistics and destruction', s: 'Case data' },
            { k: 'Cut orders?', v: 'Empty shelves send shoppers to another brand, so growth suffers', s: 'Why the obvious fix fails' },
          ].map((x) => (
            <div key={x.k} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <div className="text-3xl font-bold text-gold">{x.k}</div>
              <div className="mt-1 text-sm text-white/85">{x.v}</div>
              <div className="mt-2 text-[11px] uppercase tracking-wide text-white/45">{x.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Sell-in vs sell-out and the insight */}
      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <h2 className="text-lg font-semibold">Sell-in is not sell-out</h2>
          <p className="mt-1 text-sm text-ink-mute">L&apos;Oréal books revenue when stock moves into the channel. It only becomes real when a consumer buys it.</p>
          <div className="mt-5 grid grid-cols-4 items-center gap-2 text-center text-xs">
            {[{ i: Factory, t: "L'Oréal", s: 'sell-in' }, { i: Truck, t: 'Distributor', s: 'weeks of stock' }, { i: Store, t: 'Retailer', s: 'shelf + back room' }, { i: User, t: 'Consumer', s: 'sell-out' }].map((n, idx) => (
              <div key={n.t} className="relative">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand"><n.i size={22} /></div>
                <div className="mt-1.5 font-medium text-ink">{n.t}</div>
                <div className="text-ink-mute">{n.s}</div>
                {idx < 3 && <ArrowRight size={16} className="absolute -right-2 top-4 text-slate-300" />}
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2 text-[11px]">
            <div className="col-span-1 rounded-lg bg-emerald-50 p-2 text-emerald-800">Visible in ERP</div>
            <div className="col-span-1 rounded-lg bg-amber-50 p-2 text-amber-800">Partly visible (DMS)</div>
            <div className="col-span-2 rounded-lg bg-red-50 p-2 text-red-800"><b>Blind spot:</b> batch age and real sell-out at the outlet. Only the rep standing in the shop can see it.</div>
          </div>
        </Card>
        <Card className="flex flex-col justify-center p-6 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Root insight</p>
          <p className="mt-2 text-xl font-semibold leading-snug">Waste is decided when the order is taken and discovered when the return arrives.</p>
          <p className="mt-2 text-sm text-ink-mute">In between, the rep visits that shop many times. Today nothing asks them to look for ageing stock, tells them what they may do about it, or rewards them for doing it.</p>
        </Card>
      </section>

      {/* 2b. Evidence from public research */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Grounded in public research (India)</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { k: 'Cutting orders costs growth', v: 'When channel shift left GT distributors overstocked, one large Indian FMCG company largely halted primary sales for 7–8 days to cut stock from ~30 to ~21 days, and guided to a revenue decline.', s: 'Brokerage notes on Dabur Q2 FY25, Oct 2024' },
            { k: 'Demand is moving to quick commerce', v: 'E-commerce reached ~18% of FMCG sales in the top-8 metros, over three-quarters of it quick commerce, while kirana volumes grew ~1%. L\'Oréal itself is prioritising quick commerce.', s: 'NielsenIQ Q4 2025 · Business Standard, Oct 2026' },
            { k: 'Discount dumping creates conflict', v: 'The distributors\' federation (AICPDF) accused FMCG firms of offloading near-expiry stock through quick commerce at deep discounts, and raised unsettled return claims.', s: 'Storyboard18, Nov 2024 · Inc42' },
            { k: 'Expiry is printed on every pack', v: 'Cosmetics Rules 2020 require a "use before" or expiry date on the label, so a rep can capture batch age in seconds, without new hardware.', s: 'CDSCO Cosmetics Rules 2020 (amended 2025)' },
          ].map((x) => (
            <Card key={x.k} className="p-5">
              <h3 className="text-sm font-semibold">{x.k}</h3>
              <p className="mt-1 text-sm text-ink-mute">{x.v}</p>
              <p className="mt-2 text-[11px] uppercase tracking-wide text-ink-mute/80">{x.s}</p>
            </Card>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-mute">SMARTSELL&apos;s design answers each of these: SKU-level guardrails instead of blanket cuts, rebalancing and order resizing for channel shift, discounts as a guarded last resort, and Smart Count of printed batch dates. Full sources: research folder, sources.md.</p>
      </section>

      {/* 3. The solution */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Our solution</p>
        <h2 className="mt-1 text-2xl font-bold">SMARTSELL: field sales intelligence and inventory intervention, for the rep on the ground</h2>
        <p className="mt-2 max-w-3xl text-ink-soft">
          It turns every distributor and retailer visit into early detection plus the right action: stock goes where it will sell, and shelves stay full where demand is high.
          It works in the rep&apos;s day, on the rep&apos;s phone, with a closed loop to the manager.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m, i) => (
            <Card key={m.name} className="p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand"><m.icon size={18} /></span>
                <span className="text-xs font-semibold text-ink-mute">0{i + 1}</span>
              </div>
              <h3 className="mt-3 font-semibold">{m.name}</h3>
              <p className="mt-1 text-sm text-ink-mute">{m.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Why it works */}
      <section>
        <h2 className="text-xl font-bold">Why SMARTSELL is the right answer</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {REASONS.map((r, i) => (
            <Card key={r.title} className="p-5">
              <r.icon size={20} className="text-brand" />
              <h3 className="mt-2 text-sm font-semibold">{i + 1}. {r.title}</h3>
              <p className="mt-1 text-sm text-ink-mute">{r.text}</p>
            </Card>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Leaf size={16} className="text-emerald-600" /> We demonstrate reductions in</h3>
            <ul className="mt-2 grid grid-cols-2 gap-1 text-sm text-ink-soft">
              <li>• Inventory at risk of expiry</li><li>• Expired and damaged inventory</li><li>• Product returns</li><li>• Unnecessary replenishment</li>
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Boxes size={16} className="text-blue-600" /> And improvements in</h3>
            <ul className="mt-2 grid grid-cols-2 gap-1 text-sm text-ink-soft">
              <li>• Retailer sell-through</li><li>• Product availability</li><li>• Salesperson productivity</li><li>• Revenue from recovered inventory</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* 5. Try it */}
      <section id="try">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Try it: choose a role</h2>
            <p className="text-sm text-ink-mute">Synthetic Mumbai network: 3 territories, 3 distributors, 18 outlets, 24 SKUs across mass, professional, derma and luxe.</p>
          </div>
          <button onClick={() => { setRole('rep'); setGuideOpen(true); router.push('/rep'); }}
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            <Sparkles size={16} /> Start the 5-minute guided demo
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <User className="text-brand" />
            <h3 className="mt-2 font-semibold">Sales Representative</h3>
            <p className="mt-1 text-sm text-ink-mute">Plan the beat, visit outlets, count stock, see risks, act, and order smart.</p>
            <div className="mt-3 space-y-2">
              {REPS.map((r) => (
                <button key={r.id} onClick={() => { setRep(r.id); go('rep', '/rep'); }} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm hover:border-brand hover:bg-brand-soft/40">
                  <span><b>{r.name}</b> · {r.title}</span><ArrowRight size={14} />
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <Users className="text-brand" />
            <h3 className="mt-2 font-semibold">Sales Manager (ASM)</h3>
            <p className="mt-1 text-sm text-ink-mute">Territory risk, approvals with guardrails, team scorecards, and outcomes against business-as-usual.</p>
            <button onClick={() => go('manager', '/manager')} className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm hover:border-brand hover:bg-brand-soft/40">
              <span><b>Meera</b> · Area Sales Manager, Mumbai</span><ArrowRight size={14} />
            </button>
          </Card>
          <Card className="p-5">
            <Truck className="text-brand" />
            <h3 className="mt-2 font-semibold">Distributor</h3>
            <p className="mt-1 text-sm text-ink-mute">Godown ageing by batch, transfer tasks to execute, and suggested primary orders.</p>
            <div className="mt-3 space-y-2">
              {DISTRIBUTORS.map((d) => (
                <button key={d.id} onClick={() => { setDistributor(d.id); go('distributor', '/distributor'); }} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm hover:border-brand hover:bg-brand-soft/40">
                  <span><b>{d.name}</b></span><ArrowRight size={14} />
                </button>
              ))}
            </div>
          </Card>
        </div>
        <p className="mt-6 text-center text-xs text-ink-mute">
          All brands (Lumea, Verdé, Chroma, DermaPure, Salon Pro, Maison Éclat), outlets, people and numbers are fictional. Case figures (~1.5%, ~1%) come from the L&apos;Oréal Sales Track brief.
          See <Link className="underline" href="/method">How it works</Link> for every formula and assumption.
        </p>
      </section>
    </div>
  );
}

"use client";

import { Info } from "lucide-react";
import { useEffect } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BUSINESS_ID } from "@/components/business/business-shell";
import { OccupancyChart } from "@/components/business/occupancy-chart";
import { Annotation, Badge, Card, SectionTitle, Stat } from "@/components/ui";
import { businessMetrics } from "@/lib/business";
import { fmtDate, inrPlain } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

const axis = { fontSize: 11, fill: "#646b84" };

export default function Analytics() {
  const plans = useDemo((s) => s.plans);
  const now = useDemo((s) => s.now);
  const setFlag = useDemo((s) => s.setFlag);
  useEffect(() => setFlag("visitedAnalytics"), [setFlag]);
  const m = businessMetrics(plans, BUSINESS_ID, now);
  const money = m.settlements.map((s) => ({ label: s.date.slice(5).replace("-", "/"), gmv: s.gmv, net: s.net, commission: s.commission }));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-[30px] font-semibold">Analytics</h1>
          <Annotation label="Business monetisation" />
        </div>
        <p className="mt-1 text-[15px] text-muted">What After Hours generated for Kettle & Kin, and what it cost.</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warn-soft px-3 py-1 text-[12px] font-semibold text-warn">
          <Info className="size-3.5" /> Illustrative demo data, not real commercial results
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Bookings generated" value={m.bookings} />
        <Stat label="GMV" value={inrPlain(m.gmv)} hint="Total booking value" />
        <Stat label="Platform commission" value={inrPlain(m.commission)} hint="12% of GMV" />
        <Stat label="Net settlement" value={inrPlain(m.net)} hint="Paid to the café" />
        <Stat label="Capacity utilisation" value={`${Math.round(m.historicUtilisation * 100)}%`} hint="Past sessions" />
        <Stat label="Repeat participation" value={`${Math.round(m.repeatRate * 100)}%`} hint="Came back again" />
      </div>

      <Card className="p-5">
        <SectionTitle title="How the money flows" sub="Members pay the experience price only. The café pays an agreed commission on bookings." />
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ["Member pays", "₹299", "per booking, no platform fee"],
            ["GMV", inrPlain(m.gmv), "all bookings to date"],
            ["After Hours keeps", inrPlain(m.commission), "12% booking commission"],
            ["Café receives", inrPlain(m.net), "net settlement"],
          ].map(([k, v, sub], i) => (
            <div key={k} className="relative rounded-2xl bg-canvas p-4">
              <div className="text-[12px] font-semibold text-muted">{k}</div>
              <div className="mt-1 font-display text-2xl font-semibold">{v}</div>
              <div className="text-[11.5px] text-muted">{sub}</div>
              {i < 3 && <span className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-lg text-subtle sm:block">→</span>}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Bookings and attendance" sub="Per session" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={m.sessions} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e6e8ee" />
              <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e8ee", fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="bookings" name="Bookings" fill="#141a33" radius={[5, 5, 0, 0]} />
              <Bar dataKey="attended" name="Attended" fill="#ffb35c" radius={[5, 5, 0, 0]} />
              <Bar dataKey="repeat" name="Repeat members" fill="#f2643a" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <SectionTitle title="GMV and net settlement" sub="Per session, ₹" />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={money} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
              <defs>
                <linearGradient id="gmv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f2643a" stopOpacity={0.25} />
                  <stop offset="1" stopColor="#f2643a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e6e8ee" />
              <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e8ee", fontSize: 12 }} formatter={(v) => inrPlain(Number(v))} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="gmv" name="GMV" stroke="#f2643a" strokeWidth={2} fill="url(#gmv)" />
              <Area type="monotone" dataKey="net" name="Net settlement" stroke="#141a33" strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle title="Capacity utilisation by hour" sub="Weekday occupancy before and after hosting sessions" />
        <OccupancyChart height={260} />
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-3 font-display text-base font-semibold">Settlements</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wide text-muted">
                <th className="px-5 py-2 font-semibold">Session</th>
                <th className="px-2 py-2 text-right font-semibold">Bookings</th>
                <th className="px-2 py-2 text-right font-semibold">GMV</th>
                <th className="px-2 py-2 text-right font-semibold">Commission</th>
                <th className="px-2 py-2 text-right font-semibold">Net</th>
                <th className="px-5 py-2 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line tabular-nums">
              {[...m.settlements].reverse().map((s) => (
                <tr key={s.planId}>
                  <td className="px-5 py-2.5">
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-[12px] text-muted">{fmtDate(s.date)}</div>
                  </td>
                  <td className="px-2 py-2.5 text-right">{s.bookings}</td>
                  <td className="px-2 py-2.5 text-right">{inrPlain(s.gmv)}</td>
                  <td className="px-2 py-2.5 text-right text-muted">−{inrPlain(s.commission)}</td>
                  <td className="px-2 py-2.5 text-right font-semibold">{inrPlain(s.net)}</td>
                  <td className="px-5 py-2.5 text-right">
                    <Badge tone={s.status === "paid" ? "ok" : "warn"}>{s.status === "paid" ? "Paid" : "Scheduled"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

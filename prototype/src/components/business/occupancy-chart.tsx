"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { KETTLE_OCCUPANCY } from "@/data/seed";

/** Café occupancy by hour, before and after After Hours sessions (illustrative). */
export function OccupancyChart({ height = 240 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={KETTLE_OCCUPANCY} barGap={2} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e6e8ee" />
        <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#646b84" }} axisLine={false} tickLine={false} />
        <YAxis unit="%" tick={{ fontSize: 11, fill: "#646b84" }} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip cursor={{ fill: "rgba(20,26,51,.04)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e6e8ee", fontSize: 12 }} formatter={(v) => `${v}% occupied`} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="before" name="Before After Hours" fill="#c9cdd9" radius={[5, 5, 0, 0]} />
        <Bar dataKey="after" name="With After Hours sessions" fill="#f2643a" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

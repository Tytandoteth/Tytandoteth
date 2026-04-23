"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#7c3aed", "#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#64748b", "#a855f7"];

export function CategoryPie({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={45} outerRadius={72} paddingAngle={2} stroke="hsl(var(--background))">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v: number, name) => [
            new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v),
            name,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

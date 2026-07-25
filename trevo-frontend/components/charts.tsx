"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#171717", "#a1a1aa", "#fafafa", "#52525b", "#71717a"];

export function BarChartComponent({ data, xKey, yKey }: { data: Array<Record<string, unknown>>; xKey: string; yKey: string }) {
  const chartData = useMemo(() => {
    return data.map((row) => ({
      [xKey]: String(row[xKey] ?? ""),
      [yKey]: Number(row[yKey]) || 0,
    }));
  }, [data, xKey, yKey]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#a1a1aa" />
        <YAxis tick={{ fontSize: 12 }} stroke="#a1a1aa" />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", fontSize: "12px" }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Bar dataKey={yKey} fill="#171717" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartComponent({ data, xKey, yKey }: { data: Array<Record<string, unknown>>; xKey: string; yKey: string }) {
  const chartData = useMemo(() => {
    return data.map((row) => ({
      [xKey]: String(row[xKey] ?? ""),
      [yKey]: Number(row[yKey]) || 0,
    }));
  }, [data, xKey, yKey]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#a1a1aa" />
        <YAxis tick={{ fontSize: 12 }} stroke="#a1a1aa" />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", fontSize: "12px" }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Line type="monotone" dataKey={yKey} stroke="#171717" strokeWidth={2} dot={{ fill: "#171717", r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PieChartComponent({ data, nameKey, valueKey }: { data: Array<Record<string, unknown>>; nameKey: string; valueKey: string }) {
  const chartData = useMemo(() => {
    return data.map((row) => ({
      name: String(row[nameKey] ?? ""),
      value: Number(row[valueKey]) || 0,
    }));
  }, [data, nameKey, valueKey]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#171717"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", fontSize: "12px" }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

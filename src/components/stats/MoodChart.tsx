"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MOOD_OPTIONS } from "@/types/diary";
import { DailyMoodRecord } from "@/types/stats";

interface MoodChartProps {
  records: DailyMoodRecord[];
}

const MOOD_INDEX: Record<string, number> = {
  alegria: 7,
  tristeza: 2,
  enojo: 1,
  miedo: 3,
  tedio: 4,
  ansiedad: 5,
  no_lo_se: 6,
};

interface ChartDataPoint {
  day: string;
  value: number;
  mood: string | null;
  color: string;
}

interface TooltipPayload {
  payload: ChartDataPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  if (!data.mood) return null;

  const option = MOOD_OPTIONS.find((m) => m.value === data.mood);
  if (!option) return null;

  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid var(--mc-border)",
        borderRadius: "0.5rem",
        padding: "0.5rem 0.75rem",
        fontSize: "0.8125rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ fontWeight: 600, color: option.color }}>{option.label}</p>
      <p style={{ color: "var(--mc-text-muted)", marginTop: "0.125rem" }}>Día {data.day}</p>
    </div>
  );
}

export default function MoodChart({ records }: MoodChartProps) {
  const data: ChartDataPoint[] = records.map((r) => {
    const option = r.mood ? MOOD_OPTIONS.find((m) => m.value === r.mood) : null;
    return {
      day: new Date(r.date + "T12:00:00").getDate().toString(),
      value: r.mood ? MOOD_INDEX[r.mood] : 0,
      mood: r.mood,
      color: option ? option.color : "var(--mc-border)",
    };
  });

  return (
    <div style={{ width: "100%", height: "180px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={10} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "var(--mc-text-muted)" }}
            axisLine={false}
            tickLine={false}
            interval={4}
          />
          <YAxis
            domain={[0, 8]}
            tick={false}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--mc-surface)" }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.mood ? entry.color : "#e2e8f0"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

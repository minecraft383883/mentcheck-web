"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { MOOD_OPTIONS } from "@/types/diary";
import { DailyMoodRecord } from "@/types/stats";

// ─── Gráfica por día ────────────────────────────────────────────────

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

interface DayDataPoint {
  day: string;
  value: number;
  mood: string | null;
  color: string;
}

interface DayTooltipProps {
  active?: boolean;
  payload?: { payload: DayDataPoint }[];
}

function DayTooltip({ active, payload }: DayTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  if (!data.mood) return null;
  const option = MOOD_OPTIONS.find((m) => m.value === data.mood);
  if (!option) return null;
  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", fontSize: "0.8125rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <p style={{ fontWeight: 600, color: option.color }}>{option.label}</p>
      <p style={{ color: "var(--mc-text-muted)", marginTop: "0.125rem" }}>Día {data.day}</p>
    </div>
  );
}

export function MoodDayChart({ records }: MoodChartProps) {
  const data: DayDataPoint[] = records.map((r) => {
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
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--mc-text-muted)" }} axisLine={false} tickLine={false} interval={4} />
          <YAxis domain={[0, 8]} tick={false} axisLine={false} tickLine={false} />
          <Tooltip content={<DayTooltip />} cursor={{ fill: "var(--mc-surface)" }} />
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

// ─── Gráfica de frecuencia ──────────────────────────────────────────

interface MoodFreqChartProps {
  moodCounts: Record<string, number>;
  chartType: "bar" | "pie";
}

interface FreqTooltipProps {
  active?: boolean;
  payload?: { payload: { mood: string; count: number; color: string; label: string; emoji: string } }[];
}

function FreqTooltip({ active, payload }: FreqTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", fontSize: "0.8125rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <p style={{ fontWeight: 600, color: d.color }}>{d.emoji} {d.label}</p>
      <p style={{ color: "var(--mc-text-muted)", marginTop: "0.125rem" }}>{d.count} {d.count === 1 ? "vez" : "veces"}</p>
    </div>
  );
}

export function MoodFreqChart({ moodCounts, chartType }: MoodFreqChartProps) {
  const data = MOOD_OPTIONS
    .filter((o) => (moodCounts[o.value] ?? 0) > 0)
    .map((o) => ({
      mood: o.value,
      label: o.label,
      emoji: o.emoji,
      count: moodCounts[o.value] ?? 0,
      color: o.color,
    }))
    .sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return (
      <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
        No hay registros este mes.
      </div>
    );
  }

  if (chartType === "pie") {
    return (
      <div style={{ width: "100%", height: "220px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={75}
              label={({ emoji, count }) => `${emoji} ${count}`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<FreqTooltip />} />
            <Legend
              formatter={(value) => {
                const opt = data.find((d) => d.label === value);
                return <span style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)" }}>{opt?.emoji} {value}</span>;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "180px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={28} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="emoji"
            tick={{ fontSize: 18 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--mc-text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<FreqTooltip />} cursor={{ fill: "var(--mc-surface)" }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Export default (retrocompatibilidad) ───────────────────────────
export default function MoodChart({ records }: MoodChartProps) {
  return <MoodDayChart records={records} />;
}

"use client";

import { useState, useEffect } from "react";
import { MoodDayChart, MoodFreqChart } from "@/components/stats/MoodChart";
import MonthSelector from "@/components/ui/MonthSelector";
import { MOOD_OPTIONS } from "@/types/diary";
import { MonthlyStats } from "@/types/stats";

type ChartMode = "dia" | "frecuencia";
type FreqType = "bar" | "pie";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getReinforcementPhrase(
  streak: number,
  daysWithEntry: number,
  percentage: number,
  dominantMood: string | null,
  isCurrentMonth: boolean
): { emoji: string; text: string; color: string; bg: string } {
  if (!isCurrentMonth) {
    if (daysWithEntry === 0)
      return { emoji: "📅", text: "No hubo registros ese mes.", color: "#718096", bg: "#f7fafc" };
    if (percentage >= 70)
      return { emoji: "💪", text: `Registraste el ${percentage}% de ese mes. ¡Muy constante!`, color: "#276749", bg: "#f0fff4" };
    return { emoji: "📃", text: `${daysWithEntry} días registrados ese mes.`, color: "#2c5282", bg: "#ebf8ff" };
  }
  if (streak >= 7)
    return { emoji: "🔥", text: `¡${streak} días seguidos registrando! Eso es dedicación real.`, color: "#c05621", bg: "#fffaf0" };
  if (streak >= 3)
    return { emoji: "⭐", text: `¡Llevas ${streak} días consecutivos! Sigue así.`, color: "#975a16", bg: "#fefcbf" };
  if (streak === 1)
    return { emoji: "✅", text: "Hoy ya registraste tu día. ¡Bien hecho!", color: "#276749", bg: "#f0fff4" };
  if (daysWithEntry === 0)
    return { emoji: "👋", text: "Aún no hay registros este mes. ¡Hoy es un buen día para empezar!", color: "#2b6cb0", bg: "#ebf8ff" };
  if (percentage >= 70)
    return { emoji: "💪", text: `Has registrado el ${percentage}% del mes. ¡Un mes muy constante!`, color: "#276749", bg: "#f0fff4" };
  if (dominantMood === "alegria")
    return { emoji: "😊", text: "La alegría ha dominado tu mes. ¡Qué buena noticia!", color: "#975a16", bg: "#fefcbf" };
  return { emoji: "📓", text: `${daysWithEntry} días registrados este mes. Cada registro cuenta.`, color: "#2c5282", bg: "#ebf8ff" };
}

// ─── Calendario de emociones ─────────────────────────────────────────────────

interface CalendarProps {
  year: number;
  month: number;
  records: { date: string; mood: string | null }[];
  isCurrentMonth: boolean;
}

function EmotionCalendar({ year, month, records, isCurrentMonth }: CalendarProps) {
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Dom
  // Convertir de Dom=0 a Lun=0
  const offset = (firstDayOfWeek + 6) % 7;

  const moodMap: Record<string, string | null> = {};
  records.forEach((r) => {
    const day = new Date(r.date + "T12:00:00").getDate();
    moodMap[day] = r.mood;
  });

  const weekDays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

  return (
    <div>
      {/* Cabecera días de semana */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "0.375rem" }}>
        {weekDays.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "var(--mc-text-muted)", padding: "0.25rem 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {/* Celdas vacías de offset */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Días del mes */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const mood = moodMap[day] ?? null;
          const option = mood ? MOOD_OPTIONS.find((m) => m.value === mood) : null;
          const isToday = isCurrentMonth &&
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;
          const isFuture = isCurrentMonth && day > today.getDate();

          return (
            <div
              key={day}
              title={option ? `${option.label}` : isFuture ? "" : "Sin registro"}
              style={{
                aspectRatio: "1",
                borderRadius: "0.5rem",
                backgroundColor: option ? option.bg : isFuture ? "transparent" : "#f7fafc",
                border: isToday
                  ? `2px solid var(--mc-primary)`
                  : option
                  ? `1px solid ${option.color}40`
                  : isFuture
                  ? "1px dashed #e2e8f0"
                  : "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1px",
                cursor: option ? "default" : "default",
                position: "relative",
              }}
            >
              <span style={{
                fontSize: "0.5625rem",
                fontWeight: isToday ? 700 : 400,
                color: isToday ? "var(--mc-primary)" : "var(--mc-text-muted)",
                lineHeight: 1,
              }}>
                {day}
              </span>
              {option ? (
                <span style={{ fontSize: "0.9375rem", lineHeight: 1 }}>{option.emoji}</span>
              ) : !isFuture ? (
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#cbd5e0" }} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getUTCMonth());
  const [selectedYear, setSelectedYear] = useState(now.getUTCFullYear());
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<ChartMode>("frecuencia");
  const [freqType, setFreqType] = useState<FreqType>("bar");

  useEffect(() => {
    fetchProgress(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  async function fetchProgress(month: number, year: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/progress?month=${month}&year=${year}`);
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (error) {
      console.error("Error al cargar progreso:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleMonthChange(month: number, year: number) {
    setSelectedMonth(month);
    setSelectedYear(year);
    setStats(null);
  }

  const isCurrentMonth =
    selectedMonth === now.getUTCMonth() && selectedYear === now.getUTCFullYear();

  if (loading) {
    return (
      <div style={{ padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 600, color: "var(--mc-text)", letterSpacing: "-0.01em" }}>Progreso</h1>
          <MonthSelector month={selectedMonth} year={selectedYear} onChange={handleMonthChange} />
        </div>
        <div style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>Cargando progreso...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: "2rem 1.5rem", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
        No se pudo cargar el progreso.
      </div>
    );
  }

  const dominantOption = stats.dominantMood
    ? MOOD_OPTIONS.find((m) => m.value === stats.dominantMood)
    : null;
  const recordsWithMood = stats.records.filter((r) => r.mood !== null);
  const percentage = Math.round((stats.daysWithEntry / stats.totalDays) * 100);
  const streak = stats.streak ?? 0;
  const phrase = getReinforcementPhrase(streak, stats.daysWithEntry, percentage, stats.dominantMood, isCurrentMonth);
  const moodCounts = stats.moodCounts ?? {};

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.375rem 0.875rem",
    borderRadius: "0.375rem",
    fontSize: "0.8125rem",
    fontWeight: active ? 500 : 400,
    color: active ? "var(--mc-primary)" : "var(--mc-text-muted)",
    backgroundColor: active ? "#fff" : "transparent",
    border: active ? "1px solid var(--mc-border)" : "1px solid transparent",
    cursor: "pointer",
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
    transition: "all 0.15s",
  });

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "720px" }}>

      {/* Encabezado + selector */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 600, color: "var(--mc-text)", letterSpacing: "-0.01em" }}>Progreso</h1>
        <MonthSelector month={selectedMonth} year={selectedYear} onChange={handleMonthChange} />
      </div>

      {/* Banner de refuerzo */}
      <div style={{ backgroundColor: phrase.bg, border: `1px solid ${phrase.color}30`, borderRadius: "0.75rem", padding: "0.875rem 1.125rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.375rem", flexShrink: 0 }}>{phrase.emoji}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "0.875rem", color: phrase.color, fontWeight: 500, lineHeight: 1.4 }}>{phrase.text}</p>
          {isCurrentMonth && streak >= 2 && (
            <p style={{ fontSize: "0.75rem", color: phrase.color, opacity: 0.75, marginTop: "0.2rem" }}>
              Racha actual: {streak} {streak === 1 ? "día" : "días"} consecutivos
            </p>
          )}
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.875rem", marginBottom: "1.75rem" }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "1.125rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", fontWeight: 500 }}>Días registrados</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--mc-primary)", lineHeight: 1.2, marginTop: "0.375rem" }}>{stats.daysWithEntry}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>de {stats.totalDays} días · {percentage}%</p>
        </div>

        {isCurrentMonth && streak > 0 && (
          <div style={{ backgroundColor: streak >= 3 ? "#fffbeb" : "#f0fff4", border: `1px solid ${streak >= 3 ? "#f6ad55" : "#68d391"}`, borderRadius: "0.75rem", padding: "1.125rem" }}>
            <p style={{ fontSize: "0.75rem", color: streak >= 3 ? "#975a16" : "#276749", fontWeight: 500 }}>Racha actual</p>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: streak >= 3 ? "#c05621" : "#276749", lineHeight: 1.2, marginTop: "0.375rem" }}>
              {streak} {streak === 1 ? "día" : "días"}
            </p>
            <p style={{ fontSize: "0.75rem", color: streak >= 3 ? "#975a16" : "#276749", marginTop: "0.25rem", opacity: 0.8 }}>
              {streak >= 7 ? "¡Racha excelente! 🔥" : streak >= 3 ? "¡Sigue así! ⭐" : "Buen inicio"}
            </p>
          </div>
        )}

        <div style={{ backgroundColor: dominantOption ? dominantOption.bg : "#f7fafc", border: `1px solid ${dominantOption ? dominantOption.color : "var(--mc-border)"}`, borderRadius: "0.75rem", padding: "1.125rem" }}>
          <p style={{ fontSize: "0.75rem", color: dominantOption ? dominantOption.color : "var(--mc-text-muted)", fontWeight: 500 }}>Emoción predominante</p>
          {dominantOption ? (
            <>
              <p style={{ fontSize: "1.375rem", fontWeight: 700, color: dominantOption.color, lineHeight: 1.2, marginTop: "0.375rem" }}>
                {dominantOption.emoji} {dominantOption.label}
              </p>
              <p style={{ fontSize: "0.75rem", color: dominantOption.color, marginTop: "0.25rem", opacity: 0.8 }}>
                {isCurrentMonth ? "Este mes" : "Ese mes"}
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--mc-text-muted)", lineHeight: 1.3, marginTop: "0.375rem" }}>Sin predominante</p>
              <p style={{ fontSize: "0.7rem", color: "var(--mc-text-muted)", marginTop: "0.25rem", opacity: 0.8, lineHeight: 1.4 }}>
                {stats.daysWithEntry === 0 ? "Aún no hay registros" : "Las emociones están variadas"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Gráfica con toggle */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "1.25rem 1.25rem 1rem", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)" }}>
            {chartMode === "dia" ? "Estado de ánimo por día" : "Frecuencia de emociones"}
          </h2>
          <div style={{ display: "flex", gap: "0.25rem", backgroundColor: "var(--mc-surface)", border: "1px solid var(--mc-border)", borderRadius: "0.5rem", padding: "0.2rem" }}>
            <button onClick={() => setChartMode("frecuencia")} style={tabStyle(chartMode === "frecuencia")}>Frecuencia</button>
            <button onClick={() => setChartMode("dia")} style={tabStyle(chartMode === "dia")}>Por día</button>
          </div>
        </div>

        {chartMode === "frecuencia" && recordsWithMood.length > 0 && (
          <div style={{ display: "flex", gap: "0.25rem", backgroundColor: "var(--mc-surface)", border: "1px solid var(--mc-border)", borderRadius: "0.5rem", padding: "0.2rem", marginBottom: "0.875rem", width: "fit-content" }}>
            <button onClick={() => setFreqType("bar")} style={tabStyle(freqType === "bar")}>📊 Barras</button>
            <button onClick={() => setFreqType("pie")} style={tabStyle(freqType === "pie")}>🥧 Circular</button>
          </div>
        )}

        {chartMode === "dia" ? (
          recordsWithMood.length === 0 ? (
            <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
              No hay registros este mes.
            </div>
          ) : (
            <MoodDayChart records={stats.records} />
          )
        ) : (
          <MoodFreqChart moodCounts={moodCounts} chartType={freqType} />
        )}

        {chartMode === "dia" && recordsWithMood.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", marginTop: "1rem", paddingTop: "0.875rem", borderTop: "1px solid var(--mc-border)" }}>
            {MOOD_OPTIONS.map((option) => (
              <div key={option.value} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: option.color, flexShrink: 0 }} />
                <span style={{ fontSize: "0.6875rem", color: "var(--mc-text-muted)" }}>{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendario de emociones */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "1.25rem", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)" }}>Calendario del mes</h2>
          <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
            {MOOD_OPTIONS.filter((o) => (moodCounts[o.value] ?? 0) > 0).map((o) => (
              <div key={o.value} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.75rem" }}>{o.emoji}</span>
                <span style={{ fontSize: "0.625rem", color: "var(--mc-text-muted)" }}>{o.label}</span>
              </div>
            ))}
          </div>
        </div>
        <EmotionCalendar
          year={selectedYear}
          month={selectedMonth}
          records={stats.records}
          isCurrentMonth={isCurrentMonth}
        />
      </div>

      {/* Lista de registros */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", overflow: "hidden" }}>
        <div style={{ padding: "1.125rem 1.25rem", borderBottom: "1px solid var(--mc-border)" }}>
          <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)" }}>Registro del mes</h2>
        </div>
        {recordsWithMood.length === 0 ? (
          <p style={{ padding: "2rem", textAlign: "center", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>No hay entradas registradas este mes.</p>
        ) : (
          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {recordsWithMood.slice().reverse().map((record) => {
              const option = MOOD_OPTIONS.find((m) => m.value === record.mood)!;
              return (
                <div key={record.date} style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--mc-border)" }}>
                  <span style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: option.bg, border: `1.5px solid ${option.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                    {option.emoji}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: option.color }}>{option.label}</p>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                    {formatDate(record.date)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

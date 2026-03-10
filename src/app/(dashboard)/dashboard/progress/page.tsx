"use client";

import { useState, useEffect } from "react";
import MoodChart from "@/components/stats/MoodChart";
import MonthSelector from "@/components/ui/MonthSelector";
import { MOOD_OPTIONS } from "@/types/diary";
import { MonthlyStats } from "@/types/stats";

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

export default function ProgressPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getUTCMonth());
  const [selectedYear, setSelectedYear] = useState(now.getUTCFullYear());
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);

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

        {/* Días registrados */}
        <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "1.125rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", fontWeight: 500 }}>Días registrados</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--mc-primary)", lineHeight: 1.2, marginTop: "0.375rem" }}>{stats.daysWithEntry}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>de {stats.totalDays} días · {percentage}%</p>
        </div>

        {/* Racha */}
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

        {/* Emoción predominante — solo si aparece más de 1 vez */}
        <div style={{
          backgroundColor: dominantOption ? dominantOption.bg : "#f7fafc",
          border: `1px solid ${dominantOption ? dominantOption.color : "var(--mc-border)"}`,
          borderRadius: "0.75rem",
          padding: "1.125rem",
        }}>
          <p style={{ fontSize: "0.75rem", color: dominantOption ? dominantOption.color : "var(--mc-text-muted)", fontWeight: 500 }}>
            Emoción predominante
          </p>
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
              <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--mc-text-muted)", lineHeight: 1.3, marginTop: "0.375rem" }}>
                Sin predominante
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--mc-text-muted)", marginTop: "0.25rem", opacity: 0.8, lineHeight: 1.4 }}>
                {stats.daysWithEntry === 0 ? "Aún no hay registros" : "Las emociones están variadas"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Gráfica */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "1.25rem 1.25rem 1rem", marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)", marginBottom: "1rem" }}>Estado de ánimo por día</h2>
        {recordsWithMood.length === 0 ? (
          <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
            No hay registros este mes.
          </div>
        ) : (
          <MoodChart records={stats.records} />
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", marginTop: "1rem", paddingTop: "0.875rem", borderTop: "1px solid var(--mc-border)" }}>
          {MOOD_OPTIONS.map((option) => (
            <div key={option.value} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: option.color, flexShrink: 0 }} />
              <span style={{ fontSize: "0.6875rem", color: "var(--mc-text-muted)" }}>{option.label}</span>
            </div>
          ))}
        </div>
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

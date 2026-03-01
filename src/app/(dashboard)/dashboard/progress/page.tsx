"use client";

import { useState, useEffect } from "react";
import MoodChart from "@/components/stats/MoodChart";
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
  dominantMood: string | null
): { emoji: string; text: string; color: string; bg: string } {
  // Racha prioritaria
  if (streak >= 7) {
    return {
      emoji: "🔥",
      text: `\u00a1${streak} d\u00edas seguidos registrando! Eso es dedicaci\u00f3n real.`,
      color: "#c05621",
      bg: "#fffaf0",
    };
  }
  if (streak >= 3) {
    return {
      emoji: "⭐",
      text: `\u00a1Llevas ${streak} d\u00edas consecutivos! Sigue as\u00ed.`,
      color: "#975a16",
      bg: "#fefcbf",
    };
  }
  if (streak === 1) {
    return {
      emoji: "✅",
      text: "Hoy ya registraste tu d\u00eda. \u00a1Bien hecho!",
      color: "#276749",
      bg: "#f0fff4",
    };
  }
  // Sin racha activa — motivar a empezar
  if (daysWithEntry === 0) {
    return {
      emoji: "👋",
      text: "A\u00fan no hay registros este mes. \u00a1Hoy es un buen d\u00eda para empezar!",
      color: "#2b6cb0",
      bg: "#ebf8ff",
    };
  }
  // Buen porcentaje
  if (percentage >= 70) {
    return {
      emoji: "💪",
      text: `Has registrado el ${percentage}% del mes. \u00a1Un mes muy constante!`,
      color: "#276749",
      bg: "#f0fff4",
    };
  }
  // Emocion predominante positiva
  if (dominantMood === "alegria") {
    return {
      emoji: "😊",
      text: "La alegr\u00eda ha dominado tu mes. \u00a1Qu\u00e9 buena noticia!",
      color: "#975a16",
      bg: "#fefcbf",
    };
  }
  // Default alentador
  return {
    emoji: "📓",
    text: `${daysWithEntry} d\u00edas registrados este mes. Cada registro cuenta.`,
    color: "#2c5282",
    bg: "#ebf8ff",
  };
}

export default function ProgressPage() {
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  async function fetchProgress() {
    try {
      const res = await fetch("/api/progress");
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (error) {
      console.error("Error al cargar progreso:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem 1.5rem", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
        Cargando progreso...
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
  const phrase = getReinforcementPhrase(streak, stats.daysWithEntry, percentage, stats.dominantMood);

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "720px" }}>
      {/* Encabezado */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 600, color: "var(--mc-text)", letterSpacing: "-0.01em" }}>
          Progreso
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>
          {stats.month} {stats.year}
        </p>
      </div>

      {/* Banner de refuerzo */}
      <div
        style={{
          backgroundColor: phrase.bg,
          border: `1px solid ${phrase.color}30`,
          borderRadius: "0.75rem",
          padding: "0.875rem 1.125rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <span style={{ fontSize: "1.375rem", flexShrink: 0 }}>{phrase.emoji}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "0.875rem", color: phrase.color, fontWeight: 500, lineHeight: 1.4 }}>
            {phrase.text}
          </p>
          {streak >= 2 && (
            <p style={{ fontSize: "0.75rem", color: phrase.color, opacity: 0.75, marginTop: "0.2rem" }}>
              Racha actual: {streak} {streak === 1 ? "d\u00eda" : "d\u00edas"} consecutivos
            </p>
          )}
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "0.875rem",
          marginBottom: "1.75rem",
        }}
      >
        <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "1.125rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", fontWeight: 500 }}>Dias registrados</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--mc-primary)", lineHeight: 1.2, marginTop: "0.375rem" }}>
            {stats.daysWithEntry}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>
            de {stats.totalDays} dias · {percentage}%
          </p>
        </div>

        {streak > 0 && (
          <div style={{ backgroundColor: streak >= 3 ? "#fffbeb" : "#f0fff4", border: `1px solid ${streak >= 3 ? "#f6ad55" : "#68d391"}`, borderRadius: "0.75rem", padding: "1.125rem" }}>
            <p style={{ fontSize: "0.75rem", color: streak >= 3 ? "#975a16" : "#276749", fontWeight: 500 }}>Racha actual</p>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: streak >= 3 ? "#c05621" : "#276749", lineHeight: 1.2, marginTop: "0.375rem" }}>
              {streak} {streak === 1 ? "d\u00eda" : "d\u00edas"}
            </p>
            <p style={{ fontSize: "0.75rem", color: streak >= 3 ? "#975a16" : "#276749", marginTop: "0.25rem", opacity: 0.8 }}>
              {streak >= 7 ? "\u00a1Racha excelente! 🔥" : streak >= 3 ? "\u00a1Sigue as\u00ed! ⭐" : "Buen inicio"}
            </p>
          </div>
        )}

        <div
          style={{
            backgroundColor: dominantOption ? dominantOption.bg : "#fff",
            border: `1px solid ${dominantOption ? dominantOption.color : "var(--mc-border)"}`,
            borderRadius: "0.75rem",
            padding: "1.125rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: dominantOption ? dominantOption.color : "var(--mc-text-muted)", fontWeight: 500 }}>
            Emocion predominante
          </p>
          <p style={{ fontSize: "1.375rem", fontWeight: 700, color: dominantOption ? dominantOption.color : "var(--mc-text-muted)", lineHeight: 1.2, marginTop: "0.375rem" }}>
            {dominantOption ? dominantOption.emoji + " " + dominantOption.label : "Sin datos"}
          </p>
          <p style={{ fontSize: "0.75rem", color: dominantOption ? dominantOption.color : "var(--mc-text-muted)", marginTop: "0.25rem", opacity: 0.8 }}>
            Este mes
          </p>
        </div>
      </div>

      {/* Grafica mensual */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "1.25rem 1.25rem 1rem", marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)", marginBottom: "1rem" }}>
          Estado de animo por dia
        </h2>
        {recordsWithMood.length === 0 ? (
          <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
            Registra tu primer dia para ver la grafica.
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

      {/* Lista detallada */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", overflow: "hidden" }}>
        <div style={{ padding: "1.125rem 1.25rem", borderBottom: "1px solid var(--mc-border)" }}>
          <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)" }}>Registro del mes</h2>
        </div>
        {recordsWithMood.length === 0 ? (
          <p style={{ padding: "2rem", textAlign: "center", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
            No hay entradas registradas este mes.
          </p>
        ) : (
          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {recordsWithMood
              .slice()
              .reverse()
              .map((record) => {
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

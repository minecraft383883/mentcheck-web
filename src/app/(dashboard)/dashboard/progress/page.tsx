"use client";

import { useState } from "react";
import MoodChart from "@/components/stats/MoodChart";
import { MOOD_OPTIONS, Mood } from "@/types/diary";
import { MonthlyStats } from "@/types/stats";

// Datos de ejemplo hasta conectar la base de datos en Fase 3
function generateSampleStats(): MonthlyStats {
  const moods: (Mood | null)[] = [
    "alegria", "alegria", null, "tedio", "ansiedad",
    "alegria", null, "tristeza", "tedio", "ansiedad",
    "alegria", "alegria", "miedo", null, "tedio",
    "alegria", "ansiedad", "alegria", null, "tristeza",
    "tedio", "alegria", "alegria", null, "ansiedad",
    "alegria", "tristeza", null,
  ];

  const year = 2026;
  const month = 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const records = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const mood = moods[i] ?? null;
    return { date, mood, hasNote: mood !== null && i % 3 !== 0 };
  });

  const moodCounts: Record<string, number> = {};
  records.forEach((r) => {
    if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
  });

  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Mood | null;
  const daysWithEntry = records.filter((r) => r.mood !== null).length;

  return {
    month: "Febrero",
    year,
    records,
    dominantMood,
    daysWithEntry,
    totalDays: daysInMonth,
  };
}

const STATS = generateSampleStats();

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function ProgressPage() {
  const [stats] = useState<MonthlyStats>(STATS);

  const dominantOption = stats.dominantMood
    ? MOOD_OPTIONS.find((m) => m.value === stats.dominantMood)
    : null;

  const recordsWithMood = stats.records.filter((r) => r.mood !== null);
  const percentage = Math.round((stats.daysWithEntry / stats.totalDays) * 100);

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "720px" }}>
      {/* Encabezado */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontSize: "1.375rem",
            fontWeight: 600,
            color: "var(--mc-text)",
            letterSpacing: "-0.01em",
          }}
        >
          Progreso
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>
          {stats.month} {stats.year}
        </p>
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
        {/* Dias registrados */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid var(--mc-border)",
            borderRadius: "0.75rem",
            padding: "1.125rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", fontWeight: 500 }}>
            Dias registrados
          </p>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--mc-primary)",
              lineHeight: 1.2,
              marginTop: "0.375rem",
            }}
          >
            {stats.daysWithEntry}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>
            de {stats.totalDays} dias · {percentage}%
          </p>
        </div>

        {/* Emocion predominante */}
        <div
          style={{
            backgroundColor: dominantOption ? dominantOption.bg : "#fff",
            border: `1px solid ${dominantOption ? dominantOption.color : "var(--mc-border)"}`,
            borderRadius: "0.75rem",
            padding: "1.125rem",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              color: dominantOption ? dominantOption.color : "var(--mc-text-muted)",
              fontWeight: 500,
            }}
          >
            Emocion predominante
          </p>
          <p
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              color: dominantOption ? dominantOption.color : "var(--mc-text-muted)",
              lineHeight: 1.2,
              marginTop: "0.375rem",
            }}
          >
            {dominantOption ? dominantOption.label : "Sin datos"}
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: dominantOption ? dominantOption.color : "var(--mc-text-muted)",
              marginTop: "0.25rem",
              opacity: 0.8,
            }}
          >
            Este mes
          </p>
        </div>
      </div>

      {/* Grafica mensual */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid var(--mc-border)",
          borderRadius: "0.875rem",
          padding: "1.25rem 1.25rem 1rem",
          marginBottom: "1.75rem",
        }}
      >
        <h2
          style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "var(--mc-text)",
            marginBottom: "1rem",
          }}
        >
          Estado de animo por dia
        </h2>
        <MoodChart records={stats.records} />

        {/* Leyenda */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.625rem",
            marginTop: "1rem",
            paddingTop: "0.875rem",
            borderTop: "1px solid var(--mc-border)",
          }}
        >
          {MOOD_OPTIONS.map((option) => (
            <div
              key={option.value}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "2px",
                  backgroundColor: option.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "0.6875rem", color: "var(--mc-text-muted)" }}>
                {option.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Lista detallada */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid var(--mc-border)",
          borderRadius: "0.875rem",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "1.125rem 1.25rem", borderBottom: "1px solid var(--mc-border)" }}>
          <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)" }}>
            Registro del mes
          </h2>
        </div>
        <div style={{ maxHeight: "320px", overflowY: "auto" }}>
          {recordsWithMood.length === 0 ? (
            <p
              style={{
                padding: "2rem",
                textAlign: "center",
                fontSize: "0.875rem",
                color: "var(--mc-text-muted)",
              }}
            >
              No hay entradas registradas este mes.
            </p>
          ) : (
            recordsWithMood
              .slice()
              .reverse()
              .map((record) => {
                const option = MOOD_OPTIONS.find((m) => m.value === record.mood)!;
                return (
                  <div
                    key={record.date}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      padding: "0.75rem 1.25rem",
                      borderBottom: "1px solid var(--mc-border)",
                    }}
                  >
                    <span
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: option.bg,
                        border: `1.5px solid ${option.color}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.625rem",
                        fontWeight: 700,
                        color: option.color,
                        flexShrink: 0,
                      }}
                    >
                      {option.symbol}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: option.color,
                        }}
                      >
                        {option.label}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--mc-text-muted)",
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(record.date)}
                    </span>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}

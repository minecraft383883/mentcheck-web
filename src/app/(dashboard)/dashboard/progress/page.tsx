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
      <div
        style={{
          padding: "2rem 1.5rem",
          fontSize: "0.875rem",
          color: "var(--mc-text-muted)",
        }}
      >
        Cargando progreso...
      </div>
    );
  }

  if (!stats) {
    return (
      <div
        style={{
          padding: "2rem 1.5rem",
          fontSize: "0.875rem",
          color: "var(--mc-text-muted)",
        }}
      >
        No se pudo cargar el progreso.
      </div>
    );
  }

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
            {dominantOption ? dominantOption.emoji + " " + dominantOption.label : "Sin datos"}
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

        {recordsWithMood.length === 0 ? (
          <div
            style={{
              height: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              color: "var(--mc-text-muted)",
            }}
          >
            Registra tu primer dia para ver la grafica.
          </div>
        ) : (
          <MoodChart records={stats.records} />
        )}

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
          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {recordsWithMood
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
                        fontSize: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      {option.emoji}
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
              })}
          </div>
        )}
      </div>
    </div>
  );
}

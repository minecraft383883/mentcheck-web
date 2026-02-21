"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import DiaryForm from "@/components/diary/DiaryForm";
import { DiaryEntry } from "@/types/diary";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const MOOD_LABELS: Record<string, { label: string; color: string; bg: string; symbol: string; emoji: string }> = {
  alegria:  { label: "Alegría",  color: "#d97706", bg: "#fffbeb", symbol: "AL", emoji: "😊" },
  tristeza: { label: "Tristeza", color: "#2b6cb0", bg: "#ebf8ff", symbol: "TR", emoji: "😢" },
  enojo:    { label: "Enojo",    color: "#c53030", bg: "#fff5f5", symbol: "EN", emoji: "😠" },
  miedo:    { label: "Miedo",    color: "#6b46c1", bg: "#faf5ff", symbol: "MI", emoji: "😨" },
  tedio:    { label: "Tedio",    color: "#4a5568", bg: "#f7fafc", symbol: "TE", emoji: "😑" },
  ansiedad: { label: "Ansiedad", color: "#b7791f", bg: "#fffff0", symbol: "AN", emoji: "😰" },
  no_lo_se: { label: "No lo sé", color: "#718096", bg: "#f7fafc", symbol: "?",  emoji: "🤔" },
};


export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const res = await fetch("/api/diary");
      const data = await res.json();
      if (res.ok) setEntries(data.entries);
    } catch (error) {
      console.error("Error al cargar entradas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(entry: DiaryEntry) {
    await fetchEntries();
    setShowForm(false);
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const hasEntryToday = entries.some(
    (e) => new Date(e.date).toISOString().split("T")[0] === todayStr
  );

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "680px" }}>
      {/* Encabezado */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.375rem",
              fontWeight: 600,
              color: "var(--mc-text)",
              letterSpacing: "-0.01em",
            }}
          >
            Diario
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>
            {hasEntryToday ? "Ya registraste tu día de hoy." : "¿Cómo te sientes hoy?"}
          </p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            {hasEntryToday ? "Editar hoy" : "Registrar hoy"}
          </Button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <DiaryForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Lista de entradas */}
      {loading ? (
        <div
          style={{
            padding: "3rem 1rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "var(--mc-text-muted)",
          }}
        >
          Cargando entradas...
        </div>
      ) : entries.length === 0 ? (
        <div
          style={{
            padding: "3rem 1rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "var(--mc-text-muted)",
          }}
        >
          No hay entradas aún. Registra tu primer día.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {entries.map((entry) => {
            const mood = MOOD_LABELS[entry.mood];
            const dateKey = typeof entry.date === "string"
              ? entry.date.split("T")[0]
              : new Date(entry.date).toISOString().split("T")[0];

            return (
              <div
    key={entry.id}
    style={{
      backgroundColor: "#fff",
      border: "1px solid var(--mc-border)",
      borderRadius: "0.875rem",
      padding: "1rem 1.25rem",
      display: "flex",
      gap: "1rem",
      alignItems: "flex-start",
    }}
  >
    <div
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        backgroundColor: mood?.bg ?? "#f7fafc",
        border: `1.5px solid ${mood?.color ?? "#e2e8f0"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.25rem",
        flexShrink: 0,
      }}
    >
      {mood?.emoji ?? "?"}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "0.5rem",
        }}
      >
        <p
          style={{
            fontSize: "0.9375rem",
            fontWeight: 500,
            color: mood?.color ?? "var(--mc-text)",
          }}
        >
          {mood?.label ?? entry.mood}
        </p>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--mc-text-muted)",
            whiteSpace: "nowrap",
            textTransform: "capitalize",
            flexShrink: 0,
          }}
        >
          {formatDate(dateKey)}
        </span>
      </div>
      {entry.note && (
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--mc-text-secondary)",
            marginTop: "0.375rem",
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {entry.note}
        </p>
      )}
    </div>
  </div>
);
          })}
        </div>
      )}
    </div>
  );
}

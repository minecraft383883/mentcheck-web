"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import MoodSelector from "@/components/diary/MoodSelector";
import { Mood, MOOD_OPTIONS, DiaryEntry } from "@/types/diary";

// Datos de ejemplo hasta conectar la base de datos en Fase 3
const SAMPLE_ENTRIES: DiaryEntry[] = [
  {
    id: "1",
    date: "2026-02-18",
    mood: "alegria",
    note: "Tuve una buena sesión con mi terapeuta. Me siento más tranquilo con respecto a los cambios que estoy haciendo.",
    createdAt: "2026-02-18T10:30:00",
  },
  {
    id: "2",
    date: "2026-02-17",
    mood: "ansiedad",
    note: "El día estuvo difícil, muchos pendientes en el trabajo. Practiqué la respiración que me indicaron.",
    createdAt: "2026-02-17T21:00:00",
  },
  {
    id: "3",
    date: "2026-02-16",
    mood: "tedio",
    note: "",
    createdAt: "2026-02-16T19:15:00",
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getMoodOption(mood: Mood) {
  return MOOD_OPTIONS.find((m) => m.value === mood)!;
}

export default function DiaryPage() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState<DiaryEntry[]>(SAMPLE_ENTRIES);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMood) return;

    setLoading(true);

    // Simulacion — en Fase 3 esto llama a la API real
    await new Promise((r) => setTimeout(r, 800));

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      mood: selectedMood,
      note,
      createdAt: new Date().toISOString(),
    };

    setEntries([newEntry, ...entries]);
    setSelectedMood(null);
    setNote("");
    setSaved(true);
    setLoading(false);

    setTimeout(() => setSaved(false), 3000);
  }

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "680px" }}>
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
          Diario
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--mc-text-muted)",
            marginTop: "0.25rem",
            textTransform: "capitalize",
          }}
        >
          {today}
        </p>
      </div>

      {/* Formulario de entrada */}
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#fff",
          border: "1px solid var(--mc-border)",
          borderRadius: "0.875rem",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <MoodSelector selected={selectedMood} onChange={setSelectedMood} />

        {/* Textarea */}
        <div style={{ marginTop: "1.25rem" }}>
          <label
            htmlFor="note"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--mc-text-secondary)",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            Nota del día{" "}
            <span style={{ fontWeight: 400, color: "var(--mc-text-muted)" }}>(opcional)</span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Escribe lo que quieras recordar de hoy..."
            rows={4}
            style={{
              width: "100%",
              padding: "0.75rem 0.875rem",
              fontSize: "0.875rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--mc-border)",
              color: "var(--mc-text)",
              backgroundColor: "#fff",
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              lineHeight: 1.6,
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--mc-teal)";
              e.target.style.boxShadow = "0 0 0 3px var(--mc-mint)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--mc-border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Confirmacion */}
        {saved && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.625rem 1rem",
              borderRadius: "0.5rem",
              backgroundColor: "#f0fff4",
              border: "1px solid #9ae6b4",
              fontSize: "0.8125rem",
              color: "#276749",
            }}
          >
            Entrada guardada correctamente.
          </div>
        )}

        <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!selectedMood}
          >
            Guardar entrada
          </Button>
        </div>
      </form>

      {/* Historial */}
      <div>
        <h2
          style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "var(--mc-text)",
            marginBottom: "1rem",
          }}
        >
          Entradas anteriores
        </h2>

        {entries.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
            No hay entradas registradas aún.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {entries.map((entry) => {
              const mood = getMoodOption(entry.mood);
              return (
                <div
                  key={entry.id}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid var(--mc-border)",
                    borderRadius: "0.75rem",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Indicador de mood */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: mood.bg,
                      border: `1.5px solid ${mood.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      color: mood.color,
                      flexShrink: 0,
                    }}
                  >
                    {mood.symbol}
                  </div>

                  {/* Contenido */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: mood.color,
                        }}
                      >
                        {mood.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--mc-text-muted)",
                          textTransform: "capitalize",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    {entry.note ? (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--mc-text-secondary)",
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {entry.note}
                      </p>
                    ) : (
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--mc-text-muted)",
                          fontStyle: "italic",
                          margin: 0,
                        }}
                      >
                        Sin nota escrita
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

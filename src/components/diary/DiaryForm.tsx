"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { DiaryEntry, MOOD_OPTIONS, Mood } from "@/types/diary";

interface DiaryFormProps {
  onSave: (entry: DiaryEntry) => void;
  onCancel: () => void;
}

export default function DiaryForm({ onSave, onCancel }: DiaryFormProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMood) return;
    setLoading(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: selectedMood,
          note: note.trim() || null,
          date: today,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error al guardar:", data.error);
        return;
      }

      onSave(data.entry);
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: "#fff",
        border: "1px solid var(--mc-border)",
        borderRadius: "0.875rem",
        padding: "1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      <h2
        style={{
          fontSize: "0.9375rem",
          fontWeight: 600,
          color: "var(--mc-text)",
          marginBottom: "1.25rem",
        }}
      >
        ¿Cómo te sientes hoy?
      </h2>

      {/* Selector de emocion */}
      <div style={{ marginBottom: "1.5rem" }}>
        <p
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--mc-text-secondary)",
            marginBottom: "0.75rem",
          }}
        >
          Selecciona tu estado de ánimo
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "0.5rem",
          }}
        >
          {MOOD_OPTIONS.map((option) => {
            const active = selectedMood === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedMood(option.value)}
                style={{
                  padding: "0.75rem 0.5rem",
                  borderRadius: "0.625rem",
                  border: `1.5px solid ${active ? option.color : "var(--mc-border)"}`,
                  backgroundColor: active ? option.bg : "#fff",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.375rem",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "1.375rem" }}>{option.emoji}</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: active ? 600 : 400,
                    color: active ? option.color : "var(--mc-text-secondary)",
                  }}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nota */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--mc-text-secondary)",
            marginBottom: "0.5rem",
          }}
        >
          Nota del día
          <span style={{ fontWeight: 400, color: "var(--mc-text-muted)", marginLeft: "0.25rem" }}>
            (opcional)
          </span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="¿Qué pasó hoy? ¿Cómo te fue?"
          rows={4}
          style={{
            width: "100%",
            padding: "0.625rem 0.875rem",
            borderRadius: "0.5rem",
            border: "1.5px solid var(--mc-border)",
            fontSize: "0.875rem",
            color: "var(--mc-text)",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            lineHeight: 1.6,
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--mc-teal)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--mc-border)")}
        />
      </div>

      {/* Acciones */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!selectedMood}
        >
          Guardar
        </Button>
      </div>
    </form>
  );
}

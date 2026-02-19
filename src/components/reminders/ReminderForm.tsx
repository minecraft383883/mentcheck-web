"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Reminder, ReminderType, REMINDER_TYPES } from "@/types/reminder";

interface ReminderFormProps {
  onSave: (reminder: Reminder) => void;
  onCancel: () => void;
}

export default function ReminderForm({ onSave, onCancel }: ReminderFormProps) {
  const [type, setType] = useState<ReminderType>("medicacion");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const reminder: Reminder = {
      id: Date.now().toString(),
      type,
      title: title.trim() || REMINDER_TYPES.find((t) => t.value === type)!.label,
      time,
      repeat,
      status: "pendiente",
      createdAt: new Date().toISOString(),
    };

    onSave(reminder);
    setLoading(false);
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
        Nuevo recordatorio
      </h2>

      {/* Tipo */}
      <div style={{ marginBottom: "1.25rem" }}>
        <p
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--mc-text-secondary)",
            marginBottom: "0.625rem",
          }}
        >
          Tipo
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
          {REMINDER_TYPES.map((option) => {
            const active = type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                style={{
                  padding: "0.625rem 0.75rem",
                  borderRadius: "0.5rem",
                  border: `1.5px solid ${active ? option.color : "var(--mc-border)"}`,
                  backgroundColor: active ? option.bg : "#fff",
                  fontSize: "0.8125rem",
                  fontWeight: active ? 500 : 400,
                  color: active ? option.color : "var(--mc-text-secondary)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Titulo personalizado */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Input
          label="Descripción"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Ej. ${REMINDER_TYPES.find((t) => t.value === type)?.label}`}
        />
      </div>

      {/* Hora */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Input
          label="Hora"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>

      {/* Repetir */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <button
          type="button"
          onClick={() => setRepeat(!repeat)}
          style={{
            width: "40px",
            height: "22px",
            borderRadius: "999px",
            backgroundColor: repeat ? "var(--mc-teal)" : "var(--mc-border)",
            border: "none",
            cursor: "pointer",
            position: "relative",
            transition: "background-color 0.2s",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "3px",
              left: repeat ? "21px" : "3px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: "#fff",
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </button>
        <span style={{ fontSize: "0.875rem", color: "var(--mc-text-secondary)" }}>
          Repetir diariamente
        </span>
      </div>

      {/* Acciones */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

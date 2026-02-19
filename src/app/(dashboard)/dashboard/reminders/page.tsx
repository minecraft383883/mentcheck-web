"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ReminderForm from "@/components/reminders/ReminderForm";
import { Reminder, REMINDER_TYPES } from "@/types/reminder";

const SAMPLE_REMINDERS: Reminder[] = [
  {
    id: "1",
    type: "medicacion",
    title: "Sertralina 50mg",
    time: "08:00",
    repeat: true,
    status: "completado",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    type: "actividad",
    title: "Ejercicio de respiración",
    time: "12:00",
    repeat: false,
    status: "pendiente",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    type: "cita",
    title: "Cita con terapeuta",
    time: "17:00",
    repeat: false,
    status: "pendiente",
    createdAt: new Date().toISOString(),
  },
];

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>(SAMPLE_REMINDERS);
  const [showForm, setShowForm] = useState(false);

  function handleSave(reminder: Reminder) {
    setReminders([reminder, ...reminders]);
    setShowForm(false);
  }

  function toggleStatus(id: string) {
    setReminders(
      reminders.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "pendiente" ? "completado" : "pendiente" }
          : r
      )
    );
  }

  function handleDelete(id: string) {
    setReminders(reminders.filter((r) => r.id !== id));
  }

  const pendientes = reminders.filter((r) => r.status === "pendiente");
  const completados = reminders.filter((r) => r.status === "completado");

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
            Recordatorios
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>
            {pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""} hoy
          </p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Agregar
          </Button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <ReminderForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {/* Lista pendientes */}
      {pendientes.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--mc-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.75rem",
            }}
          >
            Pendientes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {pendientes.map((r) => (
              <ReminderItem
                key={r.id}
                reminder={r}
                onToggle={toggleStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {/* Lista completados */}
      {completados.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--mc-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.75rem",
            }}
          >
            Completados
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {completados.map((r) => (
              <ReminderItem
                key={r.id}
                reminder={r}
                onToggle={toggleStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {reminders.length === 0 && !showForm && (
        <div
          style={{
            padding: "3rem 1rem",
            textAlign: "center",
            color: "var(--mc-text-muted)",
            fontSize: "0.875rem",
          }}
        >
          No tienes recordatorios. Agrega uno para comenzar.
        </div>
      )}
    </div>
  );
}

interface ReminderItemProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function ReminderItem({ reminder, onToggle, onDelete }: ReminderItemProps) {
  const typeOption = REMINDER_TYPES.find((t) => t.value === reminder.type)!;
  const done = reminder.status === "completado";

  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid var(--mc-border)",
        borderRadius: "0.75rem",
        padding: "0.875rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        opacity: done ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(reminder.id)}
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          border: `2px solid ${done ? typeOption.color : "var(--mc-border)"}`,
          backgroundColor: done ? typeOption.bg : "#fff",
          cursor: "pointer",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
        }}
      >
        {done && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={typeOption.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </button>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: done ? "var(--mc-text-muted)" : "var(--mc-text)",
            textDecoration: done ? "line-through" : "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {reminder.title}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: typeOption.color,
              backgroundColor: typeOption.bg,
              padding: "0.1rem 0.4rem",
              borderRadius: "999px",
            }}
          >
            {typeOption.label}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)" }}>
            {reminder.time}
          </span>
          {reminder.repeat && (
            <span style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)" }}>· Diario</span>
          )}
        </div>
      </div>

      {/* Eliminar */}
      <button
        type="button"
        onClick={() => onDelete(reminder.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--mc-text-muted)",
          padding: "0.25rem",
          borderRadius: "0.375rem",
          display: "flex",
          alignItems: "center",
          transition: "color 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#c53030")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--mc-text-muted)")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>
  );
}

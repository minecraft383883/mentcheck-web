"use client";

import { useState, useEffect } from "react";

type ReminderItem = {
  id: string;
  type: string;
  title: string;
  time: string;
  repeat: boolean;
  status: string;
};

type AppointmentItem = {
  id: string;
  dateTime: string;
  status: string;
  notes: string | null;
  therapistProfile: { user: { name: string } };
};

type NoteItem = {
  id: string;
  date: string;
  content: string;
  therapistProfile: { user: { name: string } };
};

const REMINDER_TYPE_LABELS: Record<string, string> = {
  medicacion: "💊 Medicación",
  actividad: "🏃 Actividad",
  cita: "📅 Cita",
  personalizado: "📌 Personalizado",
};

const STATUS_COLORS: Record<string, string> = {
  pendiente: "#b45309",
  completada: "#15803d",
  cancelada: "#b91c1c",
  completado: "#15803d",
};

const STATUS_BG: Record<string, string> = {
  pendiente: "#fef3c7",
  completada: "#dcfce7",
  cancelada: "#fee2e2",
  completado: "#dcfce7",
};

export default function PatientInfoPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"reminders" | "appointments" | "notes">("reminders");

  useEffect(() => {
    fetch("/api/patient/my-info")
      .then((r) => r.json())
      .then((data) => {
        setReminders(data.reminders ?? []);
        setAppointments(data.appointments ?? []);
        setNotes(data.notes ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tabStyle = (active: boolean) => ({
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    border: "none",
    cursor: "pointer",
    fontWeight: active ? 600 : 400,
    fontSize: "0.875rem",
    backgroundColor: active ? "var(--mc-primary, #0d9488)" : "transparent",
    color: active ? "#fff" : "var(--mc-text-muted, #6b7280)",
    transition: "all 0.15s",
  });

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "720px" }}>
      <h1
        style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "var(--mc-text, #111827)",
          marginBottom: "1.5rem",
        }}
      >
        Mi información
      </h1>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          backgroundColor: "var(--mc-surface, #f3f4f6)",
          borderRadius: "0.625rem",
          padding: "0.25rem",
        }}
      >
        <button style={tabStyle(tab === "reminders")} onClick={() => setTab("reminders")}>
          🔔 Recordatorios
        </button>
        <button style={tabStyle(tab === "appointments")} onClick={() => setTab("appointments")}>
          📅 Citas
        </button>
        <button style={tabStyle(tab === "notes")} onClick={() => setTab("notes")}>
          📋 Notas
        </button>
      </div>

      {loading && (
        <p style={{ color: "var(--mc-text-muted, #6b7280)", fontSize: "0.875rem" }}>Cargando...</p>
      )}

      {/* RECORDATORIOS */}
      {!loading && tab === "reminders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {reminders.length === 0 ? (
            <p style={{ color: "var(--mc-text-muted, #6b7280)", fontSize: "0.875rem" }}>
              Sin recordatorios por ahora.
            </p>
          ) : (
            reminders.map((r) => (
              <div
                key={r.id}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--mc-border, #e5e7eb)",
                  borderRadius: "0.75rem",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--mc-text, #111827)" }}>
                    {r.title}
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--mc-text-muted, #6b7280)", marginTop: "0.2rem" }}>
                    {REMINDER_TYPE_LABELS[r.type] ?? r.type} · {r.time}
                    {r.repeat && " · 🔁 Repetir"}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: STATUS_COLORS[r.status] ?? "#374151",
                    backgroundColor: STATUS_BG[r.status] ?? "#f3f4f6",
                    padding: "0.25rem 0.625rem",
                    borderRadius: "999px",
                  }}
                >
                  {r.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* CITAS */}
      {!loading && tab === "appointments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {appointments.length === 0 ? (
            <p style={{ color: "var(--mc-text-muted, #6b7280)", fontSize: "0.875rem" }}>
              Sin citas agendadas.
            </p>
          ) : (
            appointments.map((a) => (
              <div
                key={a.id}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--mc-border, #e5e7eb)",
                  borderRadius: "0.75rem",
                  padding: "1rem 1.25rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--mc-text, #111827)" }}>
                      {new Date(a.dateTime).toLocaleDateString("es-MX", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--mc-text-muted, #6b7280)", marginTop: "0.2rem" }}>
                      🕐{" "}
                      {new Date(a.dateTime).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" · "}{a.therapistProfile.user.name}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: STATUS_COLORS[a.status] ?? "#374151",
                      backgroundColor: STATUS_BG[a.status] ?? "#f3f4f6",
                      padding: "0.25rem 0.625rem",
                      borderRadius: "999px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.status}
                  </span>
                </div>
                {a.notes && (
                  <p
                    style={{
                      marginTop: "0.625rem",
                      fontSize: "0.875rem",
                      color: "var(--mc-text, #374151)",
                      borderTop: "1px solid var(--mc-border, #e5e7eb)",
                      paddingTop: "0.625rem",
                    }}
                  >
                    {a.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* NOTAS DEL PSICÓLOGO */}
      {!loading && tab === "notes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {notes.length === 0 ? (
            <p style={{ color: "var(--mc-text-muted, #6b7280)", fontSize: "0.875rem" }}>
              Tu psicólogo aún no ha escrito notas.
            </p>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--mc-border, #e5e7eb)",
                  borderRadius: "0.75rem",
                  padding: "1rem 1.25rem",
                }}
              >
                <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--mc-text-muted, #6b7280)", marginBottom: "0.5rem" }}>
                  {new Date(n.date).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {" · "}{n.therapistProfile.user.name}
                </p>
                <p style={{ fontSize: "0.9375rem", color: "var(--mc-text, #111827)", lineHeight: 1.6 }}>
                  {n.content}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

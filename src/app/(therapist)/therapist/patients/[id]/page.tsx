"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MoodChart from "@/components/stats/MoodChart";
import MonthSelector from "@/components/ui/MonthSelector";
import { MOOD_OPTIONS, Mood } from "@/types/diary";
import { DailyMoodRecord } from "@/types/stats";

interface PatientDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  month: string;
  monthIndex: number;
  year: number;
  records: { date: string; mood: string | null; note: string | null; hasNote: boolean }[];
}

interface Appointment {
  id: string;
  dateTime: string;
  status: "pendiente" | "completada" | "cancelada";
  notes: string | null;
}

interface SessionNote {
  id: string;
  date: string;
  content: string;
  createdAt: string;
}

interface Reminder {
  id: string;
  type: "medicacion" | "actividad" | "cita" | "personalizado";
  title: string;
  time: string;
  repeat: boolean;
  status: "pendiente" | "completado";
  createdAt: string;
}

const MOOD_LABELS: Record<string, string> = {
  alegria: "Alegría",
  tristeza: "Tristeza",
  enojo: "Enojo",
  miedo: "Miedo",
  tedio: "Fastidio",
  ansiedad: "Ansiedad",
  no_lo_se: "No lo sé",
};

const REMINDER_TYPE_LABEL: Record<string, string> = {
  medicacion: "Medicación",
  actividad: "Actividad",
  cita: "Cita",
  personalizado: "Personalizado",
};

const REMINDER_TYPE_EMOJI: Record<string, string> = {
  medicacion: "💊",
  actividad: "🏃",
  cita: "📅",
  personalizado: "✅",
};

const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  completada: "Completada",
  cancelada: "Cancelada",
};

const STATUS_COLOR: Record<string, string> = {
  pendiente: "#d97706",
  completada: "#16a34a",
  cancelada: "#dc2626",
};

const STATUS_BG: Record<string, string> = {
  pendiente: "#fef3c7",
  completada: "#dcfce7",
  cancelada: "#fee2e2",
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatDateLong(dateStr: string): string {
  if (!dateStr) return "No registrada";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
  );
}

function toMoodRecords(records: PatientDetail["records"]): DailyMoodRecord[] {
  return records.map((r) => ({
    date: r.date,
    mood: r.mood as Mood | null,
    hasNote: r.hasNote,
  }));
}

async function downloadPDF(patient: PatientDetail) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PRIMARY = [27, 73, 101] as [number, number, number];
  const SKY = [202, 233, 255] as [number, number, number];
  const MUTED = [100, 100, 100] as [number, number, number];
  const DARK = [30, 30, 30] as [number, number, number];
  const WHITE = [255, 255, 255] as [number, number, number];
  const recordsWithMood = patient.records.filter((r) => r.mood !== null);
  const daysWithEntry = recordsWithMood.length;
  const percentage = Math.round((daysWithEntry / patient.records.length) * 100);
  const moodCounts: Record<string, number> = {};
  recordsWithMood.forEach((r) => { if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1; });
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  doc.setFillColor(...PRIMARY); doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(...WHITE); doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.text("Mentcheck", 14, 14);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.text("Agenda terapéutica", 14, 20);
  doc.setFontSize(11); doc.text("Reporte del Paciente", 14, 28);
  const todayLabel = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  doc.setFontSize(8); doc.text(`Generado: ${todayLabel}`, 196, 28, { align: "right" });
  let y = 44;
  doc.setTextColor(...PRIMARY); doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Datos del paciente", 14, y);
  y += 2; doc.setDrawColor(...SKY); doc.setLineWidth(0.4); doc.line(14, y + 2, 196, y + 2); y += 8;
  const personalData: [string, string][] = [
    ["Nombre", patient.name || "No registrado"],
    ["Correo", patient.email || "No registrado"],
    ["Teléfono", patient.phone || "No registrado"],
    ["Fecha de nacimiento", formatDateLong(patient.birthdate)],
  ];
  personalData.forEach(([label, value]) => {
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...MUTED); doc.text(label + ":", 14, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK); doc.text(value, 58, y); y += 6.5;
  });
  y += 4;
  doc.setTextColor(...PRIMARY); doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.text(`Resumen — ${patient.month} ${patient.year}`, 14, y);
  y += 2; doc.setDrawColor(...SKY); doc.line(14, y + 2, 196, y + 2); y += 8;
  const summaryData: [string, string][] = [
    ["Días registrados", `${daysWithEntry} de ${patient.records.length} días (${percentage}%)`],
    ["Emoción predominante", dominantMood ? (MOOD_LABELS[dominantMood] ?? dominantMood) : "Sin datos"],
  ];
  summaryData.forEach(([label, value]) => {
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...MUTED); doc.text(label + ":", 14, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK); doc.text(value, 68, y); y += 6.5;
  });
  y += 4;
  doc.setTextColor(...PRIMARY); doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Registro del mes", 14, y);
  y += 2; doc.setDrawColor(...SKY); doc.line(14, y + 2, 196, y + 2); y += 8;
  doc.setFillColor(...SKY); doc.rect(14, y - 5, 182, 7, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...PRIMARY);
  doc.text("Fecha", 16, y); doc.text("Estado de ánimo", 70, y); doc.text("Nota", 130, y); y += 5;
  recordsWithMood.slice().reverse().forEach((record, idx) => {
    if (y > 272) { doc.addPage(); y = 20; }
    if (idx % 2 === 0) { doc.setFillColor(248, 252, 255); doc.rect(14, y - 4, 182, 6.5, "F"); }
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK); doc.setFontSize(8);
    const dateLabel = new Date(record.date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" });
    doc.text(dateLabel, 16, y); doc.text(MOOD_LABELS[record.mood!] ?? record.mood!, 70, y);
    if (record.note) { const note = record.note.length > 38 ? record.note.substring(0, 35) + "..." : record.note; doc.text(note, 130, y); }
    y += 6.5;
  });
  if (recordsWithMood.length === 0) { doc.setFontSize(8.5); doc.setTextColor(...MUTED); doc.text("No hay registros este mes.", 14, y); }
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(...MUTED);
    doc.text("Mentcheck — Agenda terapéutica", 14, 291);
    doc.text(`Página ${i} de ${pageCount}`, 196, 291, { align: "right" });
  }
  doc.save(`mentcheck-${patient.name.replace(/\s+/g, "-").toLowerCase()}-${patient.month.toLowerCase()}-${patient.year}.pdf`);
}

// ─── Calendario ───────────────────────────────────────────────────────────────
interface CalendarProps {
  year: number;
  month: number;
  records: { date: string; mood: string | null }[];
  isCurrentMonth: boolean;
}
function EmotionCalendar({ year, month, records, isCurrentMonth }: CalendarProps) {
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const moodMap: Record<number, string | null> = {};
  records.forEach((r) => { moodMap[new Date(r.date + "T12:00:00").getDate()] = r.mood; });
  const weekDays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "0.375rem" }}>
        {weekDays.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "var(--mc-text-muted)", padding: "0.25rem 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const mood = moodMap[day] ?? null;
          const option = mood ? MOOD_OPTIONS.find((m) => m.value === mood) : null;
          const isToday = isCurrentMonth && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          const isFuture = isCurrentMonth && day > today.getDate();
          return (
            <div key={day} title={option ? option.label : isFuture ? "" : "Sin registro"}
              style={{ aspectRatio: "1", borderRadius: "0.5rem", backgroundColor: option ? option.bg : isFuture ? "transparent" : "#f7fafc", border: isToday ? "2px solid var(--mc-primary)" : option ? `1px solid ${option.color}40` : isFuture ? "1px dashed #e2e8f0" : "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1px" }}
            >
              <span style={{ fontSize: "0.5625rem", fontWeight: isToday ? 700 : 400, color: isToday ? "var(--mc-primary)" : "var(--mc-text-muted)", lineHeight: 1 }}>{day}</span>
              {option ? <span style={{ fontSize: "0.9375rem", lineHeight: 1 }}>{option.emoji}</span> : !isFuture ? <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#cbd5e0" }} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Expediente: Citas ────────────────────────────────────────────────────────
interface AppointmentsTabProps { patientId: string; }
function AppointmentsTab({ patientId }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("10:00");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const minDate = todayStr();

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/therapist/patients/${patientId}/appointments`)
      .then((r) => r.json())
      .then((d) => setAppointments(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formDate) return;
    setFormError("");

    // Validación frontend: si eligen hoy, la hora ya debe ser futura
    const chosen = new Date(`${formDate}T${formTime}:00`);
    if (chosen <= new Date()) {
      setFormError("La fecha y hora deben ser posteriores al momento actual.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/therapist/patients/${patientId}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateTime: chosen.toISOString(), notes: formNotes || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error ?? "Error al guardar la cita.");
        return;
      }
      setShowForm(false); setFormDate(""); setFormTime("10:00"); setFormNotes("");
      load();
    } finally { setSaving(false); }
  }

  function handleOpenForm() {
    setShowForm((v) => !v);
    setFormError("");
    setFormDate("");
    setFormTime("10:00");
    setFormNotes("");
  }

  async function handleStatus(apptId: string, status: string) {
    setUpdatingId(apptId);
    try {
      await fetch(`/api/therapist/patients/${patientId}/appointments/${apptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      load();
    } finally { setUpdatingId(null); }
  }

  async function handleDelete(apptId: string) {
    if (!confirm("¿Eliminar esta cita?")) return;
    await fetch(`/api/therapist/patients/${patientId}/appointments/${apptId}`, { method: "DELETE" });
    load();
  }

  const upcoming = appointments.filter((a) => a.status === "pendiente");
  const past = appointments.filter((a) => a.status !== "pendiente");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button onClick={handleOpenForm} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--mc-teal)", backgroundColor: "var(--mc-sky)", color: "var(--mc-primary)", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nueva cita
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} style={{ backgroundColor: "var(--mc-surface)", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "1.125rem", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--mc-text-muted)" }}>Fecha</label>
              <input
                type="date"
                value={formDate}
                min={minDate}
                onChange={(e) => { setFormDate(e.target.value); setFormError(""); }}
                required
                style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: `1px solid ${formError ? "#dc2626" : "var(--mc-border)"}`, fontSize: "0.875rem", color: "var(--mc-text)", backgroundColor: "#fff" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--mc-text-muted)" }}>Hora</label>
              <input
                type="time"
                value={formTime}
                onChange={(e) => { setFormTime(e.target.value); setFormError(""); }}
                required
                style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: `1px solid ${formError ? "#dc2626" : "var(--mc-border)"}`, fontSize: "0.875rem", color: "var(--mc-text)", backgroundColor: "#fff" }}
              />
            </div>
          </div>
          {formError && (
            <p style={{ fontSize: "0.8125rem", color: "#dc2626", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "0.5rem", padding: "0.5rem 0.75rem" }}>
              ⚠️ {formError}
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--mc-text-muted)" }}>Notas de la cita (opcional)</label>
            <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2} placeholder="Motivo, indicaciones..." style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--mc-border)", fontSize: "0.875rem", color: "var(--mc-text)", backgroundColor: "#fff", resize: "vertical", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: "0.4375rem 0.875rem", borderRadius: "0.5rem", border: "1px solid var(--mc-border)", backgroundColor: "#fff", color: "var(--mc-text-muted)", fontSize: "0.8125rem", cursor: "pointer" }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ padding: "0.4375rem 0.875rem", borderRadius: "0.5rem", border: "none", backgroundColor: "var(--mc-primary)", color: "#fff", fontSize: "0.8125rem", fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Guardando..." : "Guardar cita"}</button>
          </div>
        </form>
      )}
      {loading ? (
        <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>Cargando...</p>
      ) : appointments.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)", textAlign: "center", padding: "2rem 0" }}>Sin citas registradas.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {upcoming.length > 0 && <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Próximas</p>}
          {upcoming.map((a) => <AppointmentCard key={a.id} appt={a} onStatus={handleStatus} onDelete={handleDelete} updating={updatingId === a.id} />)}
          {past.length > 0 && <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: "0.5rem" }}>Historial</p>}
          {past.map((a) => <AppointmentCard key={a.id} appt={a} onStatus={handleStatus} onDelete={handleDelete} updating={updatingId === a.id} />)}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appt, onStatus, onDelete, updating }: { appt: Appointment; onStatus: (id: string, s: string) => void; onDelete: (id: string) => void; updating: boolean; }) {
  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "0.875rem 1rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--mc-text)" }}>{formatDateTime(appt.dateTime)}</span>
          <span style={{ fontSize: "0.6875rem", fontWeight: 500, padding: "0.125rem 0.5rem", borderRadius: "9999px", backgroundColor: STATUS_BG[appt.status], color: STATUS_COLOR[appt.status] }}>{STATUS_LABEL[appt.status]}</span>
        </div>
        {appt.notes && <p style={{ fontSize: "0.8125rem", color: "var(--mc-text-muted)", marginTop: "0.125rem" }}>{appt.notes}</p>}
      </div>
      {appt.status === "pendiente" && (
        <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
          <button onClick={() => onStatus(appt.id, "completada")} disabled={updating} title="Marcar completada" style={{ padding: "0.3125rem 0.625rem", borderRadius: "0.375rem", border: "1px solid #16a34a", backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "0.75rem", cursor: updating ? "not-allowed" : "pointer" }}>✓</button>
          <button onClick={() => onStatus(appt.id, "cancelada")} disabled={updating} title="Cancelar cita" style={{ padding: "0.3125rem 0.625rem", borderRadius: "0.375rem", border: "1px solid #dc2626", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: "0.75rem", cursor: updating ? "not-allowed" : "pointer" }}>×</button>
        </div>
      )}
      {appt.status !== "pendiente" && (
        <button onClick={() => onDelete(appt.id)} title="Eliminar" style={{ padding: "0.3125rem 0.5rem", borderRadius: "0.375rem", border: "1px solid var(--mc-border)", backgroundColor: "var(--mc-surface)", color: "var(--mc-text-muted)", fontSize: "0.75rem", cursor: "pointer", flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
        </button>
      )}
    </div>
  );
}

// ─── Expediente: Notas ────────────────────────────────────────────────────────
interface NotesTabProps { patientId: string; }
function NotesTab({ patientId }: NotesTabProps) {
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formContent, setFormContent] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/therapist/patients/${patientId}/notes`)
      .then((r) => r.json())
      .then((d) => setNotes(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formContent.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/therapist/patients/${patientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: formDate, content: formContent }),
      });
      setShowForm(false);
      setFormContent("");
      setFormDate(new Date().toISOString().split("T")[0]);
      load();
    } finally { setSaving(false); }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button onClick={() => setShowForm((v) => !v)} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--mc-teal)", backgroundColor: "var(--mc-sky)", color: "var(--mc-primary)", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nueva nota
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} style={{ backgroundColor: "var(--mc-surface)", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "1.125rem", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--mc-text-muted)" }}>Fecha de la sesión</label>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--mc-border)", fontSize: "0.875rem", color: "var(--mc-text)", backgroundColor: "#fff", maxWidth: "200px" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--mc-text-muted)" }}>Notas de la sesión</label>
            <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={5} required placeholder="Observaciones clínicas, acuerdos, seguimiento..." style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--mc-border)", fontSize: "0.875rem", color: "var(--mc-text)", backgroundColor: "#fff", resize: "vertical", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: "0.4375rem 0.875rem", borderRadius: "0.5rem", border: "1px solid var(--mc-border)", backgroundColor: "#fff", color: "var(--mc-text-muted)", fontSize: "0.8125rem", cursor: "pointer" }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ padding: "0.4375rem 0.875rem", borderRadius: "0.5rem", border: "none", backgroundColor: "var(--mc-primary)", color: "#fff", fontSize: "0.8125rem", fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Guardando..." : "Guardar nota"}</button>
          </div>
        </form>
      )}
      {loading ? (
        <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>Cargando...</p>
      ) : notes.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)", textAlign: "center", padding: "2rem 0" }}>Sin notas de sesión.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {notes.map((note) => (
            <div key={note.id} style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "1rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--mc-primary)", marginBottom: "0.5rem" }}>{formatDate(note.date.split("T")[0])}</p>
              <p style={{ fontSize: "0.875rem", color: "var(--mc-text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Expediente: Recordatorios ───────────────────────────────────────────────
interface RemindersTabProps { patientId: string; }
function RemindersTab({ patientId }: RemindersTabProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"medicacion" | "actividad" | "cita" | "personalizado">("personalizado");
  const [formTitle, setFormTitle] = useState("");
  const [formTime, setFormTime] = useState("08:00");
  const [formRepeat, setFormRepeat] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/therapist/patients/${patientId}/reminders`)
      .then((r) => r.json())
      .then((d) => setReminders(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/therapist/patients/${patientId}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: formType, title: formTitle || REMINDER_TYPE_LABEL[formType], time: formTime, repeat: formRepeat }),
      });
      setShowForm(false);
      setFormTitle("");
      setFormTime("08:00");
      setFormRepeat(false);
      setFormType("personalizado");
      load();
    } finally { setSaving(false); }
  }

  async function handleDelete(reminderId: string) {
    if (!confirm("¿Eliminar este recordatorio?")) return;
    await fetch(`/api/therapist/patients/${patientId}/reminders/${reminderId}`, { method: "DELETE" });
    load();
  }

  const pending = reminders.filter((r) => r.status === "pendiente");
  const done = reminders.filter((r) => r.status === "completado");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button onClick={() => setShowForm((v) => !v)} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--mc-teal)", backgroundColor: "var(--mc-sky)", color: "var(--mc-primary)", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nuevo recordatorio
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} style={{ backgroundColor: "var(--mc-surface)", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "1.125rem", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--mc-text-muted)" }}>Tipo</label>
              <select value={formType} onChange={(e) => setFormType(e.target.value as typeof formType)} style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--mc-border)", fontSize: "0.875rem", color: "var(--mc-text)", backgroundColor: "#fff" }}>
                <option value="personalizado">✅ Personalizado</option>
                <option value="medicacion">💊 Medicación</option>
                <option value="actividad">🏃 Actividad</option>
                <option value="cita">📅 Cita</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--mc-text-muted)" }}>Hora</label>
              <input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} required style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--mc-border)", fontSize: "0.875rem", color: "var(--mc-text)", backgroundColor: "#fff" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--mc-text-muted)" }}>Título (opcional)</label>
            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder={REMINDER_TYPE_LABEL[formType]} style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--mc-border)", fontSize: "0.875rem", color: "var(--mc-text)", backgroundColor: "#fff" }} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--mc-text)", cursor: "pointer" }}>
            <input type="checkbox" checked={formRepeat} onChange={(e) => setFormRepeat(e.target.checked)} style={{ width: "14px", height: "14px" }} />
            Repetir diariamente
          </label>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: "0.4375rem 0.875rem", borderRadius: "0.5rem", border: "1px solid var(--mc-border)", backgroundColor: "#fff", color: "var(--mc-text-muted)", fontSize: "0.8125rem", cursor: "pointer" }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ padding: "0.4375rem 0.875rem", borderRadius: "0.5rem", border: "none", backgroundColor: "var(--mc-primary)", color: "#fff", fontSize: "0.8125rem", fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Guardando..." : "Enviar recordatorio"}</button>
          </div>
        </form>
      )}
      {loading ? (
        <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>Cargando...</p>
      ) : reminders.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)", textAlign: "center", padding: "2rem 0" }}>Sin recordatorios enviados.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {pending.length > 0 && <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Pendientes</p>}
          {pending.map((r) => <ReminderCard key={r.id} reminder={r} onDelete={handleDelete} />)}
          {done.length > 0 && <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: "0.5rem" }}>Completados</p>}
          {done.map((r) => <ReminderCard key={r.id} reminder={r} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

function ReminderCard({ reminder, onDelete }: { reminder: Reminder; onDelete: (id: string) => void }) {
  const isDone = reminder.status === "completado";
  return (
    <div style={{ backgroundColor: isDone ? "var(--mc-surface)" : "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", opacity: isDone ? 0.7 : 1 }}>
      <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>{REMINDER_TYPE_EMOJI[reminder.type] ?? "✅"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--mc-text)", textDecoration: isDone ? "line-through" : "none" }}>{reminder.title}</p>
        <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", marginTop: "0.125rem" }}>
          {REMINDER_TYPE_LABEL[reminder.type]} · {reminder.time}{reminder.repeat ? " · Diario" : ""}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        <span style={{ fontSize: "0.6875rem", fontWeight: 500, padding: "0.125rem 0.5rem", borderRadius: "9999px", backgroundColor: isDone ? "#dcfce7" : "#fef3c7", color: isDone ? "#16a34a" : "#d97706" }}>
          {isDone ? "Completado" : "Pendiente"}
        </span>
        <button onClick={() => onDelete(reminder.id)} title="Eliminar" style={{ padding: "0.3125rem 0.5rem", borderRadius: "0.375rem", border: "1px solid var(--mc-border)", backgroundColor: "var(--mc-surface)", color: "var(--mc-text-muted)", fontSize: "0.75rem", cursor: "pointer" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
        </button>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PatientDetailPage() {
  const params = useParams();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getUTCMonth());
  const [selectedYear, setSelectedYear] = useState(now.getUTCFullYear());
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expedienteTab, setExpedienteTab] = useState<"citas" | "notas" | "recordatorios">("citas");

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    fetch(`/api/therapist/patients/${params.id}?month=${selectedMonth}&year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => { if (!data.error) setPatient(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id, selectedMonth, selectedYear]);

  function handleMonthChange(month: number, year: number) {
    setSelectedMonth(month);
    setSelectedYear(year);
    setPatient(null);
  }

  async function handleDownloadPDF() {
    if (!patient) return;
    setGenerating(true);
    try { await downloadPDF(patient); } finally { setGenerating(false); }
  }

  const isCurrentMonth = selectedMonth === now.getUTCMonth() && selectedYear === now.getUTCFullYear();

  if (loading) {
    return (
      <div style={{ padding: "2rem 1.5rem" }}>
        <Link href="/therapist" style={{ fontSize: "0.8125rem", color: "var(--mc-text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem", marginBottom: "1.5rem" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Mis pacientes
        </Link>
        <div style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>Cargando...</div>
      </div>
    );
  }

  if (!patient) {
    return <div style={{ padding: "2rem 1.5rem", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>Paciente no encontrado.</div>;
  }

  const recordsWithMood = patient.records.filter((r) => r.mood !== null);
  const daysWithEntry = recordsWithMood.length;
  const percentage = Math.round((daysWithEntry / patient.records.length) * 100);
  const moodCounts: Record<string, number> = {};
  recordsWithMood.forEach((r) => { if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1; });
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const dominantOption = dominantMood ? MOOD_OPTIONS.find((m) => m.value === dominantMood) : null;
  const visibleMoods = MOOD_OPTIONS.filter((o) => (moodCounts[o.value] ?? 0) > 0);

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "720px" }}>

      {/* Encabezado */}
      <div style={{ marginBottom: "1.75rem" }}>
        <Link href="/therapist" style={{ fontSize: "0.8125rem", color: "var(--mc-text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem", marginBottom: "1rem" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Mis pacientes
        </Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--mc-sky)", border: "2px solid var(--mc-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: 700, color: "var(--mc-primary)", flexShrink: 0 }}>
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--mc-text)" }}>{patient.name}</h1>
              <p style={{ fontSize: "0.8125rem", color: "var(--mc-text-muted)" }}>{patient.email}</p>
            </div>
          </div>
          <button onClick={handleDownloadPDF} disabled={generating} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--mc-teal)", backgroundColor: generating ? "var(--mc-surface)" : "var(--mc-sky)", color: "var(--mc-primary)", fontSize: "0.8125rem", fontWeight: 500, cursor: generating ? "not-allowed" : "pointer", opacity: generating ? 0.7 : 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            {generating ? "Generando..." : "Descargar PDF"}
          </button>
        </div>
      </div>

      {/* Datos personales */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "1.25rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1rem" }}>Datos personales</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "Teléfono", value: patient.phone || "No registrado", icon: "📞" },
            { label: "Fecha de nacimiento", value: patient.birthdate ? formatDateLong(patient.birthdate) : "No registrada", icon: "🎂" },
            { label: "Correo", value: patient.email, icon: "✉️" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
              <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.1rem" }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: "0.6875rem", color: "var(--mc-text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.03em" }}>{item.label}</p>
                <p style={{ fontSize: "0.875rem", color: "var(--mc-text)", marginTop: "0.125rem" }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selector de mes */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)" }}>Seguimiento mensual</h2>
        <MonthSelector month={selectedMonth} year={selectedYear} onChange={handleMonthChange} />
      </div>

      {/* Tarjetas resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.875rem", marginBottom: "1.75rem" }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "1.125rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", fontWeight: 500 }}>Días registrados</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--mc-primary)", lineHeight: 1.2, marginTop: "0.375rem" }}>{daysWithEntry}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>de {patient.records.length} días · {percentage}%</p>
        </div>
        <div style={{ backgroundColor: dominantOption ? dominantOption.bg : "#fff", border: `1px solid ${dominantOption ? dominantOption.color : "var(--mc-border)"}`, borderRadius: "0.75rem", padding: "1.125rem" }}>
          <p style={{ fontSize: "0.75rem", color: dominantOption ? dominantOption.color : "var(--mc-text-muted)", fontWeight: 500 }}>Emoción predominante</p>
          <p style={{ fontSize: "1.25rem", fontWeight: 700, color: dominantOption ? dominantOption.color : "var(--mc-text-muted)", lineHeight: 1.2, marginTop: "0.375rem" }}>
            {dominantOption ? `${dominantOption.emoji} ${dominantOption.label}` : "Sin datos"}
          </p>
        </div>
      </div>

      {/* Gráfica */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "1.25rem", marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)", marginBottom: "1rem" }}>Estado de ánimo — {patient.month} {patient.year}</h2>
        {recordsWithMood.length === 0 ? (
          <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>Sin registros este mes.</div>
        ) : (
          <MoodChart records={toMoodRecords(patient.records)} />
        )}
      </div>

      {/* Calendario */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "1.25rem", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)" }}>Calendario del mes</h2>
          <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
            {visibleMoods.map((o) => (
              <div key={o.value} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.75rem" }}>{o.emoji}</span>
                <span style={{ fontSize: "0.625rem", color: "var(--mc-text-muted)" }}>{o.label}</span>
              </div>
            ))}
          </div>
        </div>
        <EmotionCalendar year={selectedYear} month={selectedMonth} records={patient.records} isCurrentMonth={isCurrentMonth} />
      </div>

      {/* Expediente */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", overflow: "hidden", marginBottom: "1.75rem" }}>
        <div style={{ padding: "1.125rem 1.25rem", borderBottom: "1px solid var(--mc-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)" }}>Expediente</h2>
          <div style={{ display: "flex", gap: "0.25rem", backgroundColor: "var(--mc-surface)", borderRadius: "0.5rem", padding: "0.25rem" }}>
            {(["citas", "notas", "recordatorios"] as const).map((tab) => (
              <button key={tab} onClick={() => setExpedienteTab(tab)}
                style={{ padding: "0.3125rem 0.875rem", borderRadius: "0.375rem", border: "none", backgroundColor: expedienteTab === tab ? "#fff" : "transparent", color: expedienteTab === tab ? "var(--mc-primary)" : "var(--mc-text-muted)", fontSize: "0.8125rem", fontWeight: expedienteTab === tab ? 600 : 400, cursor: "pointer", boxShadow: expedienteTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}
              >
                {tab === "citas" ? "📅 Citas" : tab === "notas" ? "📝 Notas" : "🔔 Recordatorios"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "1.25rem" }}>
          {expedienteTab === "citas" && <AppointmentsTab patientId={patient.id} />}
          {expedienteTab === "notas" && <NotesTab patientId={patient.id} />}
          {expedienteTab === "recordatorios" && <RemindersTab patientId={patient.id} />}
        </div>
      </div>

      {/* Registro detallado */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", overflow: "hidden" }}>
        <div style={{ padding: "1.125rem 1.25rem", borderBottom: "1px solid var(--mc-border)" }}>
          <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)" }}>Registro del mes</h2>
        </div>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {patient.records.slice().reverse().map((record) => {
            const option = record.mood ? MOOD_OPTIONS.find((m) => m.value === record.mood) : null;
            return (
              <div key={record.date} style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--mc-border)", display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                <span style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: option ? option.bg : "var(--mc-surface)", border: `1.5px solid ${option ? option.color : "var(--mc-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: option ? "1rem" : "0.625rem", flexShrink: 0 }}>
                  {option ? option.emoji : "—"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: option ? option.color : "var(--mc-text-muted)" }}>
                    {option ? option.label : "Sin registro"}
                  </p>
                  {record.note && <p style={{ fontSize: "0.8125rem", color: "var(--mc-text-secondary)", marginTop: "0.25rem", lineHeight: 1.5 }}>{record.note}</p>}
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", whiteSpace: "nowrap", textTransform: "capitalize" }}>
                  {formatDate(record.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

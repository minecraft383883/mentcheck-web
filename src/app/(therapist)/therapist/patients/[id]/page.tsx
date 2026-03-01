"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MoodChart from "@/components/stats/MoodChart";
import MonthSelector from "@/components/ui/MonthSelector";
import { MOOD_OPTIONS } from "@/types/diary";

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

const MOOD_LABELS: Record<string, string> = {
  alegria: "Alegr\u00eda",
  tristeza: "Tristeza",
  enojo: "Enojo",
  miedo: "Miedo",
  tedio: "Tedio",
  ansiedad: "Ansiedad",
  no_lo_se: "No lo s\u00e9",
};

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

  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Mentcheck", 14, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Agenda terap\u00e9utica", 14, 20);
  doc.setFontSize(11);
  doc.text("Reporte del Paciente", 14, 28);
  const today = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  doc.setFontSize(8);
  doc.text(`Generado: ${today}`, 196, 28, { align: "right" });

  let y = 44;

  doc.setTextColor(...PRIMARY);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Datos del paciente", 14, y);
  y += 2;
  doc.setDrawColor(...SKY);
  doc.setLineWidth(0.4);
  doc.line(14, y + 2, 196, y + 2);
  y += 8;

  const personalData: [string, string][] = [
    ["Nombre", patient.name || "No registrado"],
    ["Correo", patient.email || "No registrado"],
    ["Tel\u00e9fono", patient.phone || "No registrado"],
    ["Fecha de nacimiento", formatDateLong(patient.birthdate)],
  ];
  personalData.forEach(([label, value]) => {
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...MUTED);
    doc.text(label + ":", 14, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK);
    doc.text(value, 58, y);
    y += 6.5;
  });
  y += 4;

  doc.setTextColor(...PRIMARY); doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.text(`Resumen \u2014 ${patient.month} ${patient.year}`, 14, y);
  y += 2; doc.setDrawColor(...SKY); doc.line(14, y + 2, 196, y + 2); y += 8;

  const summaryData: [string, string][] = [
    ["D\u00edas registrados", `${daysWithEntry} de ${patient.records.length} d\u00edas (${percentage}%)`],
    ["Emoci\u00f3n predominante", dominantMood ? (MOOD_LABELS[dominantMood] ?? dominantMood) : "Sin datos"],
  ];
  summaryData.forEach(([label, value]) => {
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...MUTED);
    doc.text(label + ":", 14, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK);
    doc.text(value, 68, y);
    y += 6.5;
  });
  y += 4;

  doc.setTextColor(...PRIMARY); doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.text("Registro del mes", 14, y);
  y += 2; doc.setDrawColor(...SKY); doc.line(14, y + 2, 196, y + 2); y += 8;

  doc.setFillColor(...SKY);
  doc.rect(14, y - 5, 182, 7, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...PRIMARY);
  doc.text("Fecha", 16, y); doc.text("Estado de \u00e1nimo", 70, y); doc.text("Nota", 130, y);
  y += 5;

  recordsWithMood.slice().reverse().forEach((record, idx) => {
    if (y > 272) { doc.addPage(); y = 20; }
    if (idx % 2 === 0) { doc.setFillColor(248, 252, 255); doc.rect(14, y - 4, 182, 6.5, "F"); }
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK); doc.setFontSize(8);
    const dateLabel = new Date(record.date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" });
    doc.text(dateLabel, 16, y);
    doc.text(MOOD_LABELS[record.mood!] ?? record.mood!, 70, y);
    if (record.note) {
      const note = record.note.length > 38 ? record.note.substring(0, 35) + "..." : record.note;
      doc.text(note, 130, y);
    }
    y += 6.5;
  });

  if (recordsWithMood.length === 0) {
    doc.setFontSize(8.5); doc.setTextColor(...MUTED);
    doc.text("No hay registros este mes.", 14, y);
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(...MUTED);
    doc.text("Mentcheck \u2014 Agenda terap\u00e9utica", 14, 291);
    doc.text(`P\u00e1gina ${i} de ${pageCount}`, 196, 291, { align: "right" });
  }

  doc.save(`mentcheck-${patient.name.replace(/\s+/g, "-").toLowerCase()}-${patient.month.toLowerCase()}-${patient.year}.pdf`);
}

export default function PatientDetailPage() {
  const params = useParams();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getUTCMonth());
  const [selectedYear, setSelectedYear] = useState(now.getUTCFullYear());
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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
    try { await downloadPDF(patient); }
    finally { setGenerating(false); }
  }

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
          <button
            onClick={handleDownloadPDF}
            disabled={generating}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--mc-teal)", backgroundColor: generating ? "var(--mc-surface)" : "var(--mc-sky)", color: "var(--mc-primary)", fontSize: "0.8125rem", fontWeight: 500, cursor: generating ? "not-allowed" : "pointer", opacity: generating ? 0.7 : 1 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {generating ? "Generando..." : "Descargar PDF"}
          </button>
        </div>
      </div>

      {/* Datos personales */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "1.25rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1rem" }}>Datos personales</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "Tel\u00e9fono", value: patient.phone || "No registrado", icon: "\uD83D\uDCDE" },
            { label: "Fecha de nacimiento", value: patient.birthdate ? formatDateLong(patient.birthdate) : "No registrada", icon: "\uD83C\uDF82" },
            { label: "Correo", value: patient.email, icon: "\u2709\uFE0F" },
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
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)" }}>
          Seguimiento mensual
        </h2>
        <MonthSelector month={selectedMonth} year={selectedYear} onChange={handleMonthChange} />
      </div>

      {/* Tarjetas resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.875rem", marginBottom: "1.75rem" }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "1.125rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", fontWeight: 500 }}>Dias registrados</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--mc-primary)", lineHeight: 1.2, marginTop: "0.375rem" }}>{daysWithEntry}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>de {patient.records.length} dias \u00b7 {percentage}%</p>
        </div>
        <div style={{ backgroundColor: dominantOption ? dominantOption.bg : "#fff", border: `1px solid ${dominantOption ? dominantOption.color : "var(--mc-border)"}`, borderRadius: "0.75rem", padding: "1.125rem" }}>
          <p style={{ fontSize: "0.75rem", color: dominantOption ? dominantOption.color : "var(--mc-text-muted)", fontWeight: 500 }}>Emocion predominante</p>
          <p style={{ fontSize: "1.25rem", fontWeight: 700, color: dominantOption ? dominantOption.color : "var(--mc-text-muted)", lineHeight: 1.2, marginTop: "0.375rem" }}>
            {dominantOption ? `${dominantOption.emoji} ${dominantOption.label}` : "Sin datos"}
          </p>
        </div>
      </div>

      {/* Grafica */}
      <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "1.25rem", marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)", marginBottom: "1rem" }}>
          Estado de animo \u2014 {patient.month} {patient.year}
        </h2>
        {recordsWithMood.length === 0 ? (
          <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>Sin registros este mes.</div>
        ) : (
          <MoodChart records={patient.records} />
        )}
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
                  {option ? option.emoji : "\u2014"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: option ? option.color : "var(--mc-text-muted)" }}>
                    {option ? option.label : "Sin registro"}
                  </p>
                  {record.note && (
                    <p style={{ fontSize: "0.8125rem", color: "var(--mc-text-secondary)", marginTop: "0.25rem", lineHeight: 1.5 }}>{record.note}</p>
                  )}
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

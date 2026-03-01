"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MoodChart from "@/components/stats/MoodChart";
import { MOOD_OPTIONS } from "@/types/diary";

interface PatientDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  month: string;
  year: number;
  records: { date: string; mood: string | null; note: string | null; hasNote: boolean }[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function PatientDetailPage() {
  const params = useParams();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/therapist/patients/${params.id}`)
      .then((res) => res.json())
      .then((data) => { if (!data.error) setPatient(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div style={{ padding: "2rem 1.5rem", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>Cargando...</div>;
  }

  if (!patient) {
    return <div style={{ padding: "2rem 1.5rem", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>Paciente no encontrado.</div>;
  }

  const recordsWithMood = patient.records.filter((r) => r.mood !== null);
  const daysWithEntry = recordsWithMood.length;
  const percentage = Math.round((daysWithEntry / patient.records.length) * 100);

  const moodCounts: Record<string, number> = {};
  recordsWithMood.forEach((r) => {
    if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
  });
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const dominantOption = dominantMood ? MOOD_OPTIONS.find((m) => m.value === dominantMood) : null;

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "720px" }}>
      {/* Encabezado */}
      <div style={{ marginBottom: "1.75rem" }}>
        <Link href="/therapist" style={{ fontSize: "0.8125rem", color: "var(--mc-text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem", marginBottom: "1rem" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Mis pacientes
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--mc-sky)", border: "2px solid var(--mc-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: 700, color: "var(--mc-primary)", flexShrink: 0 }}>
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--mc-text)" }}>{patient.name}</h1>
            <p style={{ fontSize: "0.8125rem", color: "var(--mc-text-muted)" }}>{patient.email}</p>
          </div>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.875rem", marginBottom: "1.75rem" }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "1.125rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", fontWeight: 500 }}>Dias registrados</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--mc-primary)", lineHeight: 1.2, marginTop: "0.375rem" }}>{daysWithEntry}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>de {patient.records.length} dias · {percentage}%</p>
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
          Estado de animo — {patient.month} {patient.year}
        </h2>
        {recordsWithMood.length === 0 ? (
          <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
            Sin registros este mes.
          </div>
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
          {patient.records
            .slice()
            .reverse()
            .map((record) => {
              const option = record.mood ? MOOD_OPTIONS.find((m) => m.value === record.mood) : null;
              return (
                <div key={record.date} style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--mc-border)", display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                  <span style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: option ? option.bg : "var(--mc-surface)", border: `1.5px solid ${option ? option.color : "var(--mc-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: option ? "1rem" : "0.625rem", flexShrink: 0 }}>
                    {option ? option.emoji : "—"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: option ? option.color : "var(--mc-text-muted)" }}>
                      {option ? option.label : "No hubo notas hoy"}
                    </p>
                    {record.note && (
                      <p style={{ fontSize: "0.8125rem", color: "var(--mc-text-secondary)", marginTop: "0.25rem", lineHeight: 1.5 }}>
                        {record.note}
                      </p>
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

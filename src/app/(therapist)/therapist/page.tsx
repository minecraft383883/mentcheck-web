"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOOD_OPTIONS } from "@/types/diary";

interface Patient {
  id: string;
  name: string;
  email: string;
  lastMood: string | null;
  hasEntryToday: boolean;
  linkedAt: string;
}

export default function TherapistDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const router = useRouter();

  function load() {
    setLoading(true);
    fetch("/api/therapist/patients")
      .then((res) => res.json())
      .then((data) => { if (data.patients) setPatients(data.patients); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleRemove(patient: Patient) {
    if (!confirm(`¿Dar de baja a ${patient.name}? Se eliminará la vinculación terapéutica. Esta acción no se puede deshacer.`)) return;
    setRemovingId(patient.id);
    try {
      await fetch("/api/therapist/patients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientProfileId: patient.id }),
      });
      load();
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "780px" }}>
      <div style={{ marginBottom: "1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 600, color: "var(--mc-text)", letterSpacing: "-0.01em" }}>
            Mis pacientes
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>
            {patients.length} paciente{patients.length !== 1 ? "s" : ""} vinculado{patients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/therapist/invite"
          style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", backgroundColor: "var(--mc-primary)", color: "#fff", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}
        >
          Generar codigo
        </Link>
      </div>

      {loading ? (
        <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>Cargando pacientes...</p>
      ) : patients.length === 0 ? (
        <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "3rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--mc-text)" }}>
            No tienes pacientes vinculados
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)", marginTop: "0.5rem" }}>
            Genera un codigo de invitacion y compartelo con tu paciente para vincularlo.
          </p>
          <Link
            href="/therapist/invite"
            style={{ display: "inline-block", marginTop: "1.25rem", padding: "0.5rem 1.25rem", borderRadius: "0.5rem", backgroundColor: "var(--mc-primary)", color: "#fff", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none" }}
          >
            Generar primer codigo
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {patients.map((patient) => {
            const moodOption = patient.lastMood
              ? MOOD_OPTIONS.find((m) => m.value === patient.lastMood)
              : null;
            const isRemoving = removingId === patient.id;

            return (
              <div
                key={patient.id}
                style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "1.125rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", opacity: isRemoving ? 0.5 : 1, transition: "opacity 0.2s" }}
              >
                {/* Avatar */}
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "var(--mc-sky)", border: "1.5px solid var(--mc-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "var(--mc-primary)", flexShrink: 0 }}>
                  {patient.name.charAt(0).toUpperCase()}
                </div>

                {/* Info — clickable */}
                <Link
                  href={`/therapist/patients/${patient.id}`}
                  style={{ flex: 1, minWidth: 0, textDecoration: "none" }}
                >
                  <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--mc-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {patient.name}
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--mc-text-muted)", marginTop: "0.125rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {patient.email}
                  </p>
                </Link>

                {/* Estado hoy */}
                <div style={{ flexShrink: 0 }}>
                  {patient.hasEntryToday ? (
                    <span style={{ fontSize: "1.125rem" }}>{moodOption?.emoji ?? "?"}</span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", backgroundColor: "var(--mc-surface)", padding: "0.25rem 0.5rem", borderRadius: "999px", border: "1px solid var(--mc-border)" }}>
                      Sin registro hoy
                    </span>
                  )}
                </div>

                {/* Botón dar de baja */}
                <button
                  onClick={() => handleRemove(patient)}
                  disabled={isRemoving}
                  title="Dar de baja al paciente"
                  style={{ padding: "0.375rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #dc2626", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: "0.75rem", fontWeight: 500, cursor: isRemoving ? "not-allowed" : "pointer", flexShrink: 0, whiteSpace: "nowrap" }}
                >
                  {isRemoving ? "..." : "Dar de baja"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

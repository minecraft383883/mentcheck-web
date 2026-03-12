"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MOOD_OPTIONS } from "@/types/diary";

interface DashboardData {
  name: string;
  hasEntryToday: boolean;
  lastMood: string | null;
  emergencyPhone: string | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function formatFirstName(fullName: string): string {
  return fullName.split(" ")[0];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem 1.5rem", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
        Cargando...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "2rem 1.5rem", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
        No se pudo cargar el dashboard.
      </div>
    );
  }

  const moodOption = data.lastMood
    ? MOOD_OPTIONS.find((m) => m.value === data.lastMood)
    : null;

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "720px" }}>
      {/* Saludo */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.375rem",
            fontWeight: 600,
            color: "var(--mc-text)",
            letterSpacing: "-0.01em",
          }}
        >
          {getGreeting()}, {formatFirstName(data.name)}
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Tarjeta estado del día */}
      <div
        style={{
          backgroundColor: data.hasEntryToday
            ? (moodOption?.bg ?? "var(--mc-sky)")
            : "var(--mc-sky)",
          border: `1px solid ${data.hasEntryToday ? (moodOption?.color ?? "var(--mc-teal)") : "var(--mc-teal)"}`,
          borderRadius: "0.875rem",
          padding: "1.25rem 1.5rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: data.hasEntryToday ? moodOption?.color : "var(--mc-primary)",
            }}
          >
            {data.hasEntryToday ? "Registro de hoy" : "Sin registro hoy"}
          </p>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: data.hasEntryToday ? moodOption?.color : "var(--mc-primary)",
              marginTop: "0.25rem",
            }}
          >
            {data.hasEntryToday
              ? `${moodOption?.emoji ?? ""} ${moodOption?.label ?? data.lastMood}`
              : "¿Cómo te sientes hoy?"}
          </p>
        </div>
        <Link
          href="/dashboard/diary"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            backgroundColor: data.hasEntryToday ? moodOption?.color : "var(--mc-primary)",
            color: "#fff",
            fontSize: "0.8125rem",
            fontWeight: 500,
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {data.hasEntryToday ? "Ver diario" : "Registrar"}
        </Link>
      </div>

      {/* Accesos rápidos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        {[
          { href: "/dashboard/diary", label: "Diario", desc: "Escribe tu día" },
          { href: "/dashboard/reminders", label: "Mi info", desc: "Citas, notas y recordatorios" },
          { href: "/dashboard/profile", label: "Perfil", desc: "Edita tus datos" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              backgroundColor: "#fff",
              border: "1px solid var(--mc-border)",
              borderRadius: "0.875rem",
              padding: "1rem",
              textDecoration: "none",
              display: "block",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--mc-teal)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--mc-border)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
            }}
          >
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--mc-text)" }}>
              {item.label}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>
              {item.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Botón emergencia */}
      {data.emergencyPhone && (
        <a
          href={`tel:${data.emergencyPhone}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.625rem",
            width: "100%",
            padding: "0.875rem",
            borderRadius: "0.875rem",
            border: "1.5px solid #e53e3e",
            backgroundColor: "#fff5f5",
            color: "#c53030",
            fontSize: "0.9375rem",
            fontWeight: 600,
            textDecoration: "none",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#fed7d7")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#fff5f5")
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Llamar contacto de emergencia
        </a>
      )}
    </div>
  );
}

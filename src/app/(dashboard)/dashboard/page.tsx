import Link from "next/link";
import DashboardCard from "@/components/ui/DashboardCard";

const cards = [
  {
    href: "/dashboard/diary",
    title: "Diario",
    description: "Registra cómo te sientes hoy",
    accent: "var(--mc-teal)",
    bg: "var(--mc-sky)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/dashboard/reminders",
    title: "Recordatorios",
    description: "Revisa tus pendientes del día",
    accent: "var(--mc-blue)",
    bg: "#edf6ff",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    href: "/dashboard/progress",
    title: "Progreso",
    description: "Tu evolución del mes",
    accent: "var(--mc-primary)",
    bg: "var(--mc-mint)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

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
          {getGreeting()}
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

      {/* Aviso si no hay entrada hoy */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "0.75rem",
          backgroundColor: "var(--mc-sky)",
          border: "1px solid var(--mc-teal)",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div>
          <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--mc-primary)" }}>
            No has registrado tu estado de hoy
          </p>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--mc-text-secondary)",
              marginTop: "0.125rem",
            }}
          >
            Toma un momento para escribir en tu diario
          </p>
        </div>
        <Link
          href="/dashboard/diary"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            backgroundColor: "var(--mc-primary)",
            color: "#fff",
            fontSize: "0.8125rem",
            fontWeight: 500,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Registrar
        </Link>
      </div>

      {/* Tarjetas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {cards.map((card) => (
          <DashboardCard key={card.href} {...card} />
        ))}
      </div>
    </div>
  );
}

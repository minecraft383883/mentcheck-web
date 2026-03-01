"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/dashboard/diary",
    label: "Diario",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/dashboard/reminders",
    label: "Recordatorios",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    href: "/dashboard/progress",
    label: "Progreso",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Perfil",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [emergencyPhone, setEmergencyPhone] = useState<string | null>(null);
  const [emergencyName, setEmergencyName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.emergencyContact?.phone) {
          setEmergencyPhone(data.emergencyContact.phone);
          setEmergencyName(data.emergencyContact.name || null);
        }
      })
      .catch(() => {});
  }, []);

  function handleEmergency() {
    if (emergencyPhone) {
      window.location.href = `tel:${emergencyPhone}`;
    } else {
      router.push("/dashboard/profile");
    }
  }

  return (
    <>
      {/* Sidebar desktop */}
      <aside
        className="sidebar-desktop"
        style={{
          width: "220px",
          minHeight: "100vh",
          backgroundColor: "#fff",
          borderRight: "1px solid var(--mc-border)",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "1.5rem 1.25rem 1.25rem", borderBottom: "1px solid var(--mc-border)" }}>
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--mc-primary)", letterSpacing: "-0.01em" }}>
            Mentcheck
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", marginTop: "0.125rem" }}>
            Agenda terapéutica
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: active ? 500 : 400,
                  color: active ? "var(--mc-primary)" : "var(--mc-text-secondary)",
                  backgroundColor: active ? "var(--mc-sky)" : "transparent",
                  textDecoration: "none",
                  transition: "background-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--mc-surface)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--mc-border)" }}>
          {/* Info del usuario */}
          <div style={{ padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: "0.625rem", borderBottom: "1px solid var(--mc-border)" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "var(--mc-sky)", border: "1.5px solid var(--mc-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--mc-primary)", flexShrink: 0 }}>
              {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--mc-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session?.user?.name ?? "Usuario"}
              </p>
              <p style={{ fontSize: "0.6875rem", color: "var(--mc-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session?.user?.email ?? ""}
              </p>
            </div>
          </div>

          {/* Botones */}
          <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {/* Boton emergencia */}
            <button
              onClick={handleEmergency}
              title={emergencyPhone ? `Llamar a ${emergencyName ?? emergencyPhone}` : "Configura un contacto de emergencia en tu perfil"}
              style={{
                width: "100%",
                padding: "0.625rem",
                borderRadius: "0.5rem",
                border: "1.5px solid #e53e3e",
                backgroundColor: "#fff5f5",
                color: "#c53030",
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fed7d7")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fff5f5")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {emergencyPhone
                ? `Llamar a ${emergencyName ?? emergencyPhone}`
                : "Linea de emergencia"}
            </button>

            {/* Alerta si no hay contacto configurado */}
            {!emergencyPhone && (
              <p style={{ fontSize: "0.6875rem", color: "#c53030", textAlign: "center", lineHeight: 1.4 }}>
                Configura tu contacto en{" "}
                <Link href="/dashboard/profile" style={{ color: "#c53030", fontWeight: 500 }}>
                  Perfil
                </Link>
              </p>
            )}

            {/* Cerrar sesion */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                width: "100%",
                padding: "0.625rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--mc-border)",
                backgroundColor: "transparent",
                color: "var(--mc-text-muted)",
                fontSize: "0.8125rem",
                fontWeight: 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--mc-surface)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--mc-text)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--mc-text-muted)";
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesion
            </button>
          </div>
        </div>
      </aside>

      {/* Nav inferior mobile */}
      <nav
        className="sidebar-mobile"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTop: "1px solid var(--mc-border)",
          zIndex: 40,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.625rem 0.25rem",
                gap: "0.25rem",
                color: active ? "var(--mc-primary)" : "var(--mc-text-muted)",
                textDecoration: "none",
                fontSize: "0.6875rem",
                fontWeight: active ? 500 : 400,
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {/* Boton emergencia mobile */}
        <button
          onClick={handleEmergency}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.625rem 0.25rem",
            gap: "0.25rem",
            color: "#c53030",
            fontSize: "0.6875rem",
            fontWeight: 500,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          SOS
        </button>
      </nav>
    </>
  );
}

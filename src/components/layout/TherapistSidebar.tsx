"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  {
    href: "/therapist",
    label: "Pacientes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/therapist/invite",
    label: "Códigos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M7 15h0M12 15h0M17 15h0" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
];

const logoutIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function TherapistSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      {/* Sidebar desktop */}
      <aside
        className="sidebar-desktop"
        style={{ width: "220px", minHeight: "100vh", backgroundColor: "#fff", borderRight: "1px solid var(--mc-border)", flexDirection: "column", position: "fixed", top: 0, left: 0, zIndex: 40 }}
      >
        {/* Logo */}
        <div style={{ padding: "1.5rem 1.25rem 1.25rem", borderBottom: "1px solid var(--mc-border)" }}>
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--mc-primary)", letterSpacing: "-0.01em" }}>Mentcheck</p>
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", marginTop: "0.125rem" }}>Panel del psicólogo</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: active ? 500 : 400, color: active ? "var(--mc-primary)" : "var(--mc-text-secondary)", backgroundColor: active ? "var(--mc-sky)" : "transparent", textDecoration: "none", transition: "background-color 0.15s, color 0.15s" }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--mc-surface)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Usuario + logout desktop */}
        <div style={{ borderTop: "1px solid var(--mc-border)" }}>
          <div style={{ padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: "0.625rem", borderBottom: "1px solid var(--mc-border)" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "var(--mc-sky)", border: "1.5px solid var(--mc-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--mc-primary)", flexShrink: 0 }}>
              {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--mc-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session?.user?.name ?? "Psicólogo"}
              </p>
              <p style={{ fontSize: "0.6875rem", color: "var(--mc-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session?.user?.email ?? ""}
              </p>
            </div>
          </div>
          <div style={{ padding: "0.75rem" }}>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{ width: "100%", padding: "0.625rem", borderRadius: "0.5rem", border: "1px solid var(--mc-border)", backgroundColor: "transparent", color: "var(--mc-text-muted)", fontSize: "0.8125rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--mc-surface)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--mc-text)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--mc-text-muted)"; }}
            >
              {logoutIcon}
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Nav inferior mobile — incluye logout */}
      <nav
        className="sidebar-mobile"
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTop: "1px solid var(--mc-border)", zIndex: 40, paddingBottom: "env(safe-area-inset-bottom)", display: "flex" }}
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0.625rem 0.25rem", gap: "0.25rem", color: active ? "var(--mc-primary)" : "var(--mc-text-muted)", textDecoration: "none", fontSize: "0.6875rem", fontWeight: active ? 500 : 400 }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {/* Logout mobile */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0.625rem 0.25rem", gap: "0.25rem", color: "#c53030", backgroundColor: "transparent", border: "none", fontSize: "0.6875rem", fontWeight: 400, cursor: "pointer" }}
        >
          {logoutIcon}
          Salir
        </button>
      </nav>
    </>
  );
}

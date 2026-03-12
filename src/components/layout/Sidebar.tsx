"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
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
        <polyline points="10 9 9 9 8 9" />
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

const logoutIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Sidebar() {
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
        <div style={{ padding: "1.25rem 1.99rem 1rem", borderBottom: "1px solid var(--mc-border)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
          <img
            src="/logo.png"
            alt="Mentcheck"
            style={{ height: "100px", width: "auto", objectFit: "contain" }}
          />
          <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)" }}></p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
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
                {session?.user?.name ?? "Paciente"}
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

      {/* Nav inferior mobile */}
      <nav
        className="sidebar-mobile"
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTop: "1px solid var(--mc-border)", zIndex: 40, paddingBottom: "env(safe-area-inset-bottom)", display: "flex" }}
      >
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
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

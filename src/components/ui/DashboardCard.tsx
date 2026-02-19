"use client";

import Link from "next/link";

interface DashboardCardProps {
  href: string;
  title: string;
  description: string;
  accent: string;
  bg: string;
  icon: React.ReactNode;
}

export default function DashboardCard({
  href,
  title,
  description,
  accent,
  bg,
  icon,
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "1.25rem",
        borderRadius: "0.75rem",
        backgroundColor: "#fff",
        border: "1px solid var(--mc-border)",
        textDecoration: "none",
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = accent;
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--mc-border)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "0.5rem",
          backgroundColor: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          marginBottom: "0.875rem",
        }}
      >
        {icon}
      </div>
      <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--mc-text)" }}>
        {title}
      </p>
      <p style={{ fontSize: "0.8125rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>
        {description}
      </p>
    </Link>
  );
}

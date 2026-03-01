"use client";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface MonthSelectorProps {
  month: number; // 0-11
  year: number;
  onChange: (month: number, year: number) => void;
}

export default function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const now = new Date();
  const isCurrentMonth = month === now.getUTCMonth() && year === now.getUTCFullYear();

  function prev() {
    if (month === 0) onChange(11, year - 1);
    else onChange(month - 1, year);
  }

  function next() {
    if (isCurrentMonth) return;
    if (month === 11) onChange(0, year + 1);
    else onChange(month + 1, year);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <button
        onClick={prev}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "0.375rem",
          border: "1px solid var(--mc-border)",
          backgroundColor: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--mc-text-secondary)",
          flexShrink: 0,
        }}
        title="Mes anterior"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--mc-text)", minWidth: "140px", textAlign: "center" }}>
        {MONTH_NAMES[month]} {year}
      </span>

      <button
        onClick={next}
        disabled={isCurrentMonth}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "0.375rem",
          border: "1px solid var(--mc-border)",
          backgroundColor: isCurrentMonth ? "var(--mc-surface)" : "#fff",
          cursor: isCurrentMonth ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isCurrentMonth ? "var(--mc-text-muted)" : "var(--mc-text-secondary)",
          opacity: isCurrentMonth ? 0.45 : 1,
          flexShrink: 0,
        }}
        title={isCurrentMonth ? "Mes actual" : "Mes siguiente"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

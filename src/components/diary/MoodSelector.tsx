"use client";

import { Mood, MoodOption, MOOD_OPTIONS } from "@/types/diary";

interface MoodSelectorProps {
  selected: Mood | null;
  onChange: (mood: Mood) => void;
}

export default function MoodSelector({ selected, onChange }: MoodSelectorProps) {
  return (
    <div>
      <p
        style={{
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "var(--mc-text-secondary)",
          marginBottom: "0.75rem",
        }}
      >
        ¿Cómo te sientes hoy?
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "0.5rem",
        }}
      >
        {MOOD_OPTIONS.map((option: MoodOption) => {
          const active = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              title={option.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.625rem 0.25rem",
                borderRadius: "0.625rem",
                border: `1.5px solid ${active ? option.color : "var(--mc-border)"}`,
                backgroundColor: active ? option.bg : "#fff",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = option.color;
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = option.bg;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--mc-border)";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fff";
                }
              }}
            >
              {/* Simbolo */}
              <span
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: option.bg,
                  border: `1.5px solid ${option.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: option.color,
                  flexShrink: 0,
                }}
              >
                {option.symbol}
              </span>
              <span
                style={{
                  fontSize: "0.625rem",
                  color: active ? option.color : "var(--mc-text-muted)",
                  fontWeight: active ? 600 : 400,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

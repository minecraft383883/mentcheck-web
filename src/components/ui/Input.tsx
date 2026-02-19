import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: React.ReactNode;
  error?: string;
}

export default function Input({ label, hint, error, id, ...props }: InputProps) {
  const [focused, setFocused] = React.useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label
          htmlFor={inputId}
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--mc-text-secondary)",
          }}
        >
          {label}
        </label>
        {hint && (
          <span style={{ fontSize: "0.75rem", color: "var(--mc-blue)" }}>
            {hint}
          </span>
        )}
      </div>
      <input
        id={inputId}
        style={{
          width: "100%",
          padding: "0.625rem 0.875rem",
          fontSize: "0.875rem",
          borderRadius: "0.5rem",
          border: `1px solid ${error ? "#e53e3e" : focused ? "var(--mc-teal)" : "var(--mc-border)"}`,
          boxShadow: focused ? "0 0 0 3px var(--mc-mint)" : error ? "0 0 0 3px #fed7d7" : "none",
          outline: "none",
          color: "var(--mc-text)",
          backgroundColor: "#fff",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && (
        <span style={{ fontSize: "0.75rem", color: "#e53e3e" }}>{error}</span>
      )}
    </div>
  );
}

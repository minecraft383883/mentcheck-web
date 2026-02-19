import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

const styles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "var(--mc-primary)",
    color: "#fff",
    border: "1px solid transparent",
  },
  secondary: {
    backgroundColor: "#fff",
    color: "var(--mc-text-secondary)",
    border: "1px solid var(--mc-border)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--mc-primary)",
    border: "1px solid transparent",
  },
};

const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { backgroundColor: "var(--mc-primary-hover)" },
  secondary: { backgroundColor: "var(--mc-surface)" },
  ghost: { backgroundColor: "var(--mc-surface)" },
};

export default function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  disabled,
  ...props
}: ButtonProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      disabled={disabled || loading}
      style={{
        ...styles[variant],
        ...(hovered && !disabled && !loading ? hoverStyles[variant] : {}),
        width: fullWidth ? "100%" : undefined,
        padding: "0.625rem 1rem",
        fontSize: "0.875rem",
        fontWeight: 500,
        borderRadius: "0.5rem",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "background-color 0.15s, opacity 0.15s",
        ...style,
      }}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      {...props}
    >
      {loading ? "Cargando..." : children}
    </button>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Role = "PATIENT" | "THERAPIST";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("PATIENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ocurrió un error. Intenta de nuevo.");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--mc-surface)" }}
    >
      <div className="mb-8 text-center">
        <p
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--mc-primary)" }}
        >
          Mentcheck
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--mc-text-muted)" }}>
          Agenda terapéutica
        </p>
      </div>

      <div
        className="w-full max-w-md rounded-xl px-8 py-10"
        style={{
          backgroundColor: "#fff",
          border: "1px solid var(--mc-border)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <h1 className="text-xl font-semibold" style={{ color: "var(--mc-text)" }}>
          Crear cuenta
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--mc-text-muted)" }}>
          Selecciona tu tipo de cuenta para comenzar
        </p>

        {/* Selector de rol */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "1.5rem",
            backgroundColor: "var(--mc-surface)",
            border: "1px solid var(--mc-border)",
            borderRadius: "0.625rem",
            padding: "0.25rem",
          }}
        >
          {(["PATIENT", "THERAPIST"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                flex: 1,
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: role === r ? 500 : 400,
                color: role === r ? "var(--mc-primary)" : "var(--mc-text-secondary)",
                backgroundColor: role === r ? "#fff" : "transparent",
                border: role === r ? "1px solid var(--mc-border)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: role === r ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {r === "PATIENT" ? "Paciente" : "Psicólogo"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <Input
            label="Nombre completo"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
          />
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <Input
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              required
            />
            {passwordMismatch && (
              <p style={{ fontSize: "0.75rem", color: "#c53030", marginTop: "0.125rem" }}>
                Las contraseñas no coinciden.
              </p>
            )}
            {!passwordMismatch && confirmPassword.length > 0 && password === confirmPassword && (
              <p style={{ fontSize: "0.75rem", color: "#276749", marginTop: "0.125rem" }}>
                ✓ Las contraseñas coinciden.
              </p>
            )}
          </div>

          {error && (
            <div
              style={{
                padding: "0.625rem 1rem",
                borderRadius: "0.5rem",
                backgroundColor: "#fff5f5",
                border: "1px solid #fed7d7",
                fontSize: "0.8125rem",
                color: "#c53030",
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={passwordMismatch || loading}
          >
            Crear cuenta
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--mc-text-muted)" }}>
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium hover:underline"
            style={{ color: "var(--mc-primary)" }}
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

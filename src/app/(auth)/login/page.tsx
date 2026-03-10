"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

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
          Iniciar sesión
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--mc-text-muted)" }}>
          Ingresa a tu cuenta para continuar
        </p>

        {registered && (
          <div
            style={{
              marginTop: "1.25rem",
              padding: "0.625rem 1rem",
              borderRadius: "0.5rem",
              backgroundColor: "#f0fff4",
              border: "1px solid #9ae6b4",
              fontSize: "0.8125rem",
              color: "#276749",
            }}
          >
            Cuenta creada correctamente. Inicia sesión para continuar.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
            hint={
              <Link href="/forgot-password" style={{ color: "var(--mc-blue)" }}>
                ¿Olvidaste tu contraseña?
              </Link>
            }
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="········"
            required
          />

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

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Iniciar sesión
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--mc-text-muted)" }}>
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-medium hover:underline"
            style={{ color: "var(--mc-primary)" }}
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

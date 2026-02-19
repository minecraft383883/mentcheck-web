"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--mc-surface)" }}
    >
      {/* Marca */}
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

      {/* Tarjeta */}
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
          Completa tus datos para comenzar
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
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

          <Button type="submit" variant="primary" fullWidth loading={loading}>
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

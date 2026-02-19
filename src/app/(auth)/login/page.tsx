"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Logica de autenticacion se conecta aqui en la Fase 3
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--mc-surface)" }}>

      {/* Marca */}
      <div className="mb-8 text-center">
        <p className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--mc-primary)" }}>
          Mentcheck
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--mc-text-muted)" }}>
          Agenda terapéutica
        </p>
      </div>

      {/* Tarjeta */}
      <div className="w-full max-w-md rounded-xl px-8 py-10"
        style={{
          backgroundColor: "var(--mc-white, #fff)",
          border: "1px solid var(--mc-border)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>

        <h1 className="text-xl font-semibold" style={{ color: "var(--mc-text)" }}>
          Iniciar sesión
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--mc-text-muted)" }}>
          Ingresa a tu cuenta para continuar
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">

          {/* Email */} <Input
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          required
          hint={<Link href="/forgot-password" style={{ color: "var(--mc-blue)" }}>¿Olvidaste tu contraseña?</Link>}
        />

          {/* Contrasena */}
          <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

          {/* Boton principal */}
          <Button type="submit" variant="primary" fullWidth loading={loading}>
  Iniciar sesión
</Button>

        </form>

        {/* Divisor */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--mc-border)" }} />
          <span className="text-xs" style={{ color: "var(--mc-text-muted)" }}>o</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--mc-border)" }} />
        </div>

        {/* Invitado */}
        <Button type="button" variant="secondary" fullWidth>
  Continuar como invitado
</Button>


        <p className="text-center text-sm mt-6" style={{ color: "var(--mc-text-muted)" }}>
          ¿No tienes cuenta?{" "}
          <Link href="/register"
            className="font-medium hover:underline"
            style={{ color: "var(--mc-primary)" }}>
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}

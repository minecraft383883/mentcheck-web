"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

interface InviteCode {
  id: string;
  code: string;
  expiresAt: string;
}

export default function InvitePage() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  async function fetchCodes() {
    try {
      const res = await fetch("/api/therapist/invite");
      const data = await res.json();
      if (data.codes) setCodes(data.codes);
    } catch (error) {
      console.error("Error al cargar codigos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/therapist/invite", { method: "POST" });
      const data = await res.json();
      if (data.code) await fetchCodes();
    } catch (error) {
      console.error("Error al generar codigo:", error);
    } finally {
      setGenerating(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  function formatExpiry(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "580px" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 600, color: "var(--mc-text)", letterSpacing: "-0.01em" }}>
          Codigos de invitacion
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>
          Genera un codigo y compartelo con tu paciente para vincularlo a tu panel.
        </p>
      </div>

      {/* Instrucciones */}
      <div style={{ backgroundColor: "var(--mc-sky)", border: "1px solid var(--mc-teal)", borderRadius: "0.875rem", padding: "1.125rem 1.25rem", marginBottom: "1.75rem" }}>
        <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--mc-primary)", marginBottom: "0.5rem" }}>
          Como funciona
        </p>
        <ol style={{ paddingLeft: "1.125rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {[
            "Genera un codigo de invitacion.",
            "Compartelo con tu paciente (por mensaje o en consulta).",
            "El paciente lo ingresa en su perfil, seccion Vincular psicologo.",
            "Queda vinculado y puedes ver su progreso desde aqui.",
          ].map((step, i) => (
            <li key={i} style={{ fontSize: "0.8125rem", color: "var(--mc-primary)" }}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <Button variant="primary" onClick={handleGenerate} loading={generating}>
        Generar nuevo codigo
      </Button>

      {/* Lista de codigos activos */}
      <div style={{ marginTop: "1.75rem" }}>
        <h2 style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
          Codigos activos
        </h2>

        {loading ? (
          <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>Cargando...</p>
        ) : codes.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
            No tienes codigos activos. Genera uno para comenzar.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {codes.map((item) => (
              <div
                key={item.id}
                style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.75rem", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <p style={{ flex: 1, fontSize: "1.125rem", fontWeight: 700, color: "var(--mc-text)", letterSpacing: "0.1em", fontFamily: "monospace" }}>
                  {item.code}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", whiteSpace: "nowrap" }}>
                  Expira {formatExpiry(item.expiresAt)}
                </p>
                <button
                  onClick={() => copyCode(item.code)}
                  style={{ background: "none", border: "1px solid var(--mc-border)", borderRadius: "0.375rem", padding: "0.375rem 0.625rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: 500, color: copied === item.code ? "#276749" : "var(--mc-text-secondary)", backgroundColor: copied === item.code ? "#f0fff4" : "#fff", transition: "all 0.15s", whiteSpace: "nowrap" }}
                >
                  {copied === item.code ? "Copiado" : "Copiar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

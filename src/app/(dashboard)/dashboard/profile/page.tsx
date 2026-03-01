"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PatientProfile } from "@/types/profile";

const EMPTY_PROFILE: PatientProfile = {
  name: "",
  email: "",
  phone: "",
  birthdate: "",
  emergencyContact: { name: "", phone: "", relationship: "" },
};

type Section = "personal" | "emergency" | "link";

export default function ProfilePage() {
  const [profile, setProfile] = useState<PatientProfile>(EMPTY_PROFILE);
  const [activeSection, setActiveSection] = useState<Section>("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [linkCode, setLinkCode] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (res.ok) setProfile(data);
    } catch (err) {
      console.error("Error al cargar perfil:", err);
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof PatientProfile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function updateEmergency(field: keyof PatientProfile["emergencyContact"], value: string) {
    setProfile((prev) => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [field]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ocurrio un error al guardar."); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error al guardar perfil:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    setLinkError("");
    setLinkSuccess("");
    setLinking(true);
    try {
      const res = await fetch("/api/patient/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: linkCode }),
      });
      const data = await res.json();
      if (!res.ok) { setLinkError(data.error || "Ocurrio un error."); return; }
      setLinkSuccess(`Vinculado correctamente con ${data.therapistName}.`);
      setLinkCode("");
    } catch {
      setLinkError("No se pudo conectar con el servidor.");
    } finally {
      setLinking(false);
    }
  }

  const tabs: { value: Section; label: string }[] = [
    { value: "personal", label: "Datos personales" },
    { value: "emergency", label: "Contacto de emergencia" },
    { value: "link", label: "Vincular psicologo" },
  ];

  if (loading) {
    return (
      <div style={{ padding: "2rem 1.5rem", fontSize: "0.875rem", color: "var(--mc-text-muted)" }}>
        Cargando perfil...
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "580px" }}>
      {/* Encabezado */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 600, color: "var(--mc-text)", letterSpacing: "-0.01em" }}>
          Perfil
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--mc-text-muted)", marginTop: "0.25rem" }}>
          Tu informacion personal y de contacto
        </p>
      </div>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", padding: "1.25rem", backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "var(--mc-sky)", border: "2px solid var(--mc-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: 700, color: "var(--mc-primary)", flexShrink: 0 }}>
          {profile.name.charAt(0).toUpperCase() || "?"}
        </div>
        <div>
          <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mc-text)" }}>
            {profile.name || "Sin nombre"}
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--mc-text-muted)", marginTop: "0.125rem" }}>
            {profile.email}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", backgroundColor: "var(--mc-surface)", border: "1px solid var(--mc-border)", borderRadius: "0.625rem", padding: "0.25rem", marginBottom: "1.5rem" }}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveSection(tab.value)}
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: activeSection === tab.value ? 500 : 400,
              color: activeSection === tab.value ? "var(--mc-primary)" : "var(--mc-text-secondary)",
              backgroundColor: activeSection === tab.value ? "#fff" : "transparent",
              border: activeSection === tab.value ? "1px solid var(--mc-border)" : "1px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: activeSection === tab.value ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      {activeSection !== "link" ? (
        <form onSubmit={handleSubmit} style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "1.5rem" }}>
          {activeSection === "personal" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
              <Input label="Nombre completo" type="text" value={profile.name} onChange={(e) => updateField("name", e.target.value)} required />
              <Input label="Correo electronico" type="email" value={profile.email} onChange={(e) => updateField("email", e.target.value)} required disabled />
              <Input label="Telefono" type="tel" value={profile.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="10 digitos" />
              <Input label="Fecha de nacimiento" type="date" value={profile.birthdate} onChange={(e) => updateField("birthdate", e.target.value)} />
            </div>
          )}
          {activeSection === "emergency" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
              <div style={{ padding: "0.875rem 1rem", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "0.625rem", fontSize: "0.8125rem", color: "#c53030", lineHeight: 1.5 }}>
                Este contacto se usara cuando presiones el boton de emergencia.
              </div>
              <Input label="Nombre del contacto" type="text" value={profile.emergencyContact.name} onChange={(e) => updateEmergency("name", e.target.value)} placeholder="Nombre completo" />
              <Input label="Telefono" type="tel" value={profile.emergencyContact.phone} onChange={(e) => updateEmergency("phone", e.target.value)} placeholder="10 digitos" />
              <Input label="Relacion" type="text" value={profile.emergencyContact.relationship} onChange={(e) => updateEmergency("relationship", e.target.value)} placeholder="Familiar, amigo, terapeuta..." />
            </div>
          )}
          {error && (
            <div style={{ marginTop: "1.25rem", padding: "0.625rem 1rem", borderRadius: "0.5rem", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", fontSize: "0.8125rem", color: "#c53030" }}>
              {error}
            </div>
          )}
          {saved && (
            <div style={{ marginTop: "1.25rem", padding: "0.625rem 1rem", borderRadius: "0.5rem", backgroundColor: "#f0fff4", border: "1px solid #9ae6b4", fontSize: "0.8125rem", color: "#276749" }}>
              Cambios guardados correctamente.
            </div>
          )}
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="primary" loading={saving}>Guardar cambios</Button>
          </div>
        </form>
      ) : (
        <div style={{ backgroundColor: "#fff", border: "1px solid var(--mc-border)", borderRadius: "0.875rem", padding: "1.5rem" }}>
          <form onSubmit={handleLink} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <div style={{ padding: "0.875rem 1rem", backgroundColor: "var(--mc-sky)", border: "1px solid var(--mc-teal)", borderRadius: "0.625rem", fontSize: "0.8125rem", color: "var(--mc-primary)", lineHeight: 1.5 }}>
              Ingresa el codigo que te dio tu psicologo para que pueda ver tu progreso desde su panel.
            </div>
            <Input label="Codigo de invitacion" type="text" value={linkCode} onChange={(e) => setLinkCode(e.target.value.toUpperCase())} placeholder="Ej. AB3DEFGH" required />
            {linkError && (
              <div style={{ padding: "0.625rem 1rem", borderRadius: "0.5rem", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", fontSize: "0.8125rem", color: "#c53030" }}>
                {linkError}
              </div>
            )}
            {linkSuccess && (
              <div style={{ padding: "0.625rem 1rem", borderRadius: "0.5rem", backgroundColor: "#f0fff4", border: "1px solid #9ae6b4", fontSize: "0.8125rem", color: "#276749" }}>
                {linkSuccess}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="primary" loading={linking}>Vincular</Button>
            </div>
          </form>
        </div>
      )}

      {/* Cerrar sesion — visible en mobile, redundante pero util en desktop */}
      <div
        className="profile-signout"
        style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--mc-border)" }}
      >
        <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>
          Sesion
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "0.625rem",
            border: "1px solid #fed7d7",
            backgroundColor: "#fff5f5",
            color: "#c53030",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fed7d7")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fff5f5")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}

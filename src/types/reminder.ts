export type ReminderType = "medicacion" | "actividad" | "cita" | "personalizado";
export type ReminderStatus = "pendiente" | "completado";

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  time: string;
  repeat: boolean;
  status: ReminderStatus;
  createdAt: string;
}

export interface ReminderTypeOption {
  value: ReminderType;
  label: string;
  color: string;
  bg: string;
}

export const REMINDER_TYPES: ReminderTypeOption[] = [
  { value: "medicacion",   label: "Medicación",          color: "#2b6cb0", bg: "#bee3f8" },
  { value: "actividad",    label: "Actividad terapéutica", color: "#276749", bg: "#c6f6d5" },
  { value: "cita",         label: "Cita programada",     color: "#6b46c1", bg: "#e9d8fd" },
  { value: "personalizado", label: "Personalizado",      color: "#4a5568", bg: "#e2e8f0" },
];

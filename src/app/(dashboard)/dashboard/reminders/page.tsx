import { redirect } from "next/navigation";

// Los recordatorios son gestionados por el psicólogo desde el expediente del paciente.
// El paciente los recibe como notificaciones, no los gestiona directamente.
export default function RemindersPage() {
  redirect("/dashboard");
}

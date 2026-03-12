import { redirect } from "next/navigation";

// El progreso y estadísticas son exclusivos del psicólogo — se accede desde el expediente del paciente.
export default function ProgressPage() {
  redirect("/dashboard");
}

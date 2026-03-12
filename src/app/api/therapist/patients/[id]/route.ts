import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const therapist = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!therapist) {
      return NextResponse.json({ error: "Perfil de psicologo no encontrado." }, { status: 403 });
    }

    const relation = await prisma.therapistPatient.findUnique({
      where: {
        therapistProfileId_patientProfileId: {
          therapistProfileId: therapist.id,
          patientProfileId: id,
        },
      },
    });
    if (!relation) {
      return NextResponse.json({ error: "Paciente no encontrado." }, { status: 404 });
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        emergencyContact: true,
      },
    });
    if (!patient) {
      return NextResponse.json({ error: "Perfil de paciente no encontrado." }, { status: 404 });
    }

    const now = new Date();
    const searchParams = req.nextUrl.searchParams;
    const qMonth = searchParams.get("month");
    const qYear = searchParams.get("year");

    const year = qYear ? parseInt(qYear, 10) : now.getUTCFullYear();
    const month = qMonth ? parseInt(qMonth, 10) : now.getUTCMonth();

    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const daysInMonth = lastDay.getUTCDate();

    const entries = await prisma.diaryEntry.findMany({
      where: {
        patientProfileId: patient.id,
        date: { gte: firstDay, lte: lastDay },
      },
      orderBy: { date: "asc" },
    });

    const records = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const entry = entries.find((e) => new Date(e.date).getUTCDate() === day);
      return {
        date: dateStr,
        mood: entry?.mood ?? null,
        note: entry?.note ?? null,
        hasNote: !!entry?.note,
      };
    });

    return NextResponse.json({
      id: patient.id,
      name: patient.user.name,
      email: patient.user.email,
      phone: patient.phone ?? "",
      birthdate: patient.birthdate ? patient.birthdate.toISOString().split("T")[0] : "",
      emergencyContact: patient.emergencyContact
        ? {
            name: patient.emergencyContact.name,
            phone: patient.emergencyContact.phone,
            relationship: patient.emergencyContact.relationship,
          }
        : null,
      month: MONTH_NAMES[month],
      monthIndex: month,
      year,
      records,
    });
  } catch (error) {
    console.error("Error al obtener detalle del paciente:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

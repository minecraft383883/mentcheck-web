import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await params;

    const therapist = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!therapist) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
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

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const profile = await prisma.patientProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        emergencyContact: true,
        diaryEntries: {
          where: { date: { gte: firstDay, lte: lastDay } },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    const daysInMonth = lastDay.getDate();
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];

    const records = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const entry = profile.diaryEntries.find(
        (e) => new Date(e.date).getDate() === day
      );
      return {
        date: dateStr,
        mood: entry?.mood ?? null,
        note: entry?.note ?? null,
        hasNote: !!entry?.note,
      };
    });

    return NextResponse.json({
      id: profile.id,
      name: profile.user.name,
      email: profile.user.email,
      phone: profile.phone ?? "",
      birthdate: profile.birthdate
        ? new Date(profile.birthdate).toISOString().split("T")[0]
        : "",
      emergencyContact: profile.emergencyContact ?? null,
      month: monthNames[now.getMonth()],
      year: now.getFullYear(),
      records,
    });
  } catch (error) {
    console.error("Error al obtener paciente:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

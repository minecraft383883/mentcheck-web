import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const profile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    const [reminders, appointments, notes] = await Promise.all([
      prisma.reminder.findMany({
        where: { patientProfileId: profile.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.appointment.findMany({
        where: { patientProfileId: profile.id },
        orderBy: { dateTime: "asc" },
        include: {
          therapistProfile: {
            include: { user: { select: { name: true } } },
          },
        },
      }),
      prisma.sessionNote.findMany({
        where: { patientProfileId: profile.id },
        orderBy: { date: "desc" },
        include: {
          therapistProfile: {
            include: { user: { select: { name: true } } },
          },
        },
      }),
    ]);

    return NextResponse.json({ reminders, appointments, notes });
  } catch (error) {
    console.error("Error al obtener info del paciente:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

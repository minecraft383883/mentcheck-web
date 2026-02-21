import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        patientProfile: {
          include: {
            emergencyContact: true,
            diaryEntries: {
              orderBy: { date: "desc" },
              take: 1,
            },
            reminders: {
              where: { status: "pendiente" },
              orderBy: { time: "asc" },
              take: 3,
            },
          },
        },
      },
    });

    if (!user?.patientProfile) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    const profile = user.patientProfile;
    const todayStr = new Date().toISOString().split("T")[0];
    const lastEntry = profile.diaryEntries[0] ?? null;
    const lastEntryDateStr = lastEntry
      ? new Date(lastEntry.date).toISOString().split("T")[0]
      : null;
    const hasEntryToday = lastEntryDateStr === todayStr;

    return NextResponse.json({
      name: user.name,
      hasEntryToday,
      lastMood: lastEntry?.mood ?? null,
      pendingReminders: profile.reminders.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        time: r.time,
      })),
      emergencyPhone: profile.emergencyContact?.phone ?? null,
    });
  } catch (error) {
    console.error("Error al obtener dashboard:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

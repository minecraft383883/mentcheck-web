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

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const entries = await prisma.diaryEntry.findMany({
      where: {
        patientProfileId: profile.id,
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      orderBy: { date: "asc" },
    });

    const daysInMonth = lastDay.getDate();

    const records = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const entry = entries.find((e) => {
        const entryDate = new Date(e.date);
        return entryDate.getDate() === day;
      });

      return {
        date: dateStr,
        mood: entry?.mood ?? null,
        hasNote: !!entry?.note,
      };
    });

    const moodCounts: Record<string, number> = {};
    records.forEach((r) => {
      if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
    });

    const dominantMood =
      Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const daysWithEntry = records.filter((r) => r.mood !== null).length;

    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];

    return NextResponse.json({
      month: monthNames[month],
      year,
      records,
      dominantMood,
      daysWithEntry,
      totalDays: daysInMonth,
    });
  } catch (error) {
    console.error("Error al obtener progreso:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

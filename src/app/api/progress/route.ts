import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export async function GET(req: NextRequest) {
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
    const searchParams = req.nextUrl.searchParams;
    const qMonth = searchParams.get("month");
    const qYear = searchParams.get("year");

    const year = qYear ? parseInt(qYear, 10) : now.getUTCFullYear();
    const month = qMonth ? parseInt(qMonth, 10) : now.getUTCMonth();
    const todayDay = (year === now.getUTCFullYear() && month === now.getUTCMonth())
      ? now.getUTCDate()
      : 0;

    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const daysInMonth = lastDay.getUTCDate();

    const entries = await prisma.diaryEntry.findMany({
      where: {
        patientProfileId: profile.id,
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
        hasNote: !!entry?.note,
      };
    });

    // Racha solo en mes actual
    let streak = 0;
    if (todayDay > 0) {
      for (let d = todayDay; d >= 1; d--) {
        if (records[d - 1]?.mood) streak++;
        else break;
      }
    }

    const moodCounts: Record<string, number> = {};
    records.forEach((r) => {
      if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
    });

    // Solo hay emoción predominante si alguna emoción aparece MÁS DE 1 vez
    const sorted = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    const dominantMood = sorted.length > 0 && sorted[0][1] > 1 ? sorted[0][0] : null;

    const daysWithEntry = records.filter((r) => r.mood !== null).length;

    return NextResponse.json({
      month: MONTH_NAMES[month],
      year,
      records,
      dominantMood,
      moodCounts,
      daysWithEntry,
      totalDays: daysInMonth,
      streak,
    });
  } catch (error) {
    console.error("Error al obtener progreso:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

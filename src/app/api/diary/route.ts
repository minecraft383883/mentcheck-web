import { NextRequest, NextResponse } from "next/server";
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

    const entries = await prisma.diaryEntry.findMany({
      where: { patientProfileId: profile.id },
      orderBy: { date: "desc" },
      take: 30,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error al obtener entradas:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { mood, note, date } = await req.json();

    if (!mood || !date) {
      return NextResponse.json(
        { error: "La emoción y la fecha son requeridas." },
        { status: 400 }
      );
    }

    const profile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    const entry = await prisma.diaryEntry.upsert({
      where: {
        patientProfileId_date: {
          patientProfileId: profile.id,
          date: new Date(date),
        },
      },
      update: { mood, note },
      create: {
        patientProfileId: profile.id,
        date: new Date(date),
        mood,
        note,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Error al guardar entrada:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

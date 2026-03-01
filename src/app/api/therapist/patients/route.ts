import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const therapist = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Perfil de psicólogo no encontrado." },
        { status: 404 }
      );
    }

    const relations = await prisma.therapistPatient.findMany({
      where: { therapistProfileId: therapist.id },
      include: {
        patientProfile: {
          include: {
            user: { select: { name: true, email: true } },
            diaryEntries: {
              orderBy: { date: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const todayStr = new Date().toISOString().split("T")[0];

    const patients = relations.map((rel) => {
      const p = rel.patientProfile;
      const lastEntry = p.diaryEntries[0] ?? null;
      const hasEntryToday = lastEntry
        ? lastEntry.date.toISOString().split("T")[0] === todayStr
        : false;

      return {
        id: p.id,
        name: p.user.name,
        email: p.user.email,
        lastMood: lastEntry?.mood ?? null,
        hasEntryToday,
        linkedAt: rel.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

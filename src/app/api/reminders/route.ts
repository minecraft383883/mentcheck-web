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

    const reminders = await prisma.reminder.findMany({
      where: { patientProfileId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("Error al obtener recordatorios:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { type, title, time, repeat } = await req.json();

    if (!type || !time) {
      return NextResponse.json(
        { error: "El tipo y la hora son requeridos." },
        { status: 400 }
      );
    }

    const profile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    const reminder = await prisma.reminder.create({
      data: {
        patientProfileId: profile.id,
        type,
        title: title?.trim() || type,
        time,
        repeat: repeat ?? false,
        status: "pendiente",
      },
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error("Error al crear recordatorio:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

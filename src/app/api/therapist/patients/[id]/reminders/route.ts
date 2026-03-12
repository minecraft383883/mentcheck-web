import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const therapist = await prisma.therapistProfile.findUnique({ where: { userId: session.user.id } });
    if (!therapist) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

    const link = await prisma.therapistPatient.findFirst({
      where: { therapistProfileId: therapist.id, patientProfileId: id },
    });
    if (!link) return NextResponse.json({ error: "Paciente no encontrado." }, { status: 404 });

    const reminders = await prisma.reminder.findMany({
      where: { patientProfileId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reminders);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const therapist = await prisma.therapistProfile.findUnique({ where: { userId: session.user.id } });
    if (!therapist) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

    const link = await prisma.therapistPatient.findFirst({
      where: { therapistProfileId: therapist.id, patientProfileId: id },
    });
    if (!link) return NextResponse.json({ error: "Paciente no encontrado." }, { status: 404 });

    const { type, title, time, repeat } = await req.json();
    if (!type || !time) {
      return NextResponse.json({ error: "El tipo y la hora son requeridos." }, { status: 400 });
    }

    const reminder = await prisma.reminder.create({
      data: {
        patientProfileId: id,
        type,
        title: title?.trim() || type,
        time,
        repeat: repeat ?? false,
        status: "pendiente",
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

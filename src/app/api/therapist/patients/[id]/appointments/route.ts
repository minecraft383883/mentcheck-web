import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getTherapistAndVerifyPatient(userId: string, patientId: string) {
  const therapist = await prisma.therapistProfile.findUnique({ where: { userId } });
  if (!therapist) return null;
  const relation = await prisma.therapistPatient.findUnique({
    where: { therapistProfileId_patientProfileId: { therapistProfileId: therapist.id, patientProfileId: patientId } },
  });
  if (!relation) return null;
  return therapist;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const therapist = await getTherapistAndVerifyPatient(session.user.id, id);
    if (!therapist) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

    const appointments = await prisma.appointment.findMany({
      where: { therapistProfileId: therapist.id, patientProfileId: id },
      orderBy: { dateTime: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const therapist = await getTherapistAndVerifyPatient(session.user.id, id);
    if (!therapist) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

    const body = await req.json();
    const { dateTime, notes } = body;

    if (!dateTime) return NextResponse.json({ error: "La fecha y hora son requeridas." }, { status: 400 });

    const appointment = await prisma.appointment.create({
      data: {
        therapistProfileId: therapist.id,
        patientProfileId: id,
        dateTime: new Date(dateTime),
        notes: notes ?? null,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error al crear cita:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

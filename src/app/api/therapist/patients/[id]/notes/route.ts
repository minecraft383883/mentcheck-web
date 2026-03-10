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

    const notes = await prisma.sessionNote.findMany({
      where: { therapistProfileId: therapist.id, patientProfileId: id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error al obtener notas:", error);
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
    const { date, content } = body;

    if (!date || !content?.trim()) {
      return NextResponse.json({ error: "Fecha y contenido son requeridos." }, { status: 400 });
    }

    const note = await prisma.sessionNote.create({
      data: {
        therapistProfileId: therapist.id,
        patientProfileId: id,
        date: new Date(date + "T12:00:00"),
        content: content.trim(),
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error al crear nota:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; reminderId: string }> }
) {
  try {
    const { id, reminderId } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const therapist = await prisma.therapistProfile.findUnique({ where: { userId: session.user.id } });
    if (!therapist) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

    const link = await prisma.therapistPatient.findFirst({
      where: { therapistProfileId: therapist.id, patientProfileId: id },
    });
    if (!link) return NextResponse.json({ error: "Paciente no encontrado." }, { status: 404 });

    await prisma.reminder.delete({ where: { id: reminderId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

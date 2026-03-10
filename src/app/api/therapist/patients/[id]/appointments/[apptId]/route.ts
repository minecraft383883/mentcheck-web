import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; apptId: string }> }
) {
  try {
    const { id, apptId } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const therapist = await prisma.therapistProfile.findUnique({ where: { userId: session.user.id } });
    if (!therapist) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

    const appointment = await prisma.appointment.findUnique({ where: { id: apptId } });
    if (!appointment || appointment.therapistProfileId !== therapist.id || appointment.patientProfileId !== id) {
      return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
    }

    const body = await req.json();
    const { status, notes, dateTime } = body;

    const updated = await prisma.appointment.update({
      where: { id: apptId },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(dateTime && { dateTime: new Date(dateTime) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; apptId: string }> }
) {
  try {
    const { id, apptId } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const therapist = await prisma.therapistProfile.findUnique({ where: { userId: session.user.id } });
    if (!therapist) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

    const appointment = await prisma.appointment.findUnique({ where: { id: apptId } });
    if (!appointment || appointment.therapistProfileId !== therapist.id || appointment.patientProfileId !== id) {
      return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
    }

    await prisma.appointment.delete({ where: { id: apptId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

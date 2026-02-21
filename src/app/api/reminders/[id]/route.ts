import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const profile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    const existing = await prisma.reminder.findFirst({
      where: { id, patientProfileId: profile.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Recordatorio no encontrado." }, { status: 404 });
    }

    const updated = await prisma.reminder.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ reminder: updated });
  } catch (error) {
    console.error("Error al actualizar recordatorio:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await params;

    const profile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    const existing = await prisma.reminder.findFirst({
      where: { id, patientProfileId: profile.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Recordatorio no encontrado." }, { status: 404 });
    }

    await prisma.reminder.delete({ where: { id } });

    return NextResponse.json({ message: "Eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar recordatorio:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

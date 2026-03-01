import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "El código es requerido." }, { status: 400 });
    }

    const invite = await prisma.inviteCode.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { therapistProfile: true },
    });

    if (!invite) {
      return NextResponse.json({ error: "Código inválido." }, { status: 404 });
    }

    if (invite.used) {
      return NextResponse.json({ error: "Este código ya fue utilizado." }, { status: 409 });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ error: "Este código ha expirado." }, { status: 410 });
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    const existingRelation = await prisma.therapistPatient.findUnique({
      where: {
        therapistProfileId_patientProfileId: {
          therapistProfileId: invite.therapistProfileId,
          patientProfileId: patient.id,
        },
      },
    });

    if (existingRelation) {
      return NextResponse.json(
        { error: "Ya estás vinculado con este psicólogo." },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.therapistPatient.create({
        data: {
          therapistProfileId: invite.therapistProfileId,
          patientProfileId: patient.id,
        },
      }),
      prisma.inviteCode.update({
        where: { id: invite.id },
        data: { used: true, usedByProfileId: patient.id },
      }),
    ]);

    const therapistUser = await prisma.user.findUnique({
      where: { id: invite.therapistProfile.userId },
      select: { name: true },
    });

    return NextResponse.json({
      message: "Vinculación exitosa.",
      therapistName: therapistUser?.name ?? "Tu psicólogo",
    });
  } catch (error) {
    console.error("Error al vincular:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

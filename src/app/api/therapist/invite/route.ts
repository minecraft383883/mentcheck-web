import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const therapist = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!therapist) {
      return NextResponse.json({ error: "Perfil de psicólogo no encontrado." }, { status: 404 });
    }

    let code = generateCode();
    let exists = await prisma.inviteCode.findUnique({ where: { code } });
    while (exists) {
      code = generateCode();
      exists = await prisma.inviteCode.findUnique({ where: { code } });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.inviteCode.create({
      data: {
        code,
        therapistProfileId: therapist.id,
        expiresAt,
      },
    });

    return NextResponse.json({ code: invite.code, expiresAt: invite.expiresAt });
  } catch (error) {
    console.error("Error al generar codigo:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    const codes = await prisma.inviteCode.findMany({
      where: {
        therapistProfileId: therapist.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ codes });
  } catch (error) {
    console.error("Error al obtener codigos:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

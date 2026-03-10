import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        patientProfile: {
          include: {
            emergencyContact: true,
            therapistLinks: {
              include: {
                therapistProfile: {
                  include: { user: { select: { name: true, email: true } } },
                },
              },
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    const latestLink = user.patientProfile?.therapistLinks?.[0];
    const linkedTherapist = latestLink
      ? {
          name: latestLink.therapistProfile.user.name ?? "",
          email: latestLink.therapistProfile.user.email ?? "",
        }
      : null;

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.patientProfile?.phone ?? "",
      birthdate: user.patientProfile?.birthdate
        ? new Date(user.patientProfile.birthdate).toISOString().split("T")[0]
        : "",
      emergencyContact: {
        name: user.patientProfile?.emergencyContact?.name ?? "",
        phone: user.patientProfile?.emergencyContact?.phone ?? "",
        relationship: user.patientProfile?.emergencyContact?.relationship ?? "",
      },
      linkedTherapist,
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { name, phone, birthdate, emergencyContact } = await req.json();

    const profile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
      include: { emergencyContact: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    });

    await prisma.patientProfile.update({
      where: { userId: session.user.id },
      data: {
        phone: phone || null,
        birthdate: birthdate ? new Date(birthdate) : null,
      },
    });

    if (emergencyContact?.name && emergencyContact?.phone) {
      if (profile.emergencyContact) {
        await prisma.emergencyContact.update({
          where: { patientProfileId: profile.id },
          data: emergencyContact,
        });
      } else {
        await prisma.emergencyContact.create({
          data: {
            patientProfileId: profile.id,
            ...emergencyContact,
          },
        });
      }
    }

    return NextResponse.json({ message: "Perfil actualizado correctamente." });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

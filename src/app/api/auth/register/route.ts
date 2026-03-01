import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese correo." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = role === "THERAPIST" ? "THERAPIST" : "PATIENT";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        ...(userRole === "PATIENT"
          ? { patientProfile: { create: {} } }
          : { therapistProfile: { create: {} } }),
      },
    });

    return NextResponse.json(
      { message: "Cuenta creada correctamente.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

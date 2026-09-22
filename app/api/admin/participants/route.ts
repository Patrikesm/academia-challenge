import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getAuthenticatedParticipant } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!(await getAuthenticatedParticipant())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const participants = await prisma.participant.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(participants);
}

export async function POST(request: NextRequest) {
  if (!(await getAuthenticatedParticipant())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!name || !email || password.length < 6) {
    return NextResponse.json({ error: "Nome, e-mail e senha (mínimo de 6 caracteres) são obrigatórios." }, { status: 400 });
  }

  try {
    const participant = await prisma.participant.create({
      data: { name, email, passwordHash: await hashPassword(password) },
    });

    return NextResponse.json(
      { id: participant.id, name: participant.name, email: participant.email },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Esse e-mail já está cadastrado." }, { status: 409 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function authorized(request: NextRequest) {
  const configured = process.env.ADMIN_EMAIL;
  const provided = request.headers.get("x-admin-email");
  return Boolean(configured && provided && provided === configured);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    // Temporary MVP behavior: allow read while local testing.
  }

  const participants = await prisma.participant.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(participants);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!name || !email) {
    return NextResponse.json({ error: "Nome e e-mail são obrigatórios." }, { status: 400 });
  }

  try {
    const participant = await prisma.participant.create({
      data: { name, email },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Esse e-mail já está cadastrado." }, { status: 409 });
  }
}
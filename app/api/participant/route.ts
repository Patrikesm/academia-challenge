import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, getAuthenticatedParticipant, hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });

  const participant = await prisma.participant.findUnique({ where: { email } });

  if (!participant || !participant.passwordHash || !(await verifyPassword(password, participant.passwordHash))) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  await createSession(participant.id);
  return NextResponse.json({
    participant: { id: participant.id, name: participant.name, email: participant.email },
  });
}

export async function GET(request: NextRequest) {
  const participant = await getAuthenticatedParticipant();
  if (!participant) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const participantWithActivities = await prisma.participant.findUnique({
    where: { id: participant.id },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!participantWithActivities) return NextResponse.json({ error: "Participante não encontrado." }, { status: 404 });

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });

  const todayActivities = participantWithActivities.activities.filter((a) => a.activityDate === today);
  const totalPoints = participantWithActivities.activities.reduce((sum, a) => sum + a.points, 0);
  const todayPoints = todayActivities.reduce((sum, a) => sum + a.points, 0);

  return NextResponse.json({
    participant: {
      id: participantWithActivities.id,
      name: participantWithActivities.name,
      email: participantWithActivities.email,
    },
    todayActivities,
    todayPoints,
    totalPoints,
    activityCount: participantWithActivities.activities.length,
  });
}

export async function PATCH(request: NextRequest) {
  const participant = await getAuthenticatedParticipant();
  if (!participant) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await request.json();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (!participant.passwordHash || !(await verifyPassword(currentPassword, participant.passwordHash))) {
    return NextResponse.json({ error: "A senha atual está incorreta." }, { status: 401 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "A nova senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  await prisma.participant.update({
    where: { id: participant.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return NextResponse.json({ success: true });
}
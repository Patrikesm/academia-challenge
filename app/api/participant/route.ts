import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!email) return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 });

  const participant = await prisma.participant.findUnique({ where: { email } });

  if (!participant) {
    return NextResponse.json({ error: "E-mail não cadastrado." }, { status: 404 });
  }

  return NextResponse.json({ participant });
}

export async function GET(request: NextRequest) {
  const participantId = request.nextUrl.searchParams.get("participantId");

  if (!participantId) {
    return NextResponse.json({ error: "Participante obrigatório." }, { status: 400 });
  }

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!participant) return NextResponse.json({ error: "Participante não encontrado." }, { status: 404 });

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });

  const todayActivities = participant.activities.filter((a) => a.activityDate === today);
  const totalPoints = participant.activities.reduce((sum, a) => sum + a.points, 0);
  const todayPoints = todayActivities.reduce((sum, a) => sum + a.points, 0);

  return NextResponse.json({
    participant: {
      id: participant.id,
      name: participant.name,
      email: participant.email,
    },
    todayActivities,
    todayPoints,
    totalPoints,
    activityCount: participant.activities.length,
  });
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedParticipant } from "@/lib/auth";

function todayInSaoPaulo() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const participant = await getAuthenticatedParticipant();
  if (!participant) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const activity = await prisma.activity.findFirst({
    where: { id, participantId: participant.id, activityDate: todayInSaoPaulo() },
  });

  if (!activity) {
    return NextResponse.json({ error: "A atividade não existe ou não é de hoje." }, { status: 404 });
  }

  await prisma.activity.delete({ where: { id: activity.id } });
  return NextResponse.json({ success: true });
}
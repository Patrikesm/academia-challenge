import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ACTIVITIES, isActivityType } from "@/lib/activities";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const participantId = String(body.participantId ?? "");
    const type = String(body.type ?? "");
    const photoPath = String(body.photoPath ?? "");

    if (!participantId || !isActivityType(type)) {
      return NextResponse.json(
        { error: "Dados da atividade inválidos." },
        { status: 400 }
      );
    }

    if (!photoPath) {
      return NextResponse.json(
        { error: "A foto é obrigatória." },
        { status: 400 }
      );
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participante não encontrado." },
        { status: 404 }
      );
    }

    const activityDate = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });

    const existing = await prisma.activity.findUnique({
      where: {
        participantId_activityDate: {
          participantId,
          activityDate,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Você já registrou uma atividade hoje." },
        { status: 409 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("activity-photos")
      .getPublicUrl(photoPath);

    const activity = await prisma.activity.create({
      data: {
        participantId,
        type,
        points: ACTIVITIES[type].points,
        photoUrl: publicUrlData.publicUrl,
        activityDate,
      },
    });

    return NextResponse.json(
      { activity },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno ao registrar atividade." },
      { status: 500 }
    );
  }
}
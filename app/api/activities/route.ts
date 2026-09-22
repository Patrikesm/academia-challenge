import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ACTIVITIES, isActivityType, MAX_DAILY_POINTS, ActivityType } from "@/lib/activities";
import { supabaseAdmin } from "@/lib/supabase";
import { ActivityType as PrismaActivityType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const participantId = String(body.participantId ?? "");
    const requestedTypes: unknown[] = Array.isArray(body.types)
      ? body.types
      : body.type
        ? [body.type]
        : [];
    const photoPath = String(body.photoPath ?? "");
    const types = requestedTypes.map((type: unknown) => String(type));

    if (
      !participantId ||
      types.length === 0 ||
      types.some((type) => !isActivityType(type)) ||
      new Set(types).size !== types.length
    ) {
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

    const todayActivities = await prisma.activity.findMany({
      where: { participantId, activityDate },
    });
    const todayPoints = todayActivities.reduce((sum, activity) => sum + activity.points, 0);
    const selectedPoints = (types as ActivityType[]).reduce(
      (sum, type) => sum + ACTIVITIES[type].points,
      0,
    );

    if (todayActivities.some((activity) => types.includes(activity.type))) {
      return NextResponse.json(
        { error: "Uma ou mais atividades selecionadas já foram registradas hoje." },
        { status: 409 }
      );
    }

    if (todayPoints + selectedPoints > MAX_DAILY_POINTS) {
      return NextResponse.json(
        { error: `O limite diário é de ${MAX_DAILY_POINTS} pontos.` },
        { status: 400 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("activity-photos")
      .getPublicUrl(photoPath);

    const activities = await prisma.$transaction(
      (types as ActivityType[]).map((type) =>
        prisma.activity.create({
          data: {
            participantId,
            type: type as PrismaActivityType,
            points: ACTIVITIES[type].points,
            photoUrl: publicUrlData.publicUrl,
            activityDate,
          },
        }),
      ),
    );

    return NextResponse.json(
      { activities },
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
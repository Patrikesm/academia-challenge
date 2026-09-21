import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { ACTIVITIES, isActivityType } from "@/lib/activities";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const participantId = String(form.get("participantId") ?? "");
    const type = String(form.get("type") ?? "");
    const file = form.get("photo");

    if (!participantId || !isActivityType(type)) {
      return NextResponse.json({ error: "Dados da atividade inválidos." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A foto é obrigatória." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Envie uma imagem." }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "A foto deve ter no máximo 8 MB." }, { status: 400 });
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      return NextResponse.json({ error: "Participante não encontrado." }, { status: 404 });
    }

    const activityDate = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });

    const existing = await prisma.activity.findUnique({
      where: {
        participantId_activityDate: { participantId, activityDate },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Você já registrou uma atividade hoje." },
        { status: 409 }
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";


    
    const path = `${participantId}/${activityDate}-${crypto.randomUUID()}.${extension}`;
    console.log(`Uploading file to Supabase storage at path: ${path}`);
    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = await supabaseAdmin.storage
      .from("activity-photos")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    console.log(upload.error);
    console.log(process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (upload.error) {
      return NextResponse.json(
        { error: `Erro ao salvar foto: ${upload.error.message}` },
        { status: 500 }
      );
    }

    const publicUrl = supabaseAdmin.storage
      .from("activity-photos")
      .getPublicUrl(path).data.publicUrl;

    const activity = await prisma.activity.create({
      data: {
        participantId,
        type,
        points: ACTIVITIES[type].points,
        photoUrl: publicUrl,
        activityDate,
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno ao registrar atividade." }, { status: 500 });
  }
}
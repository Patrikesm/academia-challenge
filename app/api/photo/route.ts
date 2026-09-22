import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedParticipant } from "@/lib/auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const participant = await getAuthenticatedParticipant();
    if (!participant) {
      return NextResponse.json({ error: "Faça login para enviar uma foto." }, { status: 401 });
    }

    const participantId = participant.id;
    const fileName = String(body.fileName ?? "");
    const contentType = String(body.contentType ?? "");

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "Dados do upload inválidos." },
        { status: 400 }
      );
    }

    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Envie uma imagem." },
        { status: 400 }
      );
    }

    const activityDate = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });

    const extension =
      fileName.split(".").pop()?.toLowerCase() || "jpg";

    const path = `${participantId}/${activityDate}-${crypto.randomUUID()}.${extension}`;

    const { data, error } = await supabaseAdmin.storage
      .from("activity-photos")
      .createSignedUploadUrl(path);

    if (error) {
      console.error("Erro ao criar URL de upload:", error);

      return NextResponse.json(
        { error: `Erro ao preparar upload: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      path,
      token: data.token,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno ao preparar upload." },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedParticipant } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!(await getAuthenticatedParticipant())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get("pageSize") ?? "10")));
  const [activities, total] = await prisma.$transaction([
    prisma.activity.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        participant: { select: { name: true, email: true } },
      },
    }),
    prisma.activity.count(),
  ]);

  return NextResponse.json({
    activities,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}
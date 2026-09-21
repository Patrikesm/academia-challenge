import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const participants = await prisma.participant.findMany({
    include: { activities: { select: { points: true } } },
  });

  const ranking = participants
    .map((p) => ({
      id: p.id,
      name: p.name,
      points: p.activities.reduce((sum, a) => sum + a.points, 0),
      activities: p.activities.length,
    }))
    .sort((a, b) => b.points - a.points);

  return NextResponse.json(ranking);
}
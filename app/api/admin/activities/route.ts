import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      participant: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(activities);
}
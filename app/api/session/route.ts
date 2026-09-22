import { NextResponse } from "next/server";
import { clearSession, getAuthenticatedParticipant } from "@/lib/auth";

export async function GET() {
  const participant = await getAuthenticatedParticipant();
  return NextResponse.json({
    authenticated: Boolean(participant),
    participant: participant
      ? { id: participant.id, name: participant.name, email: participant.email }
      : null,
  });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Participant = { id: string; name: string; email: string };

export default function SessionNav({ initialParticipant }: { initialParticipant: Participant | null }) {
  const [participant, setParticipant] = useState(initialParticipant);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function refreshSession() {
    const response = await fetch("/api/session", { cache: "no-store" });
    const data = await response.json();
    setParticipant(data.participant ?? null);
  }

  useEffect(() => {
    refreshSession();
    window.addEventListener("session-changed", refreshSession);
    return () => window.removeEventListener("session-changed", refreshSession);
  }, []);

  async function logout() {
    setLoading(true);
    await fetch("/api/session", { method: "DELETE" });
    setParticipant(null);
    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <nav>
      {participant ? (
        <>
          <Link href="/minha-atividade">Minha atividade</Link>
          <Link href="/ranking">Ranking</Link>
          <Link href="/admin">Admin</Link>
          <button type="button" className="link-button" onClick={logout} disabled={loading}>
            {loading ? "Saindo..." : "Sair"}
          </button>
        </>
      ) : (
        <>
          <Link href="/">Entrar</Link>
          <Link href="/ranking">Ranking</Link>
        </>
      )}
    </nav>
  );
}
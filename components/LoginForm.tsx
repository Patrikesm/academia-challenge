 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/participant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Não foi possível entrar.");
      setLoading(false);
      return;
    }

    localStorage.setItem("participantId", data.participant.id);
    localStorage.setItem("participantName", data.participant.name);
    localStorage.setItem("participantEmail", data.participant.email);
    router.push("/dashboard");
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="email">E-mail</label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
      />
      {error && <div className="error">{error}</div>}
      <button disabled={loading} style={{ marginTop: 16 }}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Não foi possível entrar.");
      setLoading(false);
      return;
    }

    window.dispatchEvent(new Event("session-changed"));
    router.push("/dashboard");
    router.refresh();
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
      <label htmlFor="password">Senha</label>
      <input
        id="password"
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mínimo de 6 caracteres"
      />
      {error && <div className="error">{error}</div>}
      <button disabled={loading} style={{ marginTop: 16 }}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
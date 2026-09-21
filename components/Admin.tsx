 "use client";

import { useEffect, useState } from "react";

type Participant = { id: string; name: string; email: string };
type Activity = {
  id: string;
  participant: { name: string; email: string };
  type: string;
  points: number;
  photoUrl: string;
  activityDate: string;
};

export default function Admin() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [p, a] = await Promise.all([
      fetch("/api/admin/participants"),
      fetch("/api/admin/activities"),
    ]);
    setParticipants(await p.json());
    setActivities(await a.json());
  }

  useEffect(() => { load(); }, []);

  async function addParticipant(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const response = await fetch("/api/admin/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Erro ao cadastrar.");
      return;
    }

    setName("");
    setEmail("");
    load();
  }

  return (
    <>
      {/* <div className="card">
        <h1>Administração</h1>
        <p className="muted">
          MVP: esta área ainda não tem autenticação. Antes de publicar, vamos proteger esta rota.
        </p>
      </div> */}

      <div className="card">
        <h2>Cadastrar participante</h2>
        <form onSubmit={addParticipant}>
          <label>Nome</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} />
          <label>E-mail</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {error && <div className="error">{error}</div>}
          <button style={{ marginTop: 16 }}>Cadastrar</button>
        </form>
      </div>

      <div className="card">
        <h2>Participantes ({participants.length})</h2>
        {participants.map((p) => (
          <div className="admin-item" key={p.id}>
            <strong>{p.name}</strong>
            <div className="muted">{p.email}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Atividades</h2>
        {activities.map((a) => (
          <div className="admin-item" key={a.id}>
            <strong>{a.participant.name}</strong> — {a.type} (+{a.points})
            <div className="muted">{a.activityDate}</div>
            <img className="photo" src={a.photoUrl} alt="Comprovante" />
          </div>
        ))}
      </div>
    </>
  );
}
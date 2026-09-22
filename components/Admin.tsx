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

type ActivityResponse = { activities: Activity[]; page: number; totalPages: number; total: number };

export default function Admin() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [page, setPage] = useState(1);
  const [activityPage, setActivityPage] = useState<ActivityResponse | null>(null);
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function load() {
    const [p, a] = await Promise.all([
      fetch("/api/admin/participants"),
      fetch(`/api/admin/activities?page=${page}&pageSize=10`),
    ]);
    setParticipants(await p.json());
    const activityData = await a.json();
    setActivityPage(activityData);
    setActivities(activityData.activities ?? []);
  }
  useEffect(() => { load(); }, [page]);
  async function addParticipant(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const response = await fetch("/api/admin/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Erro ao cadastrar.");
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    load();
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    const response = await fetch("/api/participant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json();

    if (!response.ok) {
      setPasswordError(data.error ?? "Não foi possível alterar a senha.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setPasswordMessage("Senha alterada com sucesso.");
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
          <label>Senha</label>
          <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <div className="error">{error}</div>}
          <button style={{ marginTop: 16 }}>Cadastrar</button>
        </form>
      </div>

      <div className="card">
        <h2>Alterar minha senha</h2>
        <form onSubmit={changePassword}>
          <label>Senha atual</label>
          <input required type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <label>Nova senha</label>
          <input required minLength={6} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          {passwordError && <div className="error">{passwordError}</div>}
          {passwordMessage && <div className="notice">{passwordMessage}</div>}
          <button style={{ marginTop: 16 }}>Alterar senha</button>
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
        <h2>Atividades ({activityPage?.total ?? 0})</h2>
        {activities.map((a) => (
          <div className="admin-item" key={a.id}>
            <strong>{a.participant.name}</strong> — {a.type} (+{a.points})
            <div className="muted">{a.activityDate}</div>
            <img className="photo" src={a.photoUrl} alt="Comprovante" />
          </div>
        ))}
        {activityPage && activityPage.totalPages > 1 && (
          <div className="pagination">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Anterior</button>
            <span>Página {activityPage.page} de {activityPage.totalPages}</span>
            <button type="button" disabled={page === activityPage.totalPages} onClick={() => setPage((current) => current + 1)}>Próxima</button>
          </div>
        )}
      </div>
    </>
  );
}
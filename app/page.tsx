import LoginForm from "@/components/LoginForm";
import Link from "next/link";
import { getAuthenticatedParticipant } from "@/lib/auth";

export default async function Home() {
  const participant = await getAuthenticatedParticipant();

  return (
    <main>
      <div className="container">
        <div className="card">
          <h1>Desafio Academia</h1>
          {participant ? (
            <>
              <h1>Olá, {participant.name}!</h1>
              <p className="muted">Sua sessão está ativa neste dispositivo.</p>
              <Link className="button" href="/minha-atividade">Ir para minha atividade</Link>
            </>
          ) : (
            <>
              <p className="muted">Informe seu e-mail e senha para registrar sua atividade.</p>
              <LoginForm />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
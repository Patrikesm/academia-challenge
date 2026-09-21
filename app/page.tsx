import LoginForm from "@/components/LoginForm";

export default function Home() {
  return (
    <main>
      <div className="container">
        <div className="card">
          <h1>Desafio Academia</h1>
          <p className="muted">
            Informe seu e-mail para registrar sua atividade de hoje.
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
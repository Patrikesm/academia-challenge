import "./globals.css";
import { getAuthenticatedParticipant } from "@/lib/auth";
import SessionNav from "@/components/SessionNav";

export const metadata = {
  title: "Desafio Academia",
  description: "Pontuação diária do grupo",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const participant = await getAuthenticatedParticipant();

  return (
    <>
      <header>
        <div className="container header-inner">
          <div className="logo">🏆 Desafio Academia</div>
          <SessionNav
            initialParticipant={participant ? {
              id: participant.id,
              name: participant.name,
              email: participant.email,
            } : null}
          />
        </div>
      </header>
      {children}
    </>
  );
}
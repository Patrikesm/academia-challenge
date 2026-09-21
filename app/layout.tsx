import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Desafio Academia",
  description: "Pontuação diária do grupo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <div className="container header-inner">
          <div className="logo">🏆 Desafio Academia</div>
          <nav>
            <Link href="/">Início</Link>
            <Link href="/ranking">Ranking</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}
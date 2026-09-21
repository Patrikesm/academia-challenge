 "use client";

import { useEffect, useState } from "react";

type Row = { id: string; name: string; points: number; activities: number };

export default function Ranking() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch("/api/ranking").then((r) => r.json()).then(setRows);
  }, []);

  return (
    <div className="card">
      <h1>🏆 Ranking</h1>
      <p className="muted">Pontuação total dos participantes.</p>

      {rows.length === 0 ? (
        <p>Nenhum participante cadastrado.</p>
      ) : (
        rows.map((row, index) => (
          <div className="ranking-row" key={row.id}>
            <div className="position">{index + 1}º</div>
            <div>
              <strong>{row.name}</strong>
              <div className="muted">{row.activities} atividades</div>
            </div>
            <div className="total">{row.points} pts</div>
          </div>
        ))
      )}
    </div>
  );
}
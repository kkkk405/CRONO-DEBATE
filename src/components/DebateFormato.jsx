import React from "react";
import "../styles.css";

export default function DebateFormats({ onSelectFormat }) {
  const formats = [
    {
      id: "PERSO",
      name: "PERSUADE",
      description:
        "Formato de interacción dinámica, cronómetro descendente, preparación individual y gestión personal del tiempo. ",
    },
    {
      id: "BP",
      name: "Parlamentario Británico",
      description:
        "Formato con cuatro equipos de dos oradoras cada uno, discursos de 7 minutos.",
    },
    {
      id: "WS",
      name: "World Schools",
      description:
        "Formato con tres oradoras por equipo, discursos constructivos y de réplica.",
    },
    
  ];


     return (
    <div className="debate-formats">
      <h2>Selecciona un formato de debate</h2>
      <div className="formats-grid">
        {formats.map((f) => (
          <div
            key={f.id}
            className={`format-card clickable ${
              f.id === "PERSO" ? "premium-card" : ""
            }`}
            onClick={() => onSelectFormat(f.id)}
          >
            <h3>
              {f.name}{" "}
              {f.id === "PERSO" && (
                <span className="badge">NEW</span>
              )}
            </h3>
            <p>{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
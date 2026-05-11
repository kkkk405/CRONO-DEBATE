import { useState, useMemo } from "react";
import "primeicons/primeicons.css";
import "../styles.css";

export default function ReportPanel({ store, format }) {
  const { motion, timers } = store;
  const [scores, setScores] = useState({});

  const today = new Date().toLocaleDateString();
  const mainColor = "#7f4aa4";
  const accentColor = "#fdbc5a";

  const isBP = format === "BP";
  const showPosition = !isBP;
  const showScores = true;

  const teamsList = useMemo(() => {
    const set = new Set();
    timers.forEach(t => t.team && set.add(t.team));
    return [...set];
  }, [timers]);

  const teamTotals = useMemo(() => {
    const totals = {};
    timers.forEach((t) => {
      const score = parseFloat(scores[t.id]) || 0;
      if (!totals[t.team]) totals[t.team] = 0;
      totals[t.team] += score;
    });
    return totals;
  }, [scores, timers]);

  const teamPlaces = useMemo(() => {
    const sorted = teamsList
      .map((team) => ({ team, total: teamTotals[team] || 0 }))
      .sort((a, b) => b.total - a.total);

    const places = {};
    sorted.forEach((entry, idx) => {
      places[entry.team] = idx + 1;
    });
    return places;
  }, [teamTotals, teamsList]);

  const rankedTeams = useMemo(() => {
    if (isBP) {
      return teamsList
        .map((team) => ({ team, total: teamPlaces[team] || 99 }))
        .sort((a, b) => a.total - b.total)
        .slice(0, 4);
    }

    const sorted = Object.entries(teamTotals)
      .map(([team, total]) => ({ team, total }))
      .sort((a, b) => b.total - a.total);

    return sorted.slice(0, 4);
  }, [teamTotals, teamPlaces, teamsList, isBP]);

  const wsSides = useMemo(() => {
    if (format !== "WS") return null;
    const sideTotals = {};
    timers.forEach((t) => {
      const score = parseFloat(scores[t.id]) || 0;
      if (!sideTotals[t.side]) sideTotals[t.side] = 0;
      sideTotals[t.side] += score;
    });
    const sorted = Object.entries(sideTotals)
      .map(([side, total]) => ({ side, total }))
      .sort((a, b) => b.total - a.total);
    return sorted;
  }, [scores, timers, format]);

  const getOrderedTimers = useMemo(() => {
    const sideOrder = { "Proposición": 0, "Oposición": 1 };
    const teamFirstOrder = {};
    timers.forEach(t => {
      if (!teamFirstOrder[t.team] || t.order < teamFirstOrder[t.team]) {
        teamFirstOrder[t.team] = t.order;
      }
    });
    return [...timers].sort((a, b) => {
      if (a.side !== b.side) return (sideOrder[a.side] ?? 0) - (sideOrder[b.side] ?? 0);
      if (a.team !== b.team) {
        return (teamFirstOrder[a.team] ?? 0) - (teamFirstOrder[b.team] ?? 0);
      }
      return a.order - b.order;
    });
  }, [timers]);

  const calculatedPositions = useMemo(() => {
    if (isBP) return {};
    const positions = {};
    const sortedTimers = [...timers].sort((a, b) => {
      const scoreA = parseFloat(scores[a.id]) || 0;
      const scoreB = parseFloat(scores[b.id]) || 0;
      return scoreB - scoreA;
    });

    let currentPosition = 1;
    let prevScore = null;

    sortedTimers.forEach((t, idx) => {
      const score = parseFloat(scores[t.id]) || 0;
      if (prevScore !== null && score < prevScore) {
        currentPosition = idx + 1;
      }
      positions[t.id] = currentPosition;
      prevScore = score;
    });

    return positions;
  }, [scores, timers, isBP]);

  function handlePrint() {
    // Clonamos el contenido sin el botón
    const panel = document.querySelector(".report-panel").cloneNode(true);
    const noPrint = panel.querySelector(".no-print");
    if (noPrint) noPrint.remove();

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Acta de Debate</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; background: white; color: black; }
            h1, h2 { color: #000; }
            table, th, td { border: 1px solid #000; border-collapse: collapse; padding: 8px; }
            input, select { border: 1px solid #333; background: transparent; color: black; }
            .podium-gold { background: #FFD700 !important; }
            .podium-silver { background: #C0C0C0 !important; }
            .podium-bronze { background: #CD7F32 !important; }
          </style>
        </head>
        <body>
          ${panel.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  return (
<div className="report-panel" style={{ padding: "2rem" }}>
  {/* Encabezado */}
  <header style={{ textAlign: "center", marginBottom: "2rem" }}>
    <h1 style={{ margin: 0, color: mainColor }}>
      Acta de Debate{" "}
      <span className="badge" style={{ fontWeight: "bold" }}>
        {format}
      </span>
    </h1>
    <p style={{ fontStyle: "italic", color: "#555" }}>Fecha: {today}</p>
    
  </header>

  {/* Moción */}
  <section style={{ marginBottom: "1.5rem" }}>
    <h2 style={{ borderBottom: `2px solid ${mainColor}`, color: mainColor }}>
      Moción
    </h2>
    <p style={{ fontSize: "1.2rem" }}>
      {motion || "Sin moción registrada"}{" "}
      
    </p>
  </section>

       {/* Participantes */}
       <section style={{ marginBottom: "1.5rem" }}>
         <h2 style={{ borderBottom: `2px solid ${mainColor}`, color: mainColor }}>
           Participantes
         </h2>
         <div style={{ marginTop: "1rem", borderRadius: "12px", overflow: "hidden", border: "1px solid #ccc" }}>
           <table style={{ width: "100%", borderCollapse: "collapse" }}>
             <thead>
               <tr style={{ backgroundColor: "#ffffff", color: "#1e1b29" }}>
                 <th style={{ padding: "12px", border: "1px solid #ccc", textAlign: "left" }}>Nombre</th>
                 <th style={{ padding: "12px", border: "1px solid #ccc", textAlign: "left" }}>Equipo</th>
                 <th style={{ padding: "12px", border: "1px solid #ccc", textAlign: "left" }}>Bancada</th>
                  {showScores && (
                    <th style={{ padding: "12px", border: "1px solid #ccc", textAlign: "left" }}>Puntaje</th>
                  )}
                  <th style={{ padding: "12px", border: "1px solid #ccc", textAlign: "center" }}>Posición</th>
               </tr>
             </thead>
             <tbody>
                {getOrderedTimers.map((t) => (
                  <tr key={t.id} style={{ backgroundColor: "#ffffff", color: "#7f4aa4" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}>
                    <td style={{ padding: "12px", border: "1px solid #ccc" }}>{t.name}</td>
                    <td style={{ padding: "12px", border: "1px solid #ccc" }}>{t.team}</td>
                    <td style={{ padding: "12px", border: "1px solid #ccc" }}>
                      <span style={{ color: t.side === "Proposición" ? "#7f4aa4" : "#fdbc5a" }}>
                        {t.side === "Proposición" ? (
                          <i className="pi pi-plus-circle" style={{ marginRight: "6px" }} />
                        ) : (
                          <i className="pi pi-minus-circle" style={{ marginRight: "6px" }} />
                        )}
                        {t.side}
                      </span>
                    </td>
                    {isBP ? (
                      <td style={{ padding: "12px", border: "1px solid #ccc" }}>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={scores[t.id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || parseInt(val) >= 0) {
                              setScores({ ...scores, [t.id]: val });
                            }
                          }}
                          style={{ width: "60px", border: `1px solid ${mainColor}`, borderRadius: "4px", padding: "4px" }}
                        />
                      </td>
                    ) : showScores && (
                      <td style={{ padding: "12px", border: "1px solid #ccc" }}>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={scores[t.id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || parseInt(val) >= 0) {
                              setScores({ ...scores, [t.id]: val });
                            }
                          }}
                          style={{ width: "60px", border: `1px solid ${mainColor}`, borderRadius: "4px", padding: "4px" }}
                        />
                      </td>
                    )}
                    {isBP ? (
                      <td style={{ padding: "12px", border: "1px solid #ccc", textAlign: "center", fontWeight: "bold" }}>
                        {teamPlaces[t.team] ? `${teamPlaces[t.team]}°` : "-"}
                      </td>
                    ) : format === "WS" ? (
                      <td style={{ padding: "12px", border: "1px solid #ccc", textAlign: "center", fontWeight: "bold" }}>
                        {wsSides && wsSides.length > 0 && wsSides[0].total > 0
                          ? (t.side === wsSides[0].side ? "1°" : "2°")
                          : "-"}
                      </td>
                    ) : showPosition && (
                      <td style={{ padding: "12px", border: "1px solid #ccc", textAlign: "center", fontWeight: "bold" }}>
                        {calculatedPositions[t.id] ? `${calculatedPositions[t.id]}°` : "-"}
                      </td>
                    )}
                  </tr>
                ))}
             </tbody>
           </table>
         </div>
       </section>

      {/* Ganadores */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ borderBottom: `1px solid ${mainColor}`, color: mainColor }}>Ganadores</h2>
        {isBP ? (
          rankedTeams.filter(t => t.total < 99).length === 0 ? (
            <p style={{ fontSize: "1.2rem", color: "#555" }}>Aún no definido</p>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "1rem", padding: "1.5rem 0" }}>
              {rankedTeams.map((rt, idx) => {
                if (rt.total >= 99) return null;
                const teamScore = teamsList.find(t => t === rt.team) ? teamTotals[rt.team] : 0;
                const medals = ["🥇", "🥈", "🥉", "🫂"];
                const colors = ["#FFD700", "#C0C0C0", "#CD7F32", "#6c757d"];
                const heights = [120, 100, 80, 60];
                const bgBase = colors[idx];
                const emoji = medals[idx];
                return (
                  <div key={rt.team} style={{ textAlign: "center", flex: 1, padding: "1rem" }}>
                    <div style={{
                      fontSize: idx < 3 ? (idx === 0 ? "3rem" : "2.5rem") : "2.5rem",
                      fontWeight: "bold",
                      color: bgBase,
                      marginBottom: "0.5rem",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                    }}>
                      {emoji}
                    </div>
                    <div style={{
                      background: idx === 0 ? `linear-gradient(135deg, #FFD700, #fdbc5a)` : bgBase,
                      color: idx === 0 ? "#1e1b29" : (idx === 3 ? "#fff" : "#1e1b29"),
                      padding: "0.8rem 1.2rem",
                      borderRadius: "8px 8px 0 0",
                      fontWeight: "bold",
                      fontSize: idx === 0 ? "1.2rem" : "1.1rem",
                      height: `${heights[idx]}px`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: idx === 0 ? "0 2px 8px rgba(255,215,0,0.3)" : "none"
                    }}>
                      {rt.team}
                    </div>
                    <div style={{
                      background: idx === 0 ? "linear-gradient(135deg, #fff9e6, #fff3cc)" : (idx < 3 ? ["#e8e8e8", "#f0e0d0"][idx - 1] : "#e9ecef"),
                      padding: "0.5rem",
                      borderRadius: "0 0 8px 8px",
                      fontSize: idx === 0 ? "1rem" : "0.9rem",
                      fontWeight: "bold",
                      color: idx === 0 ? "#b8860b" : "#555"
                    }}>
                      {teamScore} pts
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : format === "WS" ? (
          !wsSides || wsSides.length === 0 || wsSides[0].total === 0 ? (
            <p style={{ fontSize: "1.2rem", color: "#555" }}>Aún no definido</p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem", padding: "1.5rem 0" }}>
              {wsSides[0] && (
                <div style={{ textAlign: "center", flex: 1, padding: "1rem" }}>
                  <div style={{
                    fontSize: "2.5rem",
                    color: "#FFD700",
                    marginBottom: "0.5rem"
                  }}>
                    🏆
                  </div>
                  <div style={{
                    background: "linear-gradient(135deg, #FFD700, #fdbc5a)",
                    color: "#1e1b29",
                    padding: "1rem 1.2rem",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    boxShadow: "0 2px 8px rgba(255,215,0,0.3)"
                  }}>
                    {wsSides[0].side}
                  </div>
                  <div style={{
                    marginTop: "0.5rem",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    color: "#7f4aa4"
                  }}>
                    Bancada ganadora · {wsSides[0].total} pts
                  </div>
                </div>
              )}
              {wsSides[1] && (
                <div style={{ textAlign: "center", flex: 1, padding: "1rem" }}>
                  <div style={{
                    fontSize: "2.5rem",
                    color: "#999",
                    marginBottom: "0.5rem"
                  }}>
                    🫂
                  </div>
                  <div style={{
                    background: "#e9ecef",
                    color: "#555",
                    padding: "1rem 1.2rem",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "1.2rem"
                  }}>
                    {wsSides[1].side}
                  </div>
                  <div style={{
                    marginTop: "0.5rem",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    color: "#555"
                  }}>
                    Bancada perdedora · {wsSides[1].total} pts
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "1rem", padding: "1.5rem 0" }}>
            {rankedTeams[0] && (
              <div style={{ textAlign: "center", flex: 1, padding: "1rem" }}>
                <div style={{
                  fontSize: "3rem",
                  fontWeight: "bold",
                  color: "#FFD700",
                  marginBottom: "0.5rem",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.15)"
                }}>
                  🥇
                </div>
                <div style={{
                  background: "linear-gradient(135deg, #FFD700, #fdbc5a)",
                  color: "#1e1b29",
                  padding: "1rem 1.2rem",
                  borderRadius: "8px 8px 0 0",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  height: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(255,215,0,0.3)"
                }}>
                  {rankedTeams[0].team}
                </div>
                <div style={{
                  background: "linear-gradient(135deg, #fff9e6, #fff3cc)",
                  padding: "0.5rem",
                  borderRadius: "0 0 8px 8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: "#b8860b"
                }}>
                  {rankedTeams[0].total} pts
                </div>
              </div>
            )}
            {rankedTeams[1] && (
              <div style={{ textAlign: "center", flex: 1, padding: "1rem" }}>
                <div style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#C0C0C0",
                  marginBottom: "0.5rem",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                }}>
                  🥈
                </div>
                <div style={{
                  background: "#C0C0C0",
                  color: "#1e1b29",
                  padding: "0.8rem 1.2rem",
                  borderRadius: "8px 8px 0 0",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  height: "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {rankedTeams[1].team}
                </div>
                <div style={{
                  background: "#e8e8e8",
                  padding: "0.5rem",
                  borderRadius: "0 0 8px 8px",
                  fontSize: "0.9rem",
                  color: "#555"
                }}>
                  {rankedTeams[1].total} pts
                </div>
              </div>
            )}
            {rankedTeams[2] && (
              <div style={{ textAlign: "center", flex: 1, padding: "1rem" }}>
                <div style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#CD7F32",
                  marginBottom: "0.5rem",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                }}>
                  🥉
                </div>
                <div style={{
                  background: "#CD7F32",
                  color: "#fff",
                  padding: "0.8rem 1.2rem",
                  borderRadius: "8px 8px 0 0",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {rankedTeams[2].team}
                </div>
                <div style={{
                  background: "#f0e0d0",
                  padding: "0.5rem",
                  borderRadius: "0 0 8px 8px",
                  fontSize: "0.9rem",
                  color: "#555"
                }}>
                  {rankedTeams[2].total} pts
                </div>
              </div>
            )}
            {rankedTeams[3] && (
              <div style={{ textAlign: "center", flex: 1, padding: "1rem" }}>
                <div style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#6c757d",
                  marginBottom: "0.5rem",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                }}>
                  🫂
                </div>
                <div style={{
                  background: "#6c757d",
                  color: "#fff",
                  padding: "0.8rem 1.2rem",
                  borderRadius: "8px 8px 0 0",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {rankedTeams[3].team}
                </div>
                <div style={{
                  background: "#e9ecef",
                  padding: "0.5rem",
                  borderRadius: "0 0 8px 8px",
                  fontSize: "0.9rem",
                  color: "#555"
                }}>
                  {rankedTeams[3].total} pts
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Botón imprimir */}
      <div className="no-print" style={{ textAlign: "center" }}>
        <button
          className="button primary"
          onClick={handlePrint}
          style={{ backgroundColor: accentColor, color: "#1e1b29", fontWeight: "bold" }}
        >
          <i className="pi pi-print" style={{ marginRight: "6px" }} />Imprimir Acta
        </button>
      </div>
    </div>
  );
}
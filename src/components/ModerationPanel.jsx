import TimerCard from "./TimerCard";
import 'primeicons/primeicons.css';

export default function ModerationPanel({ store, format }) {
  const { motion, timers, activeTimerId, startTimer, pauseTimer, resetTimer } = store;

  const sidesByFormat = {
    bp: ["Proposición", "Oposición"],
    ws: ["Proposición", "Oposición"],
    persuade: ["Proposición", "Oposición"]
  };

  const sides = sidesByFormat[format] || ["Proposición", "Oposición"];

  const sortedTimersBySide = (side) => {
    const sideTimers = timers.filter(t => t.side === side);
    const teamFirstOrder = {};
    sideTimers.forEach(t => {
      if (!teamFirstOrder[t.team] || t.order < teamFirstOrder[t.team]) {
        teamFirstOrder[t.team] = t.order;
      }
    });
    return sideTimers.sort((a, b) => {
      if (a.team !== b.team) {
        return (teamFirstOrder[a.team] ?? 0) - (teamFirstOrder[b.team] ?? 0);
      }
      return a.order - b.order;
    });
  };

  return (
    <div>
      <div className="header" style={{ marginBottom: 12 }}>
        <h2 className="motion">
          {motion || "Moción sin definir"}{" "}
          <span className="badge"style={{ fontWeight: "bold" }}>{format}</span>
        </h2>
      </div>


      {/* División en columnas según bancadas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {sides.map((sideName, idx) => {
          const sideTimers = sortedTimersBySide(sideName);
          let content;
          if (format === "BP") {
            const teams = [...new Set(sideTimers.map(t => t.team))];
            const houseColors = ["#fdbc5a", "#7f4aa4"];
            content = teams.map((teamName, ti) => (
              <div key={teamName} style={{
                marginTop: ti > 0 ? "24px" : 0,
                borderLeft: `3px solid ${houseColors[ti]}`,
                paddingLeft: "12px",
                backgroundColor: ti === 0
                  ? "rgba(253, 188, 90, 0.06)"
                  : "rgba(127, 74, 164, 0.08)",
                borderRadius: "0 8px 8px 0",
                paddingTop: "8px",
                paddingBottom: "4px"
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  marginBottom: "8px"
                }}>
                  <span style={{
                    fontWeight: "bold", fontSize: "11px", textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: houseColors[ti],
                    backgroundColor: ti === 0
                      ? "rgba(253, 188, 90, 0.2)"
                      : "rgba(127, 74, 164, 0.3)",
                    padding: "2px 8px",
                    borderRadius: "4px"
                  }}>
                    {ti === 0 ? "⬇ Cámara Alta" : "⬆ Cámara Baja"}
                  </span>
                                  </div>
                {sideTimers
                  .filter(t => t.team === teamName)
                  .map(t => (
                    <TimerCard
                      key={t.id}
                      timer={t}
                      isActive={activeTimerId === t.id}
                      onStart={() => startTimer(t.id)}
                      onPause={() => pauseTimer(t.id)}
                      onReset={() => resetTimer(t.id)}
                      format={format}
                    />
                  ))}
              </div>
            ));
          } else {
            content = sideTimers.map(t => (
              <TimerCard
                key={t.id}
                timer={t}
                isActive={activeTimerId === t.id}
                onStart={() => startTimer(t.id)}
                onPause={() => pauseTimer(t.id)}
                onReset={() => resetTimer(t.id)}
                format={format}
              />
            ));
          }
          return (
            <div key={idx}>
              <h3>
                {sideName === "Proposición" ? (
                  <i className="pi pi-plus-circle" style={{ color: "#7f4aa4", marginRight: "8px", fontSize: "1.5rem" }} />
                ) : (
                  <i className="pi pi-minus-circle" style={{ color: "#fdbc5a", marginRight: "8px", fontSize: "1.5rem" }} />
                )}
                {format === "BP" && sideName === "Proposición" ? "Gobierno" : sideName}
              </h3>
              {content}
            </div>
          );
        })}
      </div>

      {timers.length === 0 && (
        <p className="helper" style={{ marginTop: 12 }}>
          Configura al menos un temporizador en la pestaña “Configuración”.
        </p>
      )}
    </div>
  );
}
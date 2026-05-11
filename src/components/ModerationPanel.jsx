import TimerCard from "./TimerCard";
import 'primeicons/primeicons.css';

export default function ModerationPanel({ store, format }) {
  const { motion, timers, activeTimerId, startTimer, pauseTimer, resetTimer, pauseAll } = store;

  const sidesByFormat = {
    bp: ["Proposición", "Oposición"],
    ws: ["Proposición", "Oposición"],
    persuade: ["Proposición", "Oposición"]
  };

  const sides = sidesByFormat[format] || ["Proposición", "Oposición"];

  const sideOrder = { "Proposición": 0, "Oposición": 1 };

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
        <button
          className="button primary"
          onClick={pauseAll}
          style={{ backgroundColor: "#fdbc5a", color: "#1e1b29", fontWeight: "bold" }}
        >
          <i className="pi pi-pause"  /> Pausar todo
        </button>
      </div>


      {/* División en columnas según bancadas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {sides.map((sideName, idx) => (
          <div key={idx}>
            <h3>
              {sideName === "Proposición" ? (
                <i className="pi pi-plus-circle" style={{ color: "#7f4aa4", marginRight: "8px", fontSize: "1.5rem" }} />
              ) : (
                <i className="pi pi-minus-circle" style={{ color: "#fdbc5a", marginRight: "8px", fontSize: "1.5rem" }} />
              )}
              {sideName}
            </h3>
            {sortedTimersBySide(sideName)
              .map(t => (
                <TimerCard
                  key={t.id}
                  timer={t}
                  isActive={activeTimerId === t.id}
                  onStart={() => startTimer(t.id)}
                  onPause={() => pauseTimer(t.id)}
                  onReset={() => resetTimer(t.id)}
                  format={format} // pasamos el formato también
                />
              ))}
          </div>
        ))}
      </div>

      {timers.length === 0 && (
        <p className="helper" style={{ marginTop: 12 }}>
          Configura al menos un temporizador en la pestaña “Configuración”.
        </p>
      )}
    </div>
  );
}
import { formatMMSS } from "../utils/time";
import 'primeicons/primeicons.css';

export default function TimerCard({ timer, isActive, onStart, onPause, onReset, format }) {
  const atZero = timer.remainingMs === 0;
  const elapsed = timer.initialMs - timer.remainingMs;

  // Tiempo protegido según formato
  let isProtectedTime = false;
  if (format === "BP" && timer.isRunning) {
    // Primer minuto protegido
    if (elapsed < 60000) {
      isProtectedTime = true;
    }
    // Entre minuto 6 y 7 protegido
    if (elapsed >= 360000 && elapsed < 420000) {
      isProtectedTime = true;
    }
  } else if (format === "WS" && timer.isRunning) {
    isProtectedTime = elapsed < 20000;
  } else if (format === "PERSO" && timer.isRunning) {
    isProtectedTime = elapsed < 20000;
  }

  // Nuevo: estado de alerta entre 7:00 y 7:15
  const isRedAlert =
    format === "BP" && timer.isRunning && elapsed >= 420000 && elapsed < 450000;

  // Mostrar tiempo distinto según formato
  let displayTime;
  if (format === "PERSO") {
    displayTime = formatMMSS(timer.remainingMs);
  } else {
    displayTime = formatMMSS(elapsed);
  }

  const sideIcon =
    timer.side === "Proposición" ? (
      <i className="pi pi-user-plus" style={{ color: "#7f4aa4", fontSize: "1.5rem", marginRight: "6px" }} />
    ) : (
      <i className="pi pi-user-minus" style={{ color: "#fdbc5a", fontSize: "1.5rem", marginRight: "6px" }} />
    );

  function handleClick() {
    if (!timer.isRunning && !atZero) {
      onStart();
    } else if (timer.isRunning) {
      onPause();
    }
  }

  return (
    <div
      className={`timer-card ${isActive ? "active" : ""} ${atZero ? "zero" : ""} ${isRedAlert ? "red-alert" : ""}`}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="timer-header">
        <strong>
          {sideIcon} {timer.name}
          {isProtectedTime && (
            <span style={{ marginLeft: "8px", color: "#facc15", fontSize: "0.9rem" }}>
              <i className="pi pi-shield" style={{ marginRight: "4px" }} />
              Tiempo protegido
            </span>
          )}
        </strong>
       <span
  style={{
    fontVariantNumeric: "tabular-nums",
    fontSize: isActive ? 48 : 24,   // 👈 más grande si está activo
    color: isRedAlert ? "red" : "inherit",
    transition: "font-size 0.3s ease" // animación suave
  }}
>
  {displayTime}
</span>

      </div>

      {timer.team && (
        <p className="helper" style={{ marginTop: 4 }}>
          {timer.team}
        </p>
      )}

      <div className="timer-actions" style={{ marginTop: 8 }}>
        {!timer.isRunning && !atZero && (
          <button className="button success" onClick={onStart}><i className="pi pi-play" /></button>
        )}
        {timer.isRunning && (
          <button className="button" onClick={onPause}><i className="pi pi-pause" /></button>
        )}
        {format !== "BP" && (
          <button className="button" onClick={onReset}><i className="pi pi-undo" /></button>
        )}
      </div>
    </div>
  );
}

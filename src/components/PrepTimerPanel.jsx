import { useState, useEffect } from "react";
import { formatMMSS, parseMMSSToMs } from "../utils/time";
import "primeicons/primeicons.css";

export default function PrepTimerPanel({ store, format }) {
  const prepTimes = {
    BP: "15:00",
    WS: "59:00",
    PERSO: "10:00"
  };

  const getInitialTime = () => parseMMSSToMs(prepTimes[format] || "10:00");

  const [remainingMs, setRemainingMs] = useState(getInitialTime);
  const [isRunning, setIsRunning] = useState(false);

  const { motion } = store;

  useEffect(() => {
    let interval;
    if (isRunning && remainingMs > 0) {
      interval = setInterval(() => {
        setRemainingMs((prev) => Math.max(prev - 1000, 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingMs]);

  function start() {
    setIsRunning(true);
  }
  function pause() {
    setIsRunning(false);
  }
  function reset() {
    setRemainingMs(parseMMSSToMs(prepTimes[format] || "10:00"));
    setIsRunning(false);
  }

  return (
    <div className="prep-timer-panel">
  {/* Mostrar la moción */}
  <div style={{ marginBottom: "1rem", textAlign: "center"}}>
    <h3 style={{ color: "#7f4aa4" }}>Moción</h3>
    <h2 style={{ fontSize: "1.2rem" }}>
      {motion || "Sin moción registrada"}{" "}
      <span className="badge" style={{ fontWeight: "bold" }}>
        {format}
      </span>
    </h2>
  </div>

      {/* Cronómetro */}
      <p style={{ fontSize: "4rem", color: "#fdbc5a", textAlign: "center"}}>
        {formatMMSS(remainingMs)}
      </p>

      {/* Botones */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        {!isRunning && remainingMs > 0 && (
          <button className="button success" onClick={start}><i className="pi pi-play" /></button>
        )}
        {isRunning && (
          <button className="button" onClick={pause}><i className="pi pi-pause" /></button>
        )}
        <button className="button" onClick={reset}><i className="pi pi-undo" /></button>
      </div>
    </div>
  );
}
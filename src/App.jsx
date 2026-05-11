import { useState } from "react";
import { Menubar } from "primereact/menubar";
import perso from "./assets/Persuade.png";
import { useCronoStore } from "./store/useCronoStore";
import ModerationPanel from "./components/ModerationPanel";
import ConfigPanel from "./components/ConfigPanel";
import PrepTimerPanel from "./components/PrepTimerPanel";
import ReportPanel from "./components/ReportPanel";
import DebateFormats from "./components/DebateFormato";

export default function App() {
  const [selectedFormat, setSelectedFormat] = useState("PERSO"); // valor inicial
  const store = useCronoStore(selectedFormat); // ahora recibe el formato
  const [tab, setTab] = useState("moderation");

  function clearCache() {
    const cacheKey = `cronoDebate:${selectedFormat}`;
    localStorage.removeItem(cacheKey);
    window.location.reload();
  }

  const items = [
    { label: "Moderación", icon: "pi pi-users", command: () => setTab("moderation") },
    { label: "Configuración", icon: "pi pi-cog", command: () => setTab("config") },
    { label: "Preparación", icon: "pi pi-clock", command: () => setTab("prep") },
    { label: "Reporte", icon: "pi pi-file", command: () => setTab("report") },
{
  label: "Borrar Datos",
  icon: "pi pi-trash",
  command: clearCache,
  template: (item, options) => (
    <a
      onClick={options.onClick}
      className="p-menuitem-link" // usa la clase estándar de PrimeReact
      style={{
        color: "red",
        fontWeight: "bold",
        border: "2px solid red",
        borderRadius: "4px",
        padding: "0.5rem 1rem", // mismo padding que los otros
        display: "flex",
        alignItems: "center"
      }}
    >
      <i className={item.icon} style={{ color: "red", marginRight: "8px" }} />
      <span className="p-menuitem-text">{item.label}</span>
    </a>
  )
}
  ];

  const start = (
    <h1
      style={{ margin: 0, padding: "0.5rem", cursor: "pointer" }}
      onClick={() => setSelectedFormat(null)} // vuelve a la pantalla de selección
    >
      Persuade
    </h1>
  );

  return (
    <div className="app no-print">
      {/* Menubar fijo */}
      <div
        className="header"
        style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 }}
      >
        <Menubar
          model={items}
          start={start}
          style={{ backgroundColor: "#7f4aa4", color: "#fdbc5a" }}
        />
      </div>

      {/* Logo */}
      <img
        src={perso}
        alt="persuade"
        style={{ position: "fixed", top: "10px", right: "10px", height: "40px", zIndex: 9999 }}
      />

      {/* Panel principal */}
      <div className="panel" style={{ marginTop: "70px" }}>
        {!selectedFormat ? (
          <DebateFormats onSelectFormat={setSelectedFormat} /> // primero se muestra selección
        ) : tab === "moderation" ? (
          <ModerationPanel store={store} format={selectedFormat} /> // pasamos formato
        ) : tab === "config" ? (
          <ConfigPanel store={store} format={selectedFormat} />
        ) : tab === "prep" ? (
          <PrepTimerPanel key={selectedFormat} store={store} format={selectedFormat} />
        ) : (
          <ReportPanel store={store} format={selectedFormat} />
        )}
      </div>
    </div>
  );
}
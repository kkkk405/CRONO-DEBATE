import { useState } from "react";
import { Menubar } from "primereact/menubar";

import { useCronoStore } from "./store/useCronoStore";
import ModerationPanel from "./components/ModerationPanel";
import ConfigPanel from "./components/ConfigPanel";
import PrepTimerPanel from "./components/PrepTimerPanel";
import ReportPanel from "./components/ReportPanel";

export default function App() {
  const store = useCronoStore();
  const [tab, setTab] = useState("moderation");

  const items = [
    {
      label: "Moderación",
      icon: "pi pi-users",
      command: () => setTab("moderation")
    },
    {
      label: "Configuración",
      icon: "pi pi-cog",
      command: () => setTab("config")
    },
    {
      label: "Preparación",
      icon: "pi pi-clock",
      command: () => setTab("prep")
    },
    {
      label: "Reporte",              
      icon: "pi pi-file",
      command: () => setTab("report")
    }
  ];

  return (
    <div className="app">
      <div className="header">
        <Menubar model={items} />
      </div>

      <div className="panel">
        {tab === "moderation" ? (
          <ModerationPanel store={store} />
        ) : tab === "config" ? (
          <ConfigPanel store={store} />
        ) : tab === "prep" ? (
          <PrepTimerPanel store={store} />
        ) : (
          <ReportPanel store={store} />  
        )}
      </div>
    </div>
  );
}
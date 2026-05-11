import { useState, useEffect } from "react";
import { parseMMSSToMs, formatMMSS } from "../utils/time";

import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { InputTextarea } from 'primereact/inputtextarea';
import { SelectButton } from "primereact/selectbutton";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export default function ConfigPanel({ store, format }) {
  const {
    motion,
    setMotion,
    timers,
    addTimer,
    updateTimer,
    removeTimer,
    reorderTimer,
    teams,
    addTeam,
    removeTeam
  } = store;

  const defaultTimes = {
    BP: "07:15",
    WS: "08:15",
    PERSO: "05:15"
  };

  const defaultSides = {
    BP: ["Proposición", "Oposición"],
    WS: ["Proposición", "Oposición"],
    PERSO: ["Proposición", "Oposición"]
  };

  const [name, setName] = useState("");
  const [mmss, setMmss] = useState(defaultTimes[format] || "05:15");
  const [team, setTeam] = useState(""); 
  const [newSide, setNewSide] = useState(defaultSides[format][0]); 
  const [newTeam, setNewTeam] = useState(""); 
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState("motion");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMmss(defaultTimes[format] || "05:15");
    setNewSide(defaultSides[format][0]); 
  }, [format]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function onAdd() {
    const ms = parseMMSSToMs(mmss);
    if (!name.trim()) return setError("El nombre es obligatorio.");
    if (ms === null) return setError("Tiempo inválido (usa MM:SS entre 00:10 y 59:59).");
    if (ms < 10000) return setError("Tiempo mínimo: 00:10.");
    if (!team) return setError("Debes seleccionar un equipo.");

    let orderValue;
    if (format === "PERSO") {
      orderValue = timers.length > 0 ? Math.max(...timers.map(t => t.order)) + 1 : 0;
    } else {
      orderValue = timers.length;
    }

    addTimer({ name: name.trim(), initialMs: ms, team, side: newSide, order: orderValue });

    setName("");
    setMmss(defaultTimes[format] || "05:15");
    setTeam("");
    setNewSide(defaultSides[format][0]); 
    setError("");
  }

  function getOrderedTimers() {
    const teamFirstOrder = {};
    timers.forEach(t => {
      if (!teamFirstOrder[t.team] || t.order < teamFirstOrder[t.team]) {
        teamFirstOrder[t.team] = t.order;
      }
    });
    return [...timers].sort((a, b) => {
      if (a.team !== b.team) {
        return (teamFirstOrder[a.team] ?? 0) - (teamFirstOrder[b.team] ?? 0);
      }
      return a.order - b.order;
    });
  }

  function assignSidesAndOrderRandomly() {
    if (timers.length === 0) return;
    if (format === "BP") {
      const teamsList = [...new Set(timers.map(t => t.team))].filter(Boolean);
      const shuffledTeams = teamsList.sort(() => Math.random() - 0.5);
      const half = Math.ceil(shuffledTeams.length / 2);
      const teamSides = {};
      shuffledTeams.forEach((team, idx) => {
        teamSides[team] = idx < half ? defaultSides[format][0] : defaultSides[format][1];
      });
      const shuffledTimers = [...timers].sort(() => Math.random() - 0.5);
      shuffledTimers.forEach((t, idx) => {
        updateTimer(t.id, { side: teamSides[t.team], order: idx });
      });
    } else {
      const teamsList = [...new Set(timers.map(t => t.team))].filter(Boolean);
      const shuffledTeams = teamsList.sort(() => Math.random() - 0.5);
      const half = Math.ceil(shuffledTeams.length / 2);
      const teamSides = {};
      shuffledTeams.forEach((team, idx) => {
        teamSides[team] = idx < half ? defaultSides[format][0] : defaultSides[format][1];
      });
      const shuffledTimers = [...timers].sort(() => Math.random() - 0.5);
      shuffledTimers.forEach((t, idx) => {
        updateTimer(t.id, { side: teamSides[t.team], order: idx });
      });
    }
  }

return (
  <div style={{ display: "flex", gap: "24px" }}>
  
    
    <aside style={{ width: "200px", borderRight: "1px solid #ddd", paddingRight: "16px" }}>

    <div
      style={{
        marginBottom: "32px",
        color: "#d9d9d9",  
        fontSize: "14px",
        lineHeight: "1.4"
      }}
    >
      <i className="pi pi-info-circle" style={{ marginRight: "6px" }} />
      <span><strong>Configuración del debate</strong></span>
      <p style={{ marginTop: "6px" }}>
        Define la moción, registra equipos y ajusta los temporizadores.
        Usa el menú para navegar entre secciones.
      </p>
    </div>

      <div
        style={{
    cursor: "pointer",
    marginBottom: "15px",
    color: activeSection === "motion" ? "#7f4aa4" : "inherit", 
    backgroundColor: activeSection === "motion" ? "rgba(127, 74, 164, 0.2)" : "transparent",
    padding: "8px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: activeSection === "motion" ? "bold" : "normal"
  }}

        onClick={() => setActiveSection("motion")}
      >
        <i className="pi pi-book" /> Moción
      </div>
      <div
        style={{
    cursor: "pointer",
    marginBottom: "15px",
    color: activeSection === "teams" ? "#7f4aa4" : "inherit",
    backgroundColor: activeSection === "teams" ? "rgba(127, 74, 164, 0.2)" : "transparent",
    padding: "8px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: activeSection === "teams" ? "bold" : "normal"
  }}

        onClick={() => setActiveSection("teams")}
      >
        <i className="pi pi-users" /> Equipos
      </div>
      <div
        style={{
    cursor: "pointer",
    marginBottom: "15px",
    color: activeSection === "timers" ? "#7f4aa4" : "inherit",
    backgroundColor: activeSection === "timers" ? "rgba(127, 74, 164, 0.2)" : "transparent",
    padding: "8px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: activeSection === "timers" ? "bold" : "normal"
  }}

        onClick={() => setActiveSection("timers")}
      >
        <i className="pi pi-clock" /> Temporizadores
      </div>
    </aside>

    <main style={{ flex: 1 }}>
      {activeSection === "motion" && (
  <section
    style={{
      backgroundColor: "rgba(127, 74, 164, 0.1)", 
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      maxWidth: "700px",
      margin: "0 auto"
    }}
  >
  <div>
    <h2 style={{ margin: 0, color: "#d9d9d9" }}>
      Moción{" "}
      <span className="badge" style={{ fontWeight: "bold" }}>
        {format}
      </span>
    </h2>
    <p style={{ marginTop: "4px", color: "#d9d9d9", fontSize: "14px" }}>
      Define aquí la moción que aparecerá en el panel de moderación.
    </p>
  </div>


    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: "6px" }}>
      <FloatLabel>
  <InputTextarea
    id="motion"
    value={motion}
    onChange={(e) => setMotion(e.target.value)}
    style={{
      width: "100%",
      backgroundColor: "rgba(127, 74, 164, 0.1)",
      color: "#d9d9d9",
      border: "1px solid #ddd",
      borderRadius: "6px",
      padding: "10px"
    }}
  />
  <label htmlFor="motion">Texto de la moción</label>
</FloatLabel>
  
    </div>


  </section>
)}

{activeSection === "teams" && (
  <section
    style={{
      backgroundColor: "rgba(127, 74, 164, 0.1)",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      maxWidth: "700px",
      margin: "0 auto"
    }}
  >
    <div>
      <h2 style={{ margin: 0, color: "#d9d9d9" }}>Registrar equipos</h2>
      <p style={{ marginTop: "4px", color: "#d9d9d9", fontSize: "14px" }}>
        Agrega los equipos que participarán en el debate.
      </p>
    </div>
<div style={{ display: "flex", flexDirection: "row", gap: "8px", alignItems: "flex-end" }}>
  <FloatLabel style={{ flex: 1 }}>
    <InputText
      id="team"
      value={newTeam}
      onChange={(e) => setNewTeam(e.target.value)}
      style={{
        width: "100%",
        backgroundColor: "rgba(127, 74, 164, 0.1)",
        color: "#d9d9d9",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "10px"
      }}
    />
    <label htmlFor="team">Nombre del equipo</label>
  </FloatLabel>

  <button
    className="button primary"
    onClick={() => { addTeam(newTeam); setNewTeam(""); }}
    style={{
      backgroundColor: "#fdbc5a",
      color: "#1e1b29",
      fontWeight: "bold",
      padding: "10px 16px",
      borderRadius: "6px"
    }}
  >
    <i className="pi pi-plus" />
  </button>
</div>


    <ul className="helper" style={{ marginTop: 8, color: "#d9d9d9", listStyle: "none", padding: 0 }}>
      {teams.map((team, idx) => (
        <li
          key={idx}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 0",
            borderBottom: "1px solid #ddd"
          }}
        >
          <span>{team}</span>
          <button
            className="button danger"
            onClick={() => removeTeam(idx)}
            style={{
              backgroundColor: "transparent",
              color: "#f44336",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>

  </section>
)}


{activeSection === "timers" && (
  <section
    style={{
      backgroundColor: "rgba(127, 74, 164, 0.1)",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      maxWidth: "900px",
      margin: "0 auto"
    }}
  >
    <div>
      <h2 style={{ margin: 0, color: "#d9d9d9" }}>Configurar temporizadores</h2>
      <p style={{ marginTop: "4px", color: "#d9d9d9", fontSize: "14px" }}>
        Define los tiempos y roles de cada oradora.
      </p>
    </div>

   <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <FloatLabel>
        <InputText
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            backgroundColor: "rgba(127, 74, 164, 0.1)",
            color: "#d9d9d9",
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "10px",
          }}
        />
        <label htmlFor="name">Nombre de la oradora</label>
      </FloatLabel>



      <div>
        <label style={{ color: "#fdbc5a" , marginLeft: "10px" }}>Equipo</label>
        <select
          className="select"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          style={{
            width: "100%",
            backgroundColor: "rgba(127, 74, 164, 0.1)",
            color: "#fdbc5a",
            borderRadius: "6px",
            padding: "10px"
          }}
        >
          <option value="">-- Selecciona equipo --</option>
          {teams.map((t, idx) => (
            <option key={idx} value={t}>{t}</option>
          ))}
        </select>
      </div>


 <div >
  <label style={{ color: "#fdbc5a", marginLeft: "10px" }}>Tiempo</label>
  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}> 
    <select
      className="select"
      value={mmss.split(":")[0]}
      onChange={(e) => {
        const newMmss = `${e.target.value}:${mmss.split(":")[1]}`;
        setMmss(newMmss);
      }}
      style={{
        width: "100%",
        backgroundColor: "rgba(127, 74, 164, 0.1)",
        color: "#fdbc5a",
        borderRadius: "6px",
        padding: "10px"
      }}
    >
      <option value="">MM</option>
      {Array.from({ length: 60 }, (_, i) => (
        <option key={i} value={String(i).padStart(2, "0")}>
          {String(i).padStart(2, "0")}
        </option>
      ))}
    </select>

    <span style={{ color: "#d9d9d9", fontWeight: "bold" }}>:</span>

    <select
      className="select"
      value={mmss.split(":")[1]}
      onChange={(e) => {
        const newMmss = `${mmss.split(":")[0]}:${e.target.value}`;
        setMmss(newMmss);
      }}
      style={{
        width: "100%",
        backgroundColor: "rgba(127, 74, 164, 0.1)",
        color: "#fdbc5a",
        borderRadius: "6px",
        padding: "10px"
      }}
    >
      <option value="">SS</option>
      {Array.from({ length: 60 }, (_, i) => (
        <option key={i} value={String(i).padStart(2, "0")}>
          {String(i).padStart(2, "0")}
        </option>
      ))}
    </select>
  </div>
  </div>

<div>
  <label style={{ color: "#fdbc5a" }}>Bancada</label>
  <SelectButton
    value={newSide}
    onChange={(e) => setNewSide(e.value)}
    options={[
      { value: "Proposición", icon: "pi pi-plus-circle" },
      { value: "Oposición", icon: "pi pi-minus-circle" }
    ]}
    itemTemplate={(option) => {
      const isSelected = newSide === option.value;
      const defaultColor = option.value === "Proposición" ? "#7f4aa4" : "#fdbc5a";

      return (
        <i
          className={option.icon}
          style={{
            fontSize: "1.5rem",
            color: isSelected ? "#fff" : defaultColor
          }}
        />
      );
    }}
    style={{
      width: "100%",
      borderRadius: "6px",
      padding: "10px"
    }}
  />
</div>

{error && <p style={{ color: "var(--danger)" }}>{error}</p>}

<button
  className="button primary"
  onClick={() => {
    setError("");
    const ms = parseMMSSToMs(mmss);

    if (!name.trim()) return setError("El nombre es obligatorio.");
    if (ms === null) return setError("Tiempo inválido (usa MM:SS entre 00:10 y 59:59).");
    if (ms < 10000) return setError("Tiempo mínimo: 00:10.");
    if (!team) return setError("Debes seleccionar un equipo.");

    onAdd();
  }}
  style={{ backgroundColor: "#fdbc5a", color: "#1e1b29", fontWeight: "bold" }}
>
  <i className="pi pi-plus" /> Agregar oradora
</button>


<hr style={{ border: "1px solid #d9d9d9", margin: "10px 0" }} />

<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
  <div>
    <h2 style={{ margin: 0, color: "#d9d9d9" }}>Temporizadores agregados</h2>
    <p style={{ marginTop: "4px", color: "#d9d9d9", fontSize: "14px" }}>
      Edita la configuración de las oradoras.
    </p>
  </div>

  <button
    className="button primary"
    onClick={assignSidesAndOrderRandomly}
    style={{
      backgroundColor: "#7f4aa4",
      color: "#fdbc5a",
      fontWeight: "bold",
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer"
    }}
  >
    <i className="pi pi-sync" style={{ fontSize: "1.2rem", color: "#000" }} />
  </button>
</div>


<div style={{ marginTop: 16 }}>
<DataTable
  value={getOrderedTimers()}
  tableStyle={{ minWidth: "40rem" }}
  responsiveLayout="scroll"
  className="custom-timers-table"
  style={{
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #7f4aa4"
  }}
>
  <style>{`
    .custom-timers-table .p-datatable-header {
      background-color: #7f4aa4;
      color: #fdbc5a;
    }
    .custom-timers-table .p-datatable-thead > tr > th {
      background-color: #7f4aa4;
      color: #fdbc5a;
      border-color: #1e1b29;
    }
    .custom-timers-table .p-datatable-tbody > tr {
      background-color: #d9d9d9;
      color: #1e1b29;
    }
    .custom-timers-table .p-datatable-tbody > tr:nth-child(even) {
      background-color: #c5c5c5;
    }
    .custom-timers-table .p-datatable-tbody > tr:hover {
      background-color: #fdbc5a;
    }
    .custom-timers-table .p-datatable-tbody > tr > td {
      border-color: #1e1b29;
    }
  `}</style>
  <Column
    field="name"
    header="Oradora"
    body={(t) =>
      t.editingName ? (
        <input
          className="input"
          value={t.name}
          onBlur={() => updateTimer(t.id, { editingName: false })}
          onChange={(e) => updateTimer(t.id, { name: e.target.value })}
          autoFocus
        />
      ) : (
        <span
          style={{ cursor: "pointer", color: "#7f4aa4" }}
          onClick={() => updateTimer(t.id, { editingName: true })}
        >
          {t.name || "—"}
        </span>
      )
    }
  />


    <Column
      header="Tiempo inicial"
      body={(t) =>
        t.editingTime ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <select
              value={formatMMSS(t.initialMs).split(":")[0]}
              onChange={(e) => {
                const newMmss = `${e.target.value}:${formatMMSS(t.initialMs).split(":")[1]}`;
                const ms = parseMMSSToMs(newMmss);
                updateTimer(t.id, { initialMs: ms, remainingMs: ms });
              }}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={String(i).padStart(2, "0")}>
                  {String(i).padStart(2, "0")}
                </option>
              ))}
            </select>
            <span>:</span>
            <select
              value={formatMMSS(t.initialMs).split(":")[1]}
              onChange={(e) => {
                const newMmss = `${formatMMSS(t.initialMs).split(":")[0]}:${e.target.value}`;
                const ms = parseMMSSToMs(newMmss);
                updateTimer(t.id, { initialMs: ms, remainingMs: ms });
              }}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={String(i).padStart(2, "0")}>
                  {String(i).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span
            style={{ cursor: "pointer", color: "#7f4aa4" }}
            onClick={() => updateTimer(t.id, { editingTime: true })}
          >
            {formatMMSS(t.initialMs)}
          </span>
        )
      }
    />

    <Column
      header="Equipo"
      body={(t) =>
        t.editingTeam ? (
          <select
            value={t.team || ""}
            onBlur={() => updateTimer(t.id, { editingTeam: false })}
            onChange={(e) => updateTimer(t.id, { team: e.target.value })}
            autoFocus
          >
            <option value="">-- Selecciona equipo --</option>
            {teams.map((team, idx) => (
              <option key={idx} value={team}>{team}</option>
            ))}
          </select>
        ) : (
          <span
            style={{ cursor: "pointer", color: "#7f4aa4" }}
            onClick={() => updateTimer(t.id, { editingTeam: true })}
          >
            {t.team || "—"}
          </span>
        )
      }
    />

    <Column
      header="Bancada"
      body={(t) => (
        <SelectButton
          value={t.side}
          onChange={(e) => updateTimer(t.id, { side: e.value })}
          options={[
            { value: "Proposición", icon: "pi pi-plus-circle" },
            { value: "Oposición", icon: "pi pi-minus-circle" }
          ]}
          itemTemplate={(option) => {
            const isSelected = t.side === option.value;
            const defaultColor = option.value === "Proposición" ? "#7f4aa4" : "#fdbc5a";
            return (
              <i
                className={option.icon}
                style={{
                  fontSize: "1rem",
                  color: isSelected ? "#fff" : defaultColor
                }}
              />
            );
          }}
        />
      )}
    />

<Column
  header="Acciones"
  body={(t) => (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        onClick={() => reorderTimer(t.id, "up")}
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <i className="pi pi-arrow-up" />
      </button>
      <button
        onClick={() => reorderTimer(t.id, "down")}
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <i className="pi pi-arrow-down" />
      </button>
      <button
        onClick={() => removeTimer(t.id)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "red" }}
      >
        <i className="pi pi-trash" />
      </button>
    </div>
  )}
/>

  </DataTable>

  {timers.length === 0 && (
    <p className="helper">Aún no hay temporizadores. Agrega al menos uno.</p>
  )}
</div>


    </div>
  </section>
)}
</main>
</div>
  );
}
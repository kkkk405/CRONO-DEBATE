import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { sanitizeText, sanitizeTeamName, sanitizeMotion } from "../utils/sanitize";
import { parseMMSSToMs } from "../utils/time";

const DEFAULT_TIMES = { PERSO: "05:15", BP: "07:15", WS: "08:15" };

const DEFAULT_TEMPLATES = {
  PERSO: {
    teams: ["Equipo A", "Equipo B", "Equipo C", "Equipo D", "Equipo E", "Equipo F"],
    timers: [
      ["Proposición", "Equipo A", "Oradora 1"],
      ["Oposición", "Equipo B", "Oradora 2"],
      ["Proposición", "Equipo C", "Oradora 3"],
      ["Oposición", "Equipo D", "Oradora 4"],
      ["Proposición", "Equipo E", "Oradora 5"],
      ["Oposición", "Equipo F", "Oradora 6"]
    ]
  },
  BP: {
    teams: ["Equipo A", "Equipo B", "Equipo C", "Equipo D"],
    timers: [
      ["Proposición", "Equipo A", "Oradora 1"],
      ["Oposición", "Equipo C", "Oradora 2"],
      ["Proposición", "Equipo A", "Oradora 3"],
      ["Oposición", "Equipo C", "Oradora 4"],
      ["Proposición", "Equipo B", "Oradora 5"],
      ["Oposición", "Equipo D", "Oradora 6"],
      ["Proposición", "Equipo B", "Oradora 7"],
      ["Oposición", "Equipo D", "Oradora 8"]
    ]
  },
  WS: {
    teams: ["Equipo A", "Equipo B"],
    timers: [
      ["Proposición", "Equipo A", "Oradora 1"],
      ["Oposición", "Equipo B", "Oradora 2"],
      ["Proposición", "Equipo A", "Oradora 3"],
      ["Oposición", "Equipo B", "Oradora 4"],
      ["Proposición", "Equipo A", "Oradora 5"],
      ["Oposición", "Equipo B", "Oradora 6"],
      ["Proposición", "Equipo A", "Oradora 7", "04:15"],
      ["Oposición", "Equipo B", "Oradora 8", "04:15"]
    ]
  }
};

function templateMs(format, timerTuple) {
  const mmss = timerTuple[3] || DEFAULT_TIMES[format];
  return parseMMSSToMs(mmss) || 315000;
}

function buildDefaultTimers(format) {
  const template = DEFAULT_TEMPLATES[format];
  if (!template) return [];
  return template.timers.map((timerTuple, idx) => {
    const [side, team, name] = timerTuple;
    const ms = templateMs(format, timerTuple);
    return {
      id: uuid(),
      name,
      initialMs: ms,
      remainingMs: ms,
      order: idx,
      team,
      side,
      isRunning: false
    };
  });
}

// Si los datos guardados son exactamente la plantilla base (sin personalizar),
// se considera "pristina" y se re-siembra con la última versión del template.
function matchesTemplate(data, format) {
  const template = DEFAULT_TEMPLATES[format];
  if (!template) return false;
  if (!data || !Array.isArray(data.timers) || data.timers.length !== template.timers.length) return false;
  return data.timers.every((t, i) =>
    t.name === template.timers[i][2] &&
    (t.team || "") === template.timers[i][1] &&
    (t.side || "") === template.timers[i][0] &&
    t.initialMs === templateMs(format, template.timers[i])
  );
}

function shouldSeed(data, format) {
  return !data || !Array.isArray(data.timers) || data.timers.length === 0 || matchesTemplate(data, format);
}

export function useCronoStore(format) {
  const STORAGE_KEY = `cronoDebate:${format}`;

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function validateMotion(data) {
    if (!data || typeof data.motion !== "string") return "";
    return sanitizeMotion(data.motion);
  }

  function validateTimers(data) {
    if (!data || !Array.isArray(data.timers)) return [];
    return data.timers
      .filter(t => t && typeof t === "object")
      .map(t => ({
        id: typeof t.id === "string" ? t.id : "",
        name: sanitizeText(typeof t.name === "string" ? t.name : ""),
        initialMs: typeof t.initialMs === "number" && t.initialMs >= 0 ? t.initialMs : 0,
        remainingMs: typeof t.remainingMs === "number" && t.remainingMs >= 0 ? t.remainingMs : 0,
        order: typeof t.order === "number" && Number.isInteger(t.order) ? t.order : 0,
        team: sanitizeTeamName(typeof t.team === "string" ? t.team : ""),
        side: t.side === "Oposición" ? "Oposición" : "Proposición",
        isRunning: false
      }));
  }

  function validateTeams(data) {
    if (!data || !Array.isArray(data.teams)) return [];
    return data.teams
      .filter(t => typeof t === "string")
      .map(t => sanitizeTeamName(t))
      .filter(Boolean);
  }

  const stored = loadFromStorage();

  const [motion, setMotion] = useState(() => validateMotion(stored));
  const [timers, setTimers] = useState(() =>
    shouldSeed(stored, format) ? buildDefaultTimers(format) : validateTimers(stored)
  );
  const [teams, setTeams] = useState(() =>
    shouldSeed(stored, format) ? [...(DEFAULT_TEMPLATES[format]?.teams || [])] : validateTeams(stored)
  );

  const [activeTimerId, setActiveTimerId] = useState(null);
  const intervalsRef = useRef(new Map());

  // Recarga los datos del nuevo formato al cambiar de formato
  const [prevFormat, setPrevFormat] = useState(format);
  if (prevFormat !== format) {
    setPrevFormat(format);
    const data = loadFromStorage();
    setMotion(validateMotion(data));
    setTimers(shouldSeed(data, format) ? buildDefaultTimers(format) : validateTimers(data));
    setTeams(shouldSeed(data, format) ? [...(DEFAULT_TEMPLATES[format]?.teams || [])] : validateTeams(data));
    setActiveTimerId(null);
  }

  // Limpia intervalos del formato anterior al cambiar
  useEffect(() => {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current.clear();
  }, [format]);

  function addTeam(name) {
    const cleaned = sanitizeTeamName(name);
    if (!cleaned.trim()) return;
    setTeams(prev => [...prev, cleaned]);
  }

  // eliminar equipo
  function removeTeam(index) {
    setTeams(prev => prev.filter((_, i) => i !== index));
  }

  // Guardamos cada vez que cambian motion, timers o teams
  useEffect(() => {
    const payload = {
      motion,
      teams,
      timers: timers.map(t => ({
        id: t.id,
        name: t.name,
        initialMs: t.initialMs,
        remainingMs: t.remainingMs,
        order: t.order,
        team: t.team || "",
        side: t.side || "Proposición"
      })),
      activeTimerId: null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [motion, timers, teams, STORAGE_KEY]);

  function addTimer({ name, initialMs, team = "", side = "Proposición" }) {
    const newTimer = {
      id: uuid(),
      name: sanitizeText(name || ""),
      initialMs,
      remainingMs: initialMs,
      order: timers.length,
      isRunning: false,
      team: sanitizeTeamName(team),
      side: side === "Oposición" ? "Oposición" : "Proposición"
    };
    setTimers(prev => [...prev, newTimer]);
  }

  function updateTimer(id, patch) {
    const safePatch = { ...patch };
    if ("name" in safePatch) safePatch.name = sanitizeText(safePatch.name || "");
    if ("team" in safePatch) safePatch.team = sanitizeTeamName(safePatch.team || "");
    if ("side" in safePatch) safePatch.side = safePatch.side === "Oposición" ? "Oposición" : "Proposición";
    setTimers(prev =>
      prev.map(t => (t.id === id ? { ...t, ...safePatch } : t))
    );
  }

  function removeTimer(id) {
    pauseTimer(id);
    setTimers(prev =>
      prev.filter(t => t.id !== id).map((t, idx) => ({ ...t, order: idx }))
    );
  }

  function reorderTimer(id, direction) {
    setTimers(prev => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex(t => t.id === id);
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= arr.length) return prev;
      const tmpOrder = arr[idx].order;
      arr[idx].order = arr[swapWith].order;
      arr[swapWith].order = tmpOrder;
      return arr;
    });
  }

  function startTimer(id) {
    if (intervalsRef.current.has(id)) {
      clearInterval(intervalsRef.current.get(id));
      intervalsRef.current.delete(id);
    }

    if (activeTimerId && activeTimerId !== id) {
      pauseTimer(activeTimerId);
    }

    const t = timers.find(x => x.id === id);
    if (!t || t.remainingMs === 0) return;

    setActiveTimerId(id);
    updateTimer(id, { isRunning: true });

    const handle = setInterval(() => tick(id, 100), 100);
    intervalsRef.current.set(id, handle);
  }

  function pauseTimer(id) {
    const handle = intervalsRef.current.get(id);
    if (handle) {
      clearInterval(handle);
      intervalsRef.current.delete(id);
    }
    updateTimer(id, { isRunning: false });
    if (activeTimerId === id) setActiveTimerId(null);
  }

  function tick(id, dt) {
    const handle = intervalsRef.current.get(id);
    if (!handle) return;

    setTimers(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const next = Math.max(0, t.remainingMs - dt);
        return { ...t, remainingMs: next };
      })
    );

    const current = timers.find(t => t.id === id);
    if (current && current.remainingMs - dt <= 0) {
      pauseTimer(id);
    }
  }

  function resetTimer(id) {
    pauseTimer(id);
    const t = timers.find(x => x.id === id);
    if (!t) return;
    updateTimer(id, { remainingMs: t.initialMs, isRunning: false });
  }

  function pauseAll() {
    if (activeTimerId) {
      pauseTimer(activeTimerId);
    }
  }

  return {
    motion, setMotion,
    timers, setTimers,
    activeTimerId,
    teams, setTeams, addTeam, removeTeam, 
    addTimer, updateTimer, removeTimer,
    reorderTimer,
    startTimer, pauseTimer, pauseAll, resetTimer
  };
}
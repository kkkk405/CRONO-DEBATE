import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { sanitizeText, sanitizeTeamName, sanitizeMotion } from "../utils/sanitize";

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
  const [timers, setTimers] = useState(() => validateTimers(stored));
  const [teams, setTeams] = useState(() => validateTeams(stored));

  const [activeTimerId, setActiveTimerId] = useState(null);
  const intervalsRef = useRef(new Map());

  function addTeam(name) {
    const cleaned = sanitizeTeamName(name);
    if (!cleaned) return;
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
    updateTimer(id, { remainingMs: t.initialMs });
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
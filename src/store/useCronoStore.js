import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

export function useCronoStore(format) {
  // Clave dinámica según formato
  const STORAGE_KEY = `cronoDebate:${format}`;

  // Inicializamos directamente desde localStorage
  const [motion, setMotion] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return "";
    try {
      return JSON.parse(raw).motion || "";
    } catch {
      return "";
    }
  });

  const [timers, setTimers] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return (JSON.parse(raw).timers || []).map(t => ({
        ...t,
        isRunning: false,
        team: t.team || "",
        side: t.side || "Proposición"
      }));
    } catch {
      return [];
    }
  });

  const [teams, setTeams] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw).teams || [];
    } catch {
      return [];
    }
  });

  const [activeTimerId, setActiveTimerId] = useState(null);
  const intervalsRef = useRef(new Map());

  // agregar equipo
  function addTeam(name) {
    if (!name.trim()) return;
    setTeams(prev => [...prev, name.trim()]);
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
      name,
      initialMs,
      remainingMs: initialMs,
      order: timers.length,
      isRunning: false,
      team,
      side
    };
    setTimers(prev => [...prev, newTimer]);
  }

  function updateTimer(id, patch) {
    setTimers(prev =>
      prev.map(t => (t.id === id ? { ...t, ...patch } : t))
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
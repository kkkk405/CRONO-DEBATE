export function parseMMSSToMs(mmss) {
    const [mm, ss] = mmss.split(":").map(Number);
    if (
      Number.isNaN(mm) || Number.isNaN(ss) ||
      mm < 0 || mm > 59 ||
      ss < 0 || ss > 59
    ) return null;
    return (mm * 60 + ss) * 1000;
  }
  
  export function formatMMSS(ms) {
    const s = Math.floor(ms / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }
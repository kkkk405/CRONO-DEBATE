export function sanitizeText(value) {
  if (typeof value !== "string") return "";
  return value
    .slice(0, 30)
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "");
}

export function sanitizeTeamName(value) {
  if (typeof value !== "string") return "";
  return value
    .slice(0, 30)
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "");
}

export function sanitizeMotion(value) {
  if (typeof value !== "string") return "";
  return value
    .slice(0, 300)
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "");
}

export function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

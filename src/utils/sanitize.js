const MAX_STRING_LENGTH = 500;

export function sanitizeText(value) {
  if (typeof value !== "string") return "";
  return value
    .slice(0, MAX_STRING_LENGTH)
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

export function sanitizeTeamName(value) {
  if (typeof value !== "string") return "";
  return value
    .slice(0, 100)
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

export function sanitizeMotion(value) {
  if (typeof value !== "string") return "";
  return value
    .slice(0, MAX_STRING_LENGTH)
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
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

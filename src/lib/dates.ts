// Session dates are stored as "YYYY-MM-DD" and typed as "DD/MM/YYYY".
// Everything here uses the phone's local date, not UTC. In Irish summer time,
// UTC is an hour behind, so a session logged just after midnight would
// otherwise be saved with the day before.

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function todayIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// "2026-11-09" -> "09/11/2026"
export function isoToDisplay(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

// "9/11/2026" or "09/11/2026" -> "2026-11-09". Returns null for anything that
// isn't a real date, like 31/02/2026.
export function parseDisplayDate(text: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!match) {
    return null;
  }

  const [day, month, year] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  // Date rolls an impossible day over into the next month, so check it didn't.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function validateSessionDate(text: string, today: string = todayIso()): string | null {
  const iso = parseDisplayDate(text);
  if (iso === null) {
    return "Enter the date as DD/MM/YYYY.";
  }
  // ISO dates sort as text, so a plain comparison works.
  return iso > today ? "The date can't be in the future." : null;
}

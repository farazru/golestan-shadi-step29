// Iranian school year runs roughly 1 Mehr (23 Sep) through the following June.
// We treat 1 September as the start of a new academic year so "semester"
// records line up with how staff talk about a year.

export function academicYearRange(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const startYear = month >= 8 ? year : year - 1; // Sept (8) or later
  const start = new Date(startYear, 8, 1);
  const end = new Date(startYear + 1, 7, 31, 23, 59, 59, 999);
  return {
    startYear,
    label: `${startYear}–${startYear + 1}`,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export function todayIsoDate(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateOnly(iso: string | null | undefined) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

/** Academic year shown on the public site and calendars. */
export const ACADEMIC_YEAR = "۱۴۰۵–۱۴۰۶";
export const ACADEMIC_YEAR_LATIN = "1405-1406";

export function todayJalaliParts(d = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

export function jalaliMonthDay(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (Number.isNaN(d.getTime())) return null;
  const p = todayJalaliParts(d);
  return { month: p.month, day: p.day };
}

export function isBirthdayToday(iso?: string | null, now = new Date()) {
  const b = jalaliMonthDay(iso);
  if (!b) return false;
  const t = todayJalaliParts(now);
  return b.month === t.month && b.day === t.day;
}

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

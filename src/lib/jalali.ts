export function formatJalali(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    try {
      return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(iso.slice(0, 10)));
    } catch {
      return iso.slice(0, 10);
    }
  }
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatJalaliDateInput(isoDate: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(new Date(isoDate + "T12:00:00"));
  } catch {
    return isoDate;
  }
}

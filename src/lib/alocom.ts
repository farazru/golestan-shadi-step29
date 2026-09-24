export function isAlocomUrl(raw: string) {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:") return false;
    const host = u.hostname.replace(/^www\./, "");
    return host === "alocom.co" || host.endsWith(".alocom.co");
  } catch {
    return false;
  }
}

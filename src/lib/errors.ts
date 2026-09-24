export function errorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object" && err && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

export function authErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err && "body" in err) {
    const body = (err as { body?: { message?: unknown } }).body;
    if (typeof body?.message === "string" && body.message) return body.message;
  }
  const message = errorMessage(err, "");
  if (message.includes("unique")) return "این کد ملی قبلاً ثبت شده است.";
  return message || fallback;
}

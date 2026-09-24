"use client";

import { useState } from "react";

export function PreForm() {
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/preregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "ارسال نشد. دوباره تلاش کنید.");
        return;
      }
      setOk(true);
    } catch {
      setError("ارتباط برقرار نشد. اتصال اینترنت را بررسی کنید.");
    } finally {
      setPending(false);
    }
  }

  if (ok) return <p className="mt-4 text-sm">درخواست ثبت شد. دفتر مدرسه تماس می‌گیرد.</p>;

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
      <input name="childName" required placeholder="نام فرزند" className="field rounded-xl px-3 py-2" />
      <input name="parentName" placeholder="نام ولی" className="field rounded-xl px-3 py-2" />
      <input name="phone" required placeholder="تلفن" className="field rounded-xl px-3 py-2" />
      <input name="grade" placeholder="پایه مورد نظر" className="field rounded-xl px-3 py-2" />
      <textarea name="note" placeholder="توضیح" className="field rounded-xl px-3 py-2" />
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary rounded-full px-4 py-2 disabled:opacity-60">
        {pending ? "در حال ارسال…" : "ارسال"}
      </button>
    </form>
  );
}

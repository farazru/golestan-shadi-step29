"use client";

import { FormEvent, useState } from "react";

export function RegisterForm() {
  const [code, setCode] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/register", { method: "POST", body: form });
    setPending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "ارسال نشد.");
      return;
    }
    const d = await res.json();
    setCode(d.trackingCode);
  }

  if (code) {
    return (
      <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
        <p>درخواست ثبت شد.</p>
        <p className="mt-2 font-bold">کد پیگیری: {code}</p>
        <p className="mt-1">این کد را نگه دارید. دفتر با شما تماس می‌گیرد.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
      <input name="childName" required placeholder="نام و نام خانوادگی فرزند" className="field rounded-2xl px-3 py-2" />
      <input name="parentName" required placeholder="نام والد" className="field rounded-2xl px-3 py-2" />
      <input name="phone" required placeholder="تلفن همراه" className="field rounded-2xl px-3 py-2" dir="ltr" />
      <input name="grade" placeholder="پایه مورد نظر" className="field rounded-2xl px-3 py-2" />
      <label className="text-sm">
        مدارک (شناسنامه یا کارت ملی)
        <input name="file" type="file" accept="image/*,.pdf" className="mt-1 block w-full text-sm" />
      </label>
      <button disabled={pending} className="btn-primary self-start rounded-full px-5 py-2 text-sm">
        {pending ? "…" : "ثبت‌نام و دریافت کد پیگیری"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}

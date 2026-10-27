"use client";

import { FormEvent, useState } from "react";

export function LanguageForm() {
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/language-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        age: form.get("age"),
        level: form.get("level"),
        preferredDays: form.get("preferredDays"),
        note: form.get("note"),
      }),
    });
    setPending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "ارسال نشد.");
      return;
    }
    setOk(true);
  }

  if (ok) {
    return (
      <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
        درخواست ثبت شد. دفتر مدرسه به‌زودی تماس می‌گیرد.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
      <input name="name" required placeholder="نام و نام خانوادگی" className="field rounded-2xl px-3 py-2" />
      <input name="phone" required placeholder="تلفن همراه" className="field rounded-2xl px-3 py-2" dir="ltr" />
      <input name="age" placeholder="سن" className="field rounded-2xl px-3 py-2" />
      <select name="level" className="field rounded-2xl px-3 py-2">
        <option value="">سطح فعلی</option>
        <option value="beginner">مبتدی</option>
        <option value="elementary">مقدماتی</option>
        <option value="intermediate">متوسط</option>
        <option value="advanced">پیشرفته</option>
      </select>
      <input name="preferredDays" placeholder="روزهای ترجیحی (مثلاً شنبه و دوشنبه)" className="field rounded-2xl px-3 py-2" />
      <textarea name="note" placeholder="توضیح کوتاه (اختیاری)" className="field rounded-2xl px-3 py-2" />
      <button type="submit" disabled={pending} className="btn-primary self-start rounded-full px-5 py-2 text-sm">
        {pending ? "…" : "ارسال درخواست"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}

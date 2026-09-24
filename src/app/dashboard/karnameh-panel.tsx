"use client";

import { useEffect, useState } from "react";

type Item = { id: number; title: string; fileUrl: string; fileName: string | null };

export function KarnamehPanel({
  studentId,
  canUpload,
  students,
}: {
  studentId?: string;
  canUpload?: boolean;
  students?: { id: string; firstName: string; lastName: string }[];
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  function load(id?: string) {
    const q = id ? `?studentId=${id}` : studentId ? `?studentId=${studentId}` : "";
    fetch("/api/report-cards" + q)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    const q = studentId ? `?studentId=${studentId}` : "";
    fetch("/api/report-cards" + q)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, [studentId]);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/report-cards", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "بارگذاری شد." : data.error ?? "ناموفق");
    if (res.ok) {
      e.currentTarget.reset();
      load(String(fd.get("studentId") ?? ""));
    }
  }

  return (
    <section className="dash-card">
      <h2>کارنامه</h2>
      {items.length === 0 ? (
        <p className="empty">هنوز کارنامه‌ای بارگذاری نشده. دفتر فایل را در همین بخش می‌گذارد.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{it.title}</span>
              <a className="btn-primary rounded-full px-3 py-1 text-xs" href={it.fileUrl} download>
                دانلود
              </a>
            </li>
          ))}
        </ul>
      )}
      {canUpload ? (
        <form onSubmit={onUpload} className="mt-4 flex flex-col gap-2">
          <select name="studentId" required className="field rounded-xl px-3 py-2 text-sm">
            <option value="">دانش‌آموز</option>
            {(students ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
          <input name="title" placeholder="عنوان کارنامه" className="field rounded-xl px-3 py-2 text-sm" />
          <input name="file" type="file" required accept=".pdf,image/*" className="text-sm" />
          <button className="btn-primary rounded-full px-4 py-2 text-sm">بارگذاری کارنامه</button>
          {msg ? <p className="text-sm">{msg}</p> : null}
        </form>
      ) : null}
    </section>
  );
}

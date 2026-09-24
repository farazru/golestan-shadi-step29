"use client";

import { useEffect, useState } from "react";

type Exam = { id: number; title: string; day: string; note: string | null; courseId: number | null };
type Course = { id: number; name: string };

export function ExamsClient() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => setExams(d.exams ?? []));
  }

  useEffect(() => {
    refresh();
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) =>
        setCourses(
          (d.courses ?? []).map((c: { id: number; name: string }) => ({ id: c.id, name: c.name })),
        ),
      );
    fetch("/api/auth/get-session")
      .then((r) => r.json())
      .then((d) => setRole(d?.user?.role ?? null))
      .catch(() => {});
  }, []);

  const canManage = role === "teacher" || role === "manager" || role === "deputy";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        day: form.get("day"),
        note: form.get("note"),
        courseId: form.get("courseId") || null,
      }),
    });
    setPending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "افزودن امتحان انجام نشد.");
      return;
    }
    e.currentTarget.reset();
    refresh();
  }

  async function remove(id: number) {
    await fetch(`/api/exams?id=${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <>
      {exams.length === 0 ? (
        <p className="mt-4 text-sm">هنوز برنامه‌ای ثبت نشده.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {exams.map((e) => (
            <li key={e.id} className="school-card flex items-center justify-between rounded-xl p-3 text-sm">
              <span>
                {e.day} · {e.title}
                {e.note ? <span className="text-teal-700/60"> — {e.note}</span> : null}
              </span>
              {canManage ? (
                <button onClick={() => remove(e.id)} className="text-xs text-red-600 underline">
                  حذف
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canManage ? (
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-2 rounded-xl border border-teal-100 p-4">
          <p className="text-sm font-medium">افزودن امتحان</p>
          <input name="title" placeholder="عنوان امتحان" required className="rounded-md border border-teal-200 px-3 py-2 text-sm" />
          <input name="day" type="date" required className="rounded-md border border-teal-200 px-3 py-2 text-sm" />
          <select name="courseId" defaultValue="" className="rounded-md border border-teal-200 px-3 py-2 text-sm">
            <option value="">(بدون دوره مشخص)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input name="note" placeholder="توضیح (اختیاری)" className="rounded-md border border-teal-200 px-3 py-2 text-sm" />
          <button type="submit" disabled={pending} className="self-start rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {pending ? "در حال ثبت…" : "افزودن"}
          </button>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </form>
      ) : null}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { WEEKDAYS, PERIODS } from "@/lib/periods";

type Slot = {
  id: number;
  courseId: number;
  weekday: number;
  period: number;
  courseName: string;
  grade: string;
  teacherId: string;
};

export function TimetableGrid() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    fetch("/api/timetable")
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []));
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

  const canEdit = role === "teacher" || role === "manager";

  async function addSlot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: Number(form.get("courseId")),
        weekday: Number(form.get("weekday")),
        period: Number(form.get("period")),
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "افزودن زنگ انجام نشد.");
      return;
    }
    e.currentTarget.reset();
    refresh();
  }

  function cellSlots(weekdayIdx: number, period: number) {
    return slots.filter((s) => s.weekday === weekdayIdx && s.period === period);
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-teal-950">برنامه هفتگی</h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-teal-100 bg-teal-50 p-2">زنگ</th>
              {WEEKDAYS.map((day, i) => (
                <th key={i} className="border border-teal-100 bg-teal-50 p-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((p) => (
              <tr key={p.period}>
                <td className="border border-teal-100 p-2 text-xs text-teal-900/70">
                  {p.label}
                  <br />
                  {p.startTime}–{p.endTime}
                </td>
                {WEEKDAYS.map((_, weekdayIdx) => (
                  <td key={weekdayIdx} className="border border-teal-100 p-2 align-top">
                    {cellSlots(weekdayIdx, p.period).map((s) => (
                      <div key={s.id} className="rounded-md bg-teal-100 px-2 py-1 text-xs">
                        {s.courseName}
                        <div className="text-teal-700/60">{s.grade}</div>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canEdit ? (
        <form onSubmit={addSlot} className="mt-6 flex flex-wrap items-end gap-2 rounded-xl border border-teal-100 p-4">
          <p className="w-full text-sm font-medium">افزودن زنگ به برنامه</p>
          <select name="courseId" required defaultValue="" className="rounded-md border border-teal-200 px-3 py-2 text-sm">
            <option value="" disabled>
              دوره
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select name="weekday" required className="rounded-md border border-teal-200 px-3 py-2 text-sm">
            {WEEKDAYS.map((d, i) => (
              <option key={i} value={i}>
                {d}
              </option>
            ))}
          </select>
          <select name="period" required className="rounded-md border border-teal-200 px-3 py-2 text-sm">
            {PERIODS.map((p) => (
              <option key={p.period} value={p.period}>
                {p.label}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white">
            افزودن
          </button>
          {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
        </form>
      ) : null}
    </>
  );
}

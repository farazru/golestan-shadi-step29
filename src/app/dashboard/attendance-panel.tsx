"use client";

import { useEffect, useMemo, useState } from "react";
import { todayIsoDate } from "@/lib/semester";

type RosterStudent = { id: string; firstName: string; lastName: string };
type CourseSession = {
  id: number;
  name: string;
  grade: string;
  sessionId: number | null;
  roster: RosterStudent[];
};

type DailyRecord = {
  id: number;
  status: "present" | "absent" | "late";
  recordedAt: string | null;
  studentId: string;
  firstName: string;
  lastName: string;
  grade: string | null;
  courseName: string;
};

type SemesterRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  grade: string | null;
  present: number;
  absent: number;
  late: number;
  total: number;
};

const statusLabel = {
  present: "حاضر",
  absent: "غایب",
  late: "تأخیر",
} as const;

export function TeacherAttendancePanel({ courses }: { courses: CourseSession[] }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function mark(sessionId: number, studentId: string, status: keyof typeof statusLabel) {
    const key = `${sessionId}-${studentId}`;
    setBusy(key);
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classSessionId: sessionId, studentId, status }),
    });
    setBusy(null);
  }

  if (courses.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">حضور و غیاب</h2>
      {courses.map((c) => (
        <div key={c.id} className="rounded-xl border border-teal-100 p-4 ">
          <p className="font-medium">
            {c.name} <span className="text-xs text-teal-700/50">({c.grade})</span>
          </p>
          {!c.sessionId ? (
            <p className="mt-2 text-sm text-teal-800/60">جلسه‌ای برای این دوره ساخته نشده.</p>
          ) : c.roster.length === 0 ? (
            <p className="mt-2 text-sm text-teal-800/60">هنوز دانش‌آموزی ثبت‌نام نشده.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {c.roster.map((s) => {
                const key = `${c.sessionId}-${s.id}`;
                return (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span>
                      {s.firstName} {s.lastName}
                    </span>
                    <div className="flex gap-1">
                      {(["present", "absent", "late"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          disabled={busy === key}
                          onClick={() => void mark(c.sessionId!, s.id, st)}
                          className="rounded-full border border-teal-200 px-2 py-0.5 text-xs "
                        >
                          {statusLabel[st]}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}

export function ManagerAttendancePanel() {
  const [view, setView] = useState<"daily" | "semester">("daily");
  const [date, setDate] = useState(todayIsoDate());
  const [daily, setDaily] = useState<DailyRecord[] | null>(null);
  const [semester, setSemester] = useState<{ year: string; summary: SemesterRow[] } | null>(null);

  useEffect(() => {
    if (view === "daily") {
      fetch(`/api/attendance?view=daily&date=${date}`)
        .then((r) => r.json())
        .then((d) => setDaily(d.records ?? []))
        .catch(() => setDaily([]));
    } else {
      fetch("/api/attendance?view=semester")
        .then((r) => r.json())
        .then((d) => setSemester({ year: d.year, summary: d.summary ?? [] }))
        .catch(() => setSemester({ year: "", summary: [] }));
    }
  }, [view, date]);

  const dailyCounts = useMemo(() => {
    if (!daily) return null;
    return {
      present: daily.filter((r) => r.status === "present").length,
      absent: daily.filter((r) => r.status === "absent").length,
      late: daily.filter((r) => r.status === "late").length,
    };
  }, [daily]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">حضور و غیاب</h2>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setView("daily")}
            className={`rounded-full px-3 py-1 ${view === "daily" ? "bg-teal-700 text-white " : "border border-teal-200 "}`}
          >
            روزانه
          </button>
          <button
            type="button"
            onClick={() => setView("semester")}
            className={`rounded-full px-3 py-1 ${view === "semester" ? "bg-teal-700 text-white " : "border border-teal-200 "}`}
          >
            سال تحصیلی
          </button>
        </div>
      </div>

      {view === "daily" ? (
        <>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-fit rounded-md border border-teal-200 bg-white px-3 py-1 text-sm  "
          />
          {daily === null ? (
            <p className="text-sm text-teal-800/60">در حال بارگذاری…</p>
          ) : daily.length === 0 ? (
            <p className="text-sm text-teal-800/60">برای این روز رکوردی نیست.</p>
          ) : (
            <>
              {dailyCounts ? (
                <p className="text-sm text-teal-800/60">
                  حاضر {dailyCounts.present} · غایب {dailyCounts.absent} · تأخیر {dailyCounts.late}
                </p>
              ) : null}
              <ul className="flex flex-col gap-2">
                {daily.map((r) => (
                  <li
                    key={r.id}
                    className="flex justify-between rounded-lg border border-teal-100 p-3 text-sm "
                  >
                    <span>
                      {r.firstName} {r.lastName}
                      <span className="text-teal-700/50"> · {r.courseName}</span>
                    </span>
                    <span>{statusLabel[r.status]}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : semester === null ? (
        <p className="text-sm text-teal-800/60">در حال بارگذاری…</p>
      ) : (
        <>
          <p className="text-sm text-teal-800/60">سال تحصیلی {semester.year}</p>
          {semester.summary.length === 0 ? (
            <p className="text-sm text-teal-800/60">هنوز رکوردی برای امسال نیست.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-teal-100 text-teal-800/60 ">
                    <th className="py-2 font-medium">دانش‌آموز</th>
                    <th className="py-2 font-medium">پایه</th>
                    <th className="py-2 font-medium">حاضر</th>
                    <th className="py-2 font-medium">غایب</th>
                    <th className="py-2 font-medium">تأخیر</th>
                    <th className="py-2 font-medium">کل</th>
                  </tr>
                </thead>
                <tbody>
                  {semester.summary.map((s) => (
                    <tr key={s.studentId} className="border-b border-zinc-100 dark:border-zinc-900">
                      <td className="py-2">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="py-2">{s.grade ?? "—"}</td>
                      <td className="py-2">{s.present}</td>
                      <td className="py-2">{s.absent}</td>
                      <td className="py-2">{s.late}</td>
                      <td className="py-2">{s.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

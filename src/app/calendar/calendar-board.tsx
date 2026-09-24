"use client";

import { useMemo, useState } from "react";
import { JALALI_MONTHS, todayJalaliParts } from "@/lib/year";

type Ev = { id: number; title: string; day: string; kind: string };

function daysInJalaliMonth(year: number, month: number) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return year % 4 === 3 ? 30 : 29;
}

function parseDay(day: string) {
  const m = day.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  return { y: Number(m[1]), mo: Number(m[2]), d: Number(m[3]) };
}

export function CalendarBoard({
  initial,
  canManage,
}: {
  initial: Ev[];
  canManage: boolean;
}) {
  const now = todayJalaliParts();
  const [year, setYear] = useState(now.year);
  const [month, setMonth] = useState(now.month);
  const [events, setEvents] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(now.day);

  const dim = daysInJalaliMonth(year, month);
  const byDay = useMemo(() => {
    const map: Record<number, Ev[]> = {};
    for (const e of events) {
      const p = parseDay(e.day);
      if (!p || p.y !== year || p.mo !== month) continue;
      (map[p.d] ??= []).push(e);
    }
    return map;
  }, [events, year, month]);

  function shift(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/calendar-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(fd.get("title") ?? ""),
        day: String(fd.get("day") ?? ""),
        kind: String(fd.get("kind") ?? "event"),
        remind: fd.get("remind") === "on",
      }),
    });
    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "ثبت نشد.");
      return;
    }
    const data = await res.json();
    if (data.item) setEvents((prev) => [...prev, data.item]);
    e.currentTarget.reset();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <button type="button" className="btn-secondary rounded-full px-3 py-2 text-sm" onClick={() => shift(-1)}>
          ماه قبل
        </button>
        <p className="text-lg font-extrabold text-[#084843]">
          {JALALI_MONTHS[month - 1]} {year}
        </p>
        <button type="button" className="btn-secondary rounded-full px-3 py-2 text-sm" onClick={() => shift(1)}>
          ماه بعد
        </button>
      </div>

      <div className="-mx-1 overflow-x-auto pb-2">
      <div className="grid min-w-[520px] grid-cols-7 gap-1 text-center text-xs font-bold text-ink md:min-w-0">
        {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
        {Array.from({ length: dim }, (_, i) => i + 1).map((d) => {
          const list = byDay[d] ?? [];
          const isToday = year === now.year && month === now.month && d === now.day;
          return (
            <div
              key={d}
              role="button"
              tabIndex={0}
              onClick={() => setPicked(d)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setPicked(d);
              }}
              className={`min-h-11 cursor-pointer rounded-xl border-2 p-1 text-right md:min-h-16 ${
                list.length ? "border-[#E9785B] bg-[#FCEBE6]" : "border-[#D9E7E5] bg-white"
              } ${isToday ? "ring-2 ring-[#F4B942]" : ""} ${picked === d ? "outline outline-2 outline-[#126E72]" : ""}`}
            >
              <span className="text-xs font-extrabold">{d}</span>
              {list.map((ev) => (
                <p key={ev.id} className="mt-0.5 truncate text-[10px] font-bold text-[#084843]">
                  {ev.title}
                </p>
              ))}
            </div>
          );
        })}
      </div>
      </div>

      {picked ? (
        <p className="text-sm">
          روز {picked} {JALALI_MONTHS[month - 1]}:{" "}
          {(byDay[picked] ?? []).length ? (byDay[picked] ?? []).map((e) => e.title).join("، ") : "رویدادی نیست."}
        </p>
      ) : null}

      {events.filter((e) => {
        const p = parseDay(e.day);
        return p && p.y === year && p.mo === month;
      }).length === 0 ? (
        <p className="text-sm">در این ماه رویدادی نیست.</p>
      ) : null}

      {canManage ? (
        <form onSubmit={onAdd} className="school-card flex flex-col gap-2 rounded-2xl p-4">
          <p className="font-bold">ثبت رویداد برای همه</p>
          <input name="title" required placeholder="عنوان" className="field rounded-xl px-3 py-2 text-sm" />
          <input name="day" required placeholder="۱۴۰۵-۰۷-۱۵" className="field rounded-xl px-3 py-2 text-sm" />
          <select name="kind" className="field rounded-xl px-3 py-2 text-sm">
            <option value="event">رویداد</option>
            <option value="holiday">تعطیل</option>
            <option value="exam">امتحان</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="remind" />
            یادآور و پیام برای همه
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button disabled={pending} className="btn-primary rounded-full px-4 py-2 text-sm">
            {pending ? "…" : "ثبت روی تقویم"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
